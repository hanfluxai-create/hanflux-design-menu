#!/usr/bin/env python3
"""Load speed on a slow phone: iPhone screen, slow 4G (1.6 Mbps, 150 ms), CPU slowed 4x, empty cache.
Prints FCP, LCP, load event, layout shift, long tasks, iframes booted and the heaviest downloads.

Usage: python3 tools/check/perf.py https://hanflux-design-menu.vercel.app /,/websites/,/websites/particles/
Reference (live, 22 Nov 2026): design page load 1.8 s, LCP 1.4 s; home and menu boot no live iframes on phones.
"""
import asyncio, fcntl, os, sys, json, time
from playwright.async_api import async_playwright
BASE = sys.argv[1].rstrip('/'); paths = sys.argv[2].split(','); label = sys.argv[3] if len(sys.argv) > 3 else ''
_lock = open('/tmp/hx-chromium.lock', 'w'); fcntl.flock(_lock, fcntl.LOCK_EX)
UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
OBS = """
window.__lcp=0;window.__lt=[];window.__cls=0;
new PerformanceObserver(l=>{for(const e of l.getEntries()) window.__lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});
new PerformanceObserver(l=>{for(const e of l.getEntries()) window.__lt.push([Math.round(e.startTime),Math.round(e.duration)])}).observe({type:'longtask',buffered:true});
new PerformanceObserver(l=>{for(const e of l.getEntries()) if(!e.hadRecentInput) window.__cls+=e.value}).observe({type:'layout-shift',buffered:true});
"""
async def run(pw, p):
    px = os.environ.get('HTTPS_PROXY')
    b = await pw.chromium.launch(proxy={'server': px, 'bypass': '127.0.0.1,localhost'} if px else None,
        args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    ctx = await b.new_context(viewport={'width':390,'height':844}, device_scale_factor=3, is_mobile=True, has_touch=True, user_agent=UA)
    page = await ctx.new_page()
    await page.add_init_script(OBS)
    cdp = await ctx.new_cdp_session(page)
    await cdp.send('Network.enable')
    await cdp.send('Network.setCacheDisabled', {'cacheDisabled': True})
    await cdp.send('Network.emulateNetworkConditions', {'offline': False, 'latency': 150, 'downloadThroughput': 1.6*1024*1024/8, 'uploadThroughput': 750*1024/8})
    await cdp.send('Emulation.setCPUThrottlingRate', {'rate': 4})
    reqs = {}
    def onresp(ev):
        r = ev['response']; reqs[ev['requestId']] = {'url': r['url'], 'type': ev.get('type'), 'bytes': 0, 't': ev['timestamp']}
    def onfin(ev):
        if ev['requestId'] in reqs: reqs[ev['requestId']]['bytes'] = ev.get('encodedDataLength', 0); reqs[ev['requestId']]['tf'] = ev['timestamp']
    cdp.on('Network.responseReceived', onresp); cdp.on('Network.loadingFinished', onfin)
    t0 = time.time()
    await page.goto(BASE + p, wait_until='commit', timeout=90000)
    await page.wait_for_timeout(12000)
    m = await page.evaluate("""()=>{const n=performance.getEntriesByType('navigation')[0];const fcp=(performance.getEntriesByName('first-contentful-paint')[0]||{}).startTime;
      return {fcp:Math.round(fcp||0), lcp:Math.round(window.__lcp), dcl:Math.round(n.domContentLoadedEventEnd), load:Math.round(n.loadEventEnd), cls:+window.__cls.toFixed(3), longtasks:window.__lt.length, lt_total:window.__lt.reduce((a,b)=>a+b[1],0), lt_top:window.__lt.sort((a,b)=>b[1]-a[1]).slice(0,5), iframes:document.querySelectorAll('iframe').length, iframes_src:[...document.querySelectorAll('iframe')].map(f=>f.getAttribute('src')||'').filter(Boolean).slice(0,6)}}""")
    tot = sum(r['bytes'] for r in reqs.values())
    by = {}
    for r in reqs.values():
        k = r['type']; by.setdefault(k, [0, 0]); by[k][0] += 1; by[k][1] += r['bytes']
    top = sorted(reqs.values(), key=lambda r: -r['bytes'])[:12]
    out = {'path': p, **m, 'requests_12s': len(reqs), 'kb_12s': round(tot/1024), 'by_type': {k: [v[0], round(v[1]/1024)] for k, v in by.items()},
           'top': [(r['url'].replace(BASE, ''), round(r['bytes']/1024)) for r in top]}
    await b.close()
    return out
async def main():
    async with async_playwright() as pw:
        for p in paths:
            print(json.dumps(await run(pw, p), indent=1))
asyncio.run(main())
