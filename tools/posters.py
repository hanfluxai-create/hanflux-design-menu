#!/usr/bin/env python3
"""Still posters for the menu cards: /posters/<slug>-d.webp (desktop) and -m.webp (phone).

Usage: python3 tools/posters.py [slug ...]   (default: every built demo in w/)
       python3 tools/posters.py --top            (only refresh posters/top.json from the posters on disk)
Takes the first screen of each demo after it settles, the same view the live frame starts on.
Also records the colour along the top of each phone poster in posters/top.json: the phone frame's
status bar takes that colour, the way Safari tints it to match the page.
"""
import asyncio, fcntl, functools, json, os, sys, threading
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from PIL import Image

ROOT = '/home/claude/hdm'
OUT = os.path.join(ROOT, 'posters')


class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def top_colour(path):
    """Median colour of the top rows of a phone poster, as #rrggbb."""
    im = Image.open(path).convert('RGB')
    band = im.crop((0, 0, im.width, max(3, im.height // 90)))
    px = sorted((band.getpixel((x, y)) for y in range(band.height) for x in range(band.width)), key=lambda c: c[0] * .2126 + c[1] * .7152 + c[2] * .0722)
    r, g, b = px[len(px) // 2]
    return '#%02x%02x%02x' % (r, g, b)


def write_top(slugs=None):
    f = os.path.join(OUT, 'top.json')
    data = json.load(open(f)) if os.path.exists(f) else {}
    for name in sorted(os.listdir(OUT)):
        if not name.endswith('-m.webp'):
            continue
        slug = name[:-7]
        if slugs and slug not in slugs:
            continue
        data[slug] = top_colour(os.path.join(OUT, name))
    json.dump(dict(sorted(data.items())), open(f, 'w'), indent=0)
    return data


# Styles whose signature moment is further down the page: scroll there before the poster is taken.
AT = {'spire': ('#descent', 0)}  # (selector, extra px)

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
            await pg.wait_for_timeout(2600)
            if slug in AT:
                sel, extra = AT[slug]
                for dy, wait in ((extra, 5000),):
                    await pg.evaluate('''([sel, dy]) => { const e = document.querySelector(sel); if (!e) return; const y = e.getBoundingClientRect().top + scrollY + dy;
                      const l = window.__lenis; if (l && l.scrollTo) l.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y); }''', [sel, dy])
                    await pg.wait_for_timeout(wait)
            tmp = '/tmp/poster_%s_%s.png' % (slug, kind)
            await pg.screenshot(path=tmp, timeout=60000)
            im = Image.open(tmp).convert('RGB')
            w = 720 if kind == 'd' else 300
            im = im.resize((w, int(im.height * w / im.width)), Image.LANCZOS)
            dst = os.path.join(OUT, '%s-%s.webp' % (slug, kind))
            im.save(dst, 'WEBP', quality=74, method=6)
            res.append('%s %dKB' % (os.path.basename(dst), os.path.getsize(dst) // 1024))
        except Exception as e:
            res.append('%s-%s FAILED %s' % (slug, kind, str(e)[:120]))
        await ctx.close()
    print(slug, ' | '.join(res), flush=True)


async def main():
    os.makedirs(OUT, exist_ok=True)
    if sys.argv[1:] == ['--top']:
        print(write_top())
        return
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
    write_top(slugs)


if __name__ == '__main__':
    asyncio.run(main())
