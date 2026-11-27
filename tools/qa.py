#!/usr/bin/env python3
"""QA a live website demo (or any page) in headless Chromium, desktop and phone.

Usage:
  python3 /home/claude/hdm/tools/qa.py <slug> [<slug> ...]         # pages at /w/<slug>/
  python3 /home/claude/hdm/tools/qa.py --path /websites/ --name websites
Options:
  --stops 0,0.15,0.3,0.5,0.7,0.85,1   scroll positions (fraction of page) to capture
  --no-tour                           skip the auto-tour check
  --wait 2500                         ms to wait after load before the first shot

Writes /home/claude/hdm/_qa/<name>/sheet.jpg (desktop row on top, phone row below),
the individual PNGs, and report.json. Prints a short report. Only one Chromium runs
at a time across all agents (a file lock), so several builders can call this safely.
"""
import argparse, asyncio, fcntl, json, os, sys, threading, functools
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

ROOT = '/home/claude/hdm'
OUT = os.path.join(ROOT, '_qa')
LOCK = '/tmp/hx-chromium.lock'
BAD_WORDS = ['lorem', 'ipsum', 'placeholder', 'todo', 'tbd', 'undefined', 'nan', '[object', '{{', 'insert ', 'your text', 'coming soon', 'xxx', 'sample text']


class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def translate_path(self, path):  # the site lives under /factory in production
        return super().translate_path(path[8:] if path.startswith('/factory/') else path)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


def serve():
    handler = functools.partial(Quiet, directory=ROOT)
    srv = ThreadingHTTPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, srv.server_address[1]


async def run_page(b, url, name, mobile, stops, wait, outdir):
    from playwright.async_api import TimeoutError as PWTimeout
    if mobile:
        ctx = await b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True,
                                  user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1')
    else:
        ctx = await b.new_context(viewport={'width': 1440, 'height': 900}, device_scale_factor=1)
    pg = await ctx.new_page()
    errs, fails = [], []
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)[:300]))
    pg.on('console', lambda m: errs.append(m.type + ': ' + m.text[:300]) if m.type == 'error' else None)
    pg.on('requestfailed', lambda r: fails.append(r.url[:200] + ' ' + (r.failure or '')))
    pg.on('response', lambda r: fails.append('HTTP %d %s' % (r.status, r.url[:200])) if r.status >= 400 else None)
    tag = 'm' if mobile else 'd'
    shots, info = [], {}
    try:
        await pg.goto(url, wait_until='load', timeout=90000)
    except PWTimeout:
        errs.append('load timeout (90s)')
    await pg.wait_for_timeout(wait)
    try:
        info = await pg.evaluate("""(VW) => {
          const de = document.documentElement;
          const txt = (document.body ? document.body.innerText : '');
          const imgs = [...document.images];
          const vvw = (window.visualViewport && visualViewport.width) || innerWidth;
          return { H: de.scrollHeight, W: de.scrollWidth, vw: innerWidth, title: document.title,
                   overflowX: de.scrollWidth > Math.min(innerWidth, vvw, VW) + 2,
                   brokenImages: imgs.filter(i => i.complete && i.naturalWidth === 0).map(i => i.currentSrc || i.src).slice(0, 8),
                   text: txt.slice(0, 60000), canvases: document.querySelectorAll('canvas').length };
        }""", 390 if mobile else 1440)
    except Exception as e:
        errs.append('evaluate failed: ' + str(e)[:200])
    H = info.get('H', 0)
    vh = 844 if mobile else 900
    for i, f in enumerate(stops):
        y = int(max(0, H - vh) * f)
        try:
            await pg.evaluate('y => { (window.__lenis||window.lenis) ? (window.__lenis||window.lenis).scrollTo(y,{immediate:true,force:true}) : window.scrollTo(0, y); }', y)
            await pg.wait_for_timeout(1400)
            p = os.path.join(outdir, '%s_%02d.png' % (tag, i))
            await pg.screenshot(path=p, timeout=45000)
            shots.append(p)
        except Exception as e:
            errs.append('shot %d failed: %s' % (i, str(e)[:160]))
    await ctx.close()
    return {'shots': shots, 'errors': errs[:30], 'failed': sorted(set(fails))[:30], 'info': info}


async def tour_check(b, url):
    ctx = await b.new_context(viewport={'width': 1280, 'height': 800}, device_scale_factor=1)
    pg = await ctx.new_page()
    sep = '&' if '?' in url else '?'
    try:
        await pg.goto(url + sep + 'embed=1&tour=1&v=d&dpr=0.6', wait_until='load', timeout=90000)
        await pg.wait_for_timeout(14000)
        y = await pg.evaluate('window.scrollY')
    except Exception as e:
        y = -1
    await ctx.close()
    return y


