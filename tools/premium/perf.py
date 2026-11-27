#!/usr/bin/env python3
"""Premium film templates: scroll smoothness under a 4x CPU throttle, the way a slow phone feels it.
Usage: python3 tools/premium/perf.py <slug> [...]      (exit code 1 if any frame took longer than 34 ms)
Each page is scrolled top to bottom and back with a real scroll gesture (touch at 390x664, wheel at 1280x800)
while a requestAnimationFrame loop in the page records the time between frames. The first second after load
is not counted (fonts and first frames arriving); everything during the scroll is."""
import asyncio, fcntl, functools, json, os, sys, threading
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
ROOT = os.path.realpath(os.path.join(os.path.dirname(__file__), '..', '..'))
LIMIT = 34.0
class Q(SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def translate_path(self, path): return super().translate_path(path[8:] if path.startswith('/factory/') else path)
REC = '''() => { window.__ft = []; let last = performance.now(); (function f(t) { window.__ft.push(t - last); if (t - last > 34) (window.__fy = window.__fy || []).push(Math.round(scrollY) + ':' + Math.round(t - last)); last = t; requestAnimationFrame(f); })(last); }'''
async def run(b, port, slug, tag, vp, mob, rate):
    ctx = await b.new_context(viewport={'width': vp[0], 'height': vp[1]}, device_scale_factor=2 if mob else 1, is_mobile=mob, has_touch=mob)
    pg = await ctx.new_page()
    if os.environ.get('HX_BLOCK'): await pg.route('**/*' + os.environ['HX_BLOCK'] + '*', lambda r: r.abort())
    await pg.goto(slug if slug.startswith('http') else ('http://127.0.0.1:%d%s' % (port, slug)) if slug.startswith('/') else ('http://127.0.0.1:%d/factory/w/%s/' % (port, slug)), wait_until='load'); await pg.wait_for_timeout(2500)
    if os.environ.get('HX_CSS'): await pg.add_style_tag(content=os.environ['HX_CSS'])
    if os.environ.get('HX_JS'): await pg.evaluate(os.environ['HX_JS'])
    cdp = await ctx.new_cdp_session(pg)
    await cdp.send('Emulation.setCPUThrottlingRate', {'rate': rate})
    H = await pg.evaluate('document.documentElement.scrollHeight - innerHeight')
    await pg.wait_for_timeout(600); await pg.evaluate(REC); await pg.wait_for_timeout(300)
    kind = 'touch' if mob else 'mouse'
    for dist, speed in ((-H, 1400), (H, 2200)):   # reading speed down, a fast flick back up
        await cdp.send('Input.synthesizeScrollGesture', {'x': vp[0] // 2, 'y': vp[1] // 2, 'yDistance': dist, 'speed': speed, 'gestureSourceType': kind, 'preventFling': True})
        await pg.wait_for_timeout(400)
    ft = await pg.evaluate('window.__ft.slice(3)')
    if os.environ.get('HX_JS'): print('   probe:', await pg.evaluate('JSON.stringify(window.__probe || null)'))
    if os.environ.get('HX_WHERE'): print('   where (scrollY:ms):', await pg.evaluate('(window.__fy || []).join(" ")'), '| page', H)
    await cdp.send('Emulation.setCPUThrottlingRate', {'rate': 1}); await ctx.close()
    ft.sort(); n = len(ft); over = [round(x, 1) for x in ft if x > LIMIT]
    print('%-8s %s %dx%d  frames %4d  median %.1f  p95 %.1f  p99 %.1f  max %.1f  over %dms: %d %s' % (slug, tag, vp[0], vp[1], n, ft[n // 2], ft[int(n * .95)], ft[int(n * .99)], ft[-1], LIMIT, len(over), over[-6:]))
    return len(over)
async def main(slugs, rate):
    from playwright.async_api import async_playwright
    srv = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
    lock = open('/tmp/hx-chromium.lock', 'w'); fcntl.flock(lock, fcntl.LOCK_EX)
    bad = 0
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        for slug in slugs:
            for tag, vp, mob in (('phone ', (390, 664), True), ('laptop', (1280, 800), False))[int(os.environ.get('HX_ONLY', 0)):]:
                bad += await run(b, srv.server_address[1], slug, tag, vp, mob, rate)
        await b.close()
    sys.exit(1 if bad else 0)
args = [a for a in sys.argv[1:] if not a.startswith('--')]
rate = next((float(a.split('=')[1]) for a in sys.argv[1:] if a.startswith('--rate=')), 4)
asyncio.run(main(args, rate))
