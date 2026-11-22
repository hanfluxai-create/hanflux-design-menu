#!/usr/bin/env python3
"""Sweep every menu page on a phone (390x844) and a laptop (1190x760): script errors, sideways scroll,
unfilled {{tokens}}. FormSubmit posts are intercepted, so no test leads reach the inbox.

Usage:
  python3 -m http.server 8811 --directory /home/claude/hdm &      # local copy (no /api there)
  python3 tools/check/sweep.py                                    # every page in the sitemap
  python3 tools/check/sweep.py https://hanflux-design-menu.vercel.app
  python3 tools/check/sweep.py http://127.0.0.1:8811 quick       # home, menu, order, three designs
Prints {"pages", "sizes", "problems": [...]}; an empty problems list means clean.
"""
import asyncio, fcntl, json, re, sys
from playwright.async_api import async_playwright

ROOT = '/home/claude/hdm'
B = (sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8811').rstrip('/')
QUICK = len(sys.argv) > 2
LOCAL = '127.0.0.1' in B or 'localhost' in B
slugs = re.findall(r'/websites/([a-z0-9-]+)/</loc>', open(ROOT + '/sitemap.xml').read())
base = ['/', '/websites/', '/order/', '/order/?d=liquid', '/agents/']
paths = base + (['/websites/hanflux/', '/websites/glass/', '/websites/swiss/'] if QUICK else ['/websites/%s/' % s for s in slugs])


async def main():
    bad = []
    lock = open('/tmp/hx-chromium.lock', 'w'); fcntl.flock(lock, fcntl.LOCK_EX)
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        for vw, vh, mob in ((390, 844, True), (1190, 760, False)):
            ctx = await b.new_context(viewport={'width': vw, 'height': vh}, is_mobile=mob, has_touch=mob)
            await ctx.route('https://formsubmit.co/**', lambda r: r.fulfill(status=200, body='{"success":"true"}'))
            for path in paths:
                p = await ctx.new_page(); errs = []
                p.on('pageerror', lambda e, errs=errs: errs.append('pageerror: ' + str(e)[:160]))
                # failed downloads are reported with their address; the local copy has no /api/, so that one is expected there
                p.on('console', lambda m, errs=errs: errs.append('console: ' + m.text[:160]) if m.type == 'error' and 'Failed to load resource' not in m.text else None)
                p.on('response', lambda r, errs=errs: errs.append('http %d %s' % (r.status, r.url[:120])) if r.status >= 400 and not ('/api/' in r.url and LOCAL) else None)
                try:
                    await p.goto(B + path, wait_until='load', timeout=60000); await p.wait_for_timeout(900)
                    info = await p.evaluate("({ov: document.documentElement.scrollWidth > innerWidth + 1, tok: /\\{\\{\\w+\\}\\}/.test(document.documentElement.outerHTML)})")
                    if info['ov']: errs.append('horizontal overflow')
                    if info['tok']: errs.append('unfilled token')
                except Exception as e:
                    errs.append('load: ' + str(e)[:120])
                if errs: bad.append({'size': vw, 'path': path, 'errs': errs[:4]})
                await p.close()
            await ctx.close()
        await b.close()
    print(json.dumps({'pages': len(paths), 'sizes': 2, 'problems': bad}, indent=1))

asyncio.run(main())
