#!/usr/bin/env python3
"""Phone check in the real iPhone engine (WebKit) or Android's (Chromium): screens down each page, joined
into contact sheets of six, plus layout problems (sideways scroll, anything wider than the screen, errors).
Needs the local copy on :8811. WebKit is not preinstalled: PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD= python3 -m playwright install webkit (100 MB).

Usage: python3 tools/check/phone.py webkit 393 659 iphone / /websites/ /websites/glass/
       python3 tools/check/phone.py chromium 360 640 android /order/?d=glass
393x659 is an iPhone 15 in Safari with its toolbars; 360x640 a small Android phone.
Sheets: /home/claude/hdm/_qa/phone/<label>/sheet_<page>_<n>.jpg (look at them with Read).
"""
import asyncio, fcntl, json, os, sys
from playwright.async_api import async_playwright
from PIL import Image

B = 'http://127.0.0.1:8811'
eng, W, H, label = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
paths = sys.argv[5:]
OUT = f'/home/claude/hdm/_qa/phone/{label}'; os.makedirs(OUT, exist_ok=True)
UA_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1'
UA_AND = 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36'
PROBE = """() => {
  const vw = document.documentElement.clientWidth, out = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
    const cs = getComputedStyle(el); if (cs.position === 'fixed' && cs.visibility === 'hidden') continue;
    if (r.right > vw + 2 || r.left < -2) {
      // ignore things inside a horizontally scrolling rail or clipped parent
      let p = el.parentElement, clipped = false;
      while (p && p !== document.body) { const s = getComputedStyle(p); if (/(auto|scroll|hidden|clip)/.test(s.overflowX)) { const pr = p.getBoundingClientRect(); if (pr.right <= vw + 2 && pr.left >= -2) { clipped = true; break; } } p = p.parentElement; }
      if (!clipped) out.push((el.id ? '#' + el.id : el.tagName.toLowerCase() + '.' + [...el.classList].slice(0, 2).join('.')) + ' ' + Math.round(r.left) + '..' + Math.round(r.right));
    }
  }
  return { sw: document.documentElement.scrollWidth, vw, H: document.documentElement.scrollHeight, wide: [...new Set(out)].slice(0, 12) };
}"""


async def main():
    lock = open('/tmp/hx-chromium.lock', 'w'); fcntl.flock(lock, fcntl.LOCK_EX)
    res = {}
    async with async_playwright() as pw:
        bt = pw.webkit if eng == 'webkit' else pw.chromium
        kw = {} if eng == 'webkit' else {'args': ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']}
        b = await bt.launch(**kw)
        ctx = await b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=2, is_mobile=True, has_touch=True,
                                  user_agent=UA_IOS if eng == 'webkit' else UA_AND, timezone_id='Asia/Kolkata', locale='en-IN')
        await ctx.route('https://formsubmit.co/**', lambda r: r.fulfill(status=200, body='{"success":"true"}'))
        for path in paths:
            name = path.strip('/').replace('/', '_').replace('?', '_').replace('=', '-') or 'home'
            p = await ctx.new_page(); errs = []
            p.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)[:200]))
            p.on('console', lambda m: errs.append('console: ' + m.text[:200]) if m.type == 'error' else None)
            await p.goto(B + path, wait_until='load', timeout=90000)
            await p.wait_for_timeout(3500)
            info = await p.evaluate(PROBE)
            Hs = info['H']; stops = []; y = 0
            while y < Hs - H + 1 and len(stops) < 18:
                stops.append(y); y += int(H * 0.82)
            if Hs > H and (not stops or stops[-1] < Hs - H): stops.append(Hs - H)
            files = []
            for i, y in enumerate(stops):
                await p.evaluate(f'window.scrollTo(0,{y})'); await p.wait_for_timeout(1300)
                f = f'{OUT}/{name}_{i:02d}.png'; await p.screenshot(path=f, scale='css'); files.append(f)
            res[path] = {'errs': errs[:6], **info, 'shots': len(files)}
            # contact sheets, 3 x 2
            for s in range(0, len(files), 6):
                ims = [Image.open(f) for f in files[s:s + 6]]
                sheet = Image.new('RGB', (W * 3 + 20, H * 2 + 10), (40, 40, 40))
                for k, im in enumerate(ims):
                    sheet.paste(im.convert('RGB'), ((k % 3) * (W + 10), (k // 3) * (H + 10)))
                sheet.save(f'{OUT}/sheet_{name}_{s // 6}.jpg', quality=82)
            await p.close()
        await b.close()
    print(json.dumps(res, indent=1))

asyncio.run(main())
