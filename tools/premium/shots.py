#!/usr/bin/env python3
"""Premium film templates: screenshots at 390x844 and 1280x800, through the film and down the page.
Usage: python3 tools/premium/shots.py <slug> [...]   ->  _qa/<slug>/premium-m.jpg and premium-d.jpg (contact sheets)"""
import asyncio, fcntl, functools, os, sys, threading
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from PIL import Image
ROOT = os.path.realpath(os.path.join(os.path.dirname(__file__), '..', '..'))
class Q(SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def translate_path(self, path):  # the site lives under /factory in production
        return super().translate_path(path[8:] if path.startswith('/factory/') else path)
async def main(slugs):
    from playwright.async_api import async_playwright
    srv = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
    lock = open('/tmp/hx-chromium.lock', 'w'); fcntl.flock(lock, fcntl.LOCK_EX)
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        for slug in slugs:
            out = os.path.join(ROOT, '_qa', slug); os.makedirs(out, exist_ok=True)
            for tag, vp, mob in (('m', (390, 844), True), ('d', (1280, 800), False)):
                ctx = await b.new_context(viewport={'width': vp[0], 'height': vp[1]}, device_scale_factor=1, is_mobile=mob, has_touch=mob)
                pg = await ctx.new_page(); errs = []
                pg.on('pageerror', lambda e: errs.append(str(e)[:200])); pg.on('response', lambda r: errs.append('HTTP %d %s' % (r.status, r.url[-60:])) if r.status >= 400 else None)
                await pg.goto('http://127.0.0.1:%d/factory/w/%s/' % (srv.server_address[1], slug), wait_until='load'); await pg.wait_for_timeout(2500)
                fh = await pg.evaluate("document.querySelector('.film').offsetHeight - innerHeight")
                H = await pg.evaluate("document.documentElement.scrollHeight - innerHeight")
                ys = [fh * f for f in (0, .37, .62, .93)] + [fh + (H - fh) * f for f in (.04, .2, .36, .52, .68, .84, 1)]
                ims = []
                for i, y in enumerate(ys):
                    await pg.evaluate('y => scrollTo(0, y)', y); await pg.wait_for_timeout(1300)
                    f = os.path.join(out, 'p%s_%02d.png' % (tag, i)); await pg.screenshot(path=f); ims.append(Image.open(f).convert('RGB'))
                w = 300 if mob else 640; ims = [im.resize((w, int(im.height * w / im.width))) for im in ims]
                cols = 6 if mob else 3; rows = -(-len(ims) // cols)
                sheet = Image.new('RGB', (cols * (w + 6), rows * (ims[0].height + 6)), (30, 30, 30))
                for i, im in enumerate(ims): sheet.paste(im, ((i % cols) * (w + 6), (i // cols) * (im.height + 6)))
                sheet.save(os.path.join(out, 'premium-%s.jpg' % tag), quality=80)
                print(slug, tag, 'errors:', errs[:5]); await ctx.close()
        await b.close()
asyncio.run(main(sys.argv[1:]))
