#!/usr/bin/env python3
"""Render the social share image (assets/hx/og.png) from tools/og.html using three posters."""
import asyncio, fcntl, functools, os, sys, threading, re
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
ROOT = '/home/claude/hdm'
class Q(SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
async def main():
    lap, pha, phb, n = (sys.argv[1:5] + ['particles', 'liquid', 'glass', '30'])[:4]
    html = open(os.path.join(ROOT, 'tools/og.html')).read().replace('LAP', lap).replace('PHA', pha).replace('PHB', phb).replace('LIVE_COUNT', n)
    open(os.path.join(ROOT, 'tools/_og.html'), 'w').write(html)
    from playwright.async_api import async_playwright
    lock = open('/tmp/hx-chromium.lock', 'w'); fcntl.flock(lock, fcntl.LOCK_EX)
    srv = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
    try:
        async with async_playwright() as pw:
            proxy = {'server': os.environ['HTTPS_PROXY'], 'bypass': '127.0.0.1,localhost'} if os.environ.get('HTTPS_PROXY') else None
            b = await pw.chromium.launch(proxy=proxy)
            pg = await b.new_page(viewport={'width': 1200, 'height': 630})
            await pg.goto('http://127.0.0.1:%d/tools/_og.html' % srv.server_address[1], wait_until='networkidle')
            await pg.evaluate('document.fonts.ready'); await pg.wait_for_timeout(800)
            await pg.screenshot(path=os.path.join(ROOT, 'assets/hx/og.png'))
            await b.close()
    finally:
        srv.shutdown(); fcntl.flock(lock, fcntl.LOCK_UN); os.remove(os.path.join(ROOT, 'tools/_og.html'))
    print('og.png written')
asyncio.run(main())
