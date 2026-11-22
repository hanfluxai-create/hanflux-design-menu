#!/usr/bin/env python3
"""Scroll smoothness on a slow phone: thumb-like scroll bursts with the CPU slowed 4x after load.
Prints frame-time p50/p95, frames over 50 ms (visible jank), long tasks and iframes created while scrolling.

Usage: python3 tools/check/scrollperf.py https://hanflux-design-menu.vercel.app /websites/
The numbers are noisy here (software GPU, 2 CPUs): judge a change by running the old and the new build side by
side a few times (serve the old commit from a git worktree on another port), not against fixed numbers.
22 Nov 2026, /websites/: p95 33 to 50 ms, 8 to 26 frames over 50 ms, 0 iframes, for both releases; home 0 over 50 ms.
"""
import asyncio, fcntl, os, sys, json
from playwright.async_api import async_playwright
BASE, PATH = sys.argv[1].rstrip('/'), sys.argv[2]
_lock = open('/tmp/hx-chromium.lock', 'w'); fcntl.flock(_lock, fcntl.LOCK_EX)
UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
INIT = """
window.__ft=[];window.__lt=[];window.__ifr=0;
new PerformanceObserver(l=>{for(const e of l.getEntries()) window.__lt.push(Math.round(e.duration))}).observe({type:'longtask',buffered:true});
new MutationObserver(ms=>{for(const m of ms) for(const n of m.addedNodes){ if(n.tagName==='IFRAME') window.__ifr++; }}).observe(document,{subtree:true,childList:true});
"""
RUN = """async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  let last = performance.now(), on = true;
  const tick = t => { window.__ft.push(t - last); last = t; if (on) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  const H = document.documentElement.scrollHeight - innerHeight;
  let y = 0;
  // scroll like a thumb: bursts of ~900px over ~0.8s, then a pause to look
  for (let k = 0; k < 9 && y < H; k++) {
    const start = performance.now(), from = y, to = Math.min(H, y + 900);
    await new Promise(res => { const step = () => { const u = Math.min(1, (performance.now() - start) / 800); const e = 1 - Math.pow(1 - u, 3); window.scrollTo(0, from + (to - from) * e); if (u < 1) requestAnimationFrame(step); else res(); }; requestAnimationFrame(step); });
    y = to; await sleep(1400);
  }
  on = false;
  const ft = window.__ft.slice(5).sort((a,b)=>a-b), q = p => ft[Math.min(ft.length-1, Math.floor(p*ft.length))];
  return { frames: ft.length, p50: +q(.5).toFixed(1), p95: +q(.95).toFixed(1), over50: ft.filter(x=>x>50).length, longtasks: window.__lt.length, lt_ms: window.__lt.reduce((a,b)=>a+b,0), lt_max: Math.max(0, ...window.__lt), iframes: window.__ifr };
}"""
async def main():
    async with async_playwright() as pw:
        px = os.environ.get('HTTPS_PROXY')
        b = await pw.chromium.launch(proxy={'server': px, 'bypass': '127.0.0.1,localhost'} if px else None, args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        ctx = await b.new_context(viewport={'width':390,'height':844}, device_scale_factor=2, is_mobile=True, has_touch=True, user_agent=UA)
        page = await ctx.new_page(); await page.add_init_script(INIT)
        cdp = await ctx.new_cdp_session(page)
        await cdp.send('Network.enable')
        await cdp.send('Network.emulateNetworkConditions', {'offline': False, 'latency': 60, 'downloadThroughput': 9*1024*1024/8, 'uploadThroughput': 1.5*1024*1024/8})
        tot = {'b': 0}
        cdp.on('Network.loadingFinished', lambda ev: tot.__setitem__('b', tot['b'] + ev.get('encodedDataLength', 0)))
        await page.goto(BASE + PATH, wait_until='load', timeout=90000)
        await page.wait_for_timeout(2500)
        await cdp.send('Emulation.setCPUThrottlingRate', {'rate': 4})
        start_b = tot['b']
        r = await page.evaluate(RUN)
        r['MB_during_scroll'] = round((tot['b'] - start_b) / 1048576, 2)
        r['MB_total'] = round(tot['b'] / 1048576, 2)
        print(json.dumps({'url': BASE + PATH, **r}))
        await b.close()
asyncio.run(main())
