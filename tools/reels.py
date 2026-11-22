#!/usr/bin/env python3
"""Reel frames for phone cards: /posters/<slug>-d2.webp, -d3.webp, -m2.webp, -m3.webp.

Phones do not run live sites inside the menu cards (too heavy while scrolling). Instead each card plays
a light "reel": the still poster (frame 1) and two more screens from further down the same demo,
cross-fading on the compositor. These are those extra screens.

Usage: python3 tools/reels.py [slug ...]   (default: every built demo in w/)
"""
import asyncio, fcntl, functools, os, sys, threading
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from PIL import Image

ROOT = '/home/claude/hdm'
OUT = os.path.join(ROOT, 'posters')
STOPS = (('2', 0.30), ('3', 0.62))   # frame name, share of the scrollable height


class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


SCROLL = '''(y) => { const l = window.__lenis; if (l && l.scrollTo) l.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y); }'''


async def shoot(b, port, slug):
    from playwright.async_api import TimeoutError as PWT
    res = []
    for kind, vp, dpr, mob in (('d', (1280, 800), 1, False), ('m', (390, 844), 2, True)):
        ctx = await b.new_context(viewport={'width': vp[0], 'height': vp[1]}, device_scale_factor=dpr, is_mobile=mob, has_touch=mob)
        pg = await ctx.new_page()
        url = 'http://127.0.0.1:%d/w/%s/?embed=1&v=%s&lite=%d' % (port, slug, kind, 1 if mob else 0)
        try:
            await pg.goto(url, wait_until='load', timeout=90000)
            try:
                await pg.wait_for_function("document.documentElement.classList.contains('hx-ready')", timeout=12000)
            except PWT:
                pass
            await pg.wait_for_timeout(2200)
            H = await pg.evaluate('Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) - innerHeight')
            for name, p in STOPS:
                y = int(max(0, H) * p)
                await pg.evaluate(SCROLL, y)
                await pg.wait_for_timeout(2600)
                tmp = '/tmp/reel_%s_%s%s.png' % (slug, kind, name)
                await pg.screenshot(path=tmp, timeout=60000)
                im = Image.open(tmp).convert('RGB')
                w = 720 if kind == 'd' else 300
                im = im.resize((w, int(im.height * w / im.width)), Image.LANCZOS)
                dst = os.path.join(OUT, '%s-%s%s.webp' % (slug, kind, name))
                im.save(dst, 'WEBP', quality=70, method=6)
                res.append('%s%s %dKB' % (kind, name, os.path.getsize(dst) // 1024))
        except Exception as e:
            res.append('%s FAILED %s' % (kind, str(e)[:120]))
        await ctx.close()
    print(slug, ' | '.join(res), flush=True)


async def main():
    os.makedirs(OUT, exist_ok=True)
    slugs = sys.argv[1:] or sorted(d for d in os.listdir(os.path.join(ROOT, 'w')) if os.path.exists(os.path.join(ROOT, 'w', d, 'index.html')))
    from playwright.async_api import async_playwright
    lock = open('/tmp/hx-chromium.lock', 'w')
    fcntl.flock(lock, fcntl.LOCK_EX)
    srv = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    try:
        async with async_playwright() as pw:
            proxy = {'server': os.environ['HTTPS_PROXY'], 'bypass': '127.0.0.1,localhost'} if os.environ.get('HTTPS_PROXY') else None
            b = await pw.chromium.launch(proxy=proxy, args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'])
            for s in slugs:
                await shoot(b, srv.server_address[1], s)
            await b.close()
    finally:
        srv.shutdown()
        fcntl.flock(lock, fcntl.LOCK_UN)


if __name__ == '__main__':
    asyncio.run(main())