def contact_sheet(desk, mob, out):
    from PIL import Image
    rows = []
    for files, w in ((desk, 330), (mob, 150)):
        ims = []
        for f in files:
            try:
                im = Image.open(f).convert('RGB')
                ims.append(im.resize((w, int(im.height * w / im.width))))
            except Exception:
                pass
        if ims:
            H = max(i.height for i in ims)
            row = Image.new('RGB', (sum(i.width for i in ims) + 8 * (len(ims) - 1), H), (40, 40, 40))
            x = 0
            for im in ims:
                row.paste(im, (x, 0)); x += im.width + 8
            rows.append(row)
    if not rows:
        return None
    W = max(r.width for r in rows)
    sheet = Image.new('RGB', (W, sum(r.height for r in rows) + 10 * (len(rows) - 1)), (40, 40, 40))
    y = 0
    for r in rows:
        sheet.paste(r, (0, y)); y += r.height + 10
    sheet.save(out, quality=78)
    return out


def text_flags(text):
    t = (text or '')
    low = t.lower()
    flags = []
    for wd in BAD_WORDS:
        if wd in ('nan',):
            import re
            if re.search(r'\bnan\b', low):
                flags.append('word: NaN')
            continue
        if wd in low:
            flags.append('word: ' + wd.strip())
    if '—' in t:
        flags.append('em dash found (not allowed in copy)')
    if ' – ' in t:
        flags.append('spaced en dash used as a dash')
    return flags


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('slugs', nargs='*')
    ap.add_argument('--path')
    ap.add_argument('--name')
    ap.add_argument('--stops', default='0,0.12,0.25,0.4,0.55,0.7,0.85,1')
    ap.add_argument('--no-tour', action='store_true')
    ap.add_argument('--wait', type=int, default=2500)
    a = ap.parse_args()
    targets = []
    if a.path:
        targets.append((a.name or a.path.strip('/').replace('/', '_') or 'home', a.path))
    for s in a.slugs:
        targets.append((s, '/w/%s/' % s))
    if not targets:
        print(__doc__); return
    stops = [float(x) for x in a.stops.split(',')]
    from playwright.async_api import async_playwright
    lockf = open(LOCK, 'w')
    fcntl.flock(lockf, fcntl.LOCK_EX)
    srv, port = serve()
    try:
        async with async_playwright() as pw:
            b = await pw.chromium.launch(proxy={'server': os.environ.get('HTTPS_PROXY', ''), 'bypass': '127.0.0.1,localhost'} if os.environ.get('HTTPS_PROXY') else None,
                                         args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'])
            for name, path in targets:
                outdir = os.path.join(OUT, name)
                os.makedirs(outdir, exist_ok=True)
                for f in os.listdir(outdir):
                    if f.endswith('.png'):
                        os.remove(os.path.join(outdir, f))
                url = 'http://127.0.0.1:%d%s' % (port, path)
                dres = await run_page(b, url, name, False, stops, a.wait, outdir)
                mres = await run_page(b, url, name, True, stops, a.wait, outdir)
                ty = None if a.no_tour else await tour_check(b, url)
                sheet = contact_sheet(dres['shots'], mres['shots'], os.path.join(outdir, 'sheet.jpg'))
                rep = {
                    'name': name, 'url': path, 'sheet': sheet,
                    'desktop': {k: dres[k] for k in ('errors', 'failed')}, 'mobile': {k: mres[k] for k in ('errors', 'failed')},
                    'height_desktop': dres['info'].get('H'), 'height_mobile': mres['info'].get('H'),
                    'mobile_horizontal_overflow': mres['info'].get('overflowX'),
                    'broken_images': sorted(set((dres['info'].get('brokenImages') or []) + (mres['info'].get('brokenImages') or []))),
                    'text_flags': sorted(set(text_flags(dres['info'].get('text')) + text_flags(mres['info'].get('text')))),
                    'tour_scrolled_px_after_14s': ty,
                    'title': dres['info'].get('title'),
                }
                json.dump(rep, open(os.path.join(outdir, 'report.json'), 'w'), indent=1)
                print('== %s  %s' % (name, path))
                print('   sheet:', sheet)
                print('   title:', rep['title'], '| height d/m:', rep['height_desktop'], rep['height_mobile'])
                for k in ('desktop', 'mobile'):
                    for e in rep[k]['errors'][:8]:
                        print('   %s error: %s' % (k, e))
                    for e in rep[k]['failed'][:8]:
                        print('   %s failed: %s' % (k, e))
                if rep['mobile_horizontal_overflow']:
                    print('   PROBLEM: page scrolls sideways on phone')
                for f in rep['broken_images']:
                    print('   broken image:', f)
                for f in rep['text_flags']:
                    print('   text flag:', f)
                if ty is not None:
                    print('   tour check: scrolled to', ty, 'px' + ('' if (ty or 0) > 50 else '  PROBLEM: tour did not move'))
            await b.close()
    finally:
        srv.shutdown()
        fcntl.flock(lockf, fcntl.LOCK_UN)


if __name__ == '__main__':
    asyncio.run(main())
