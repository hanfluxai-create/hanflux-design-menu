#!/usr/bin/env python3
"""Walk the whole order flow on a phone, as a visitor in India: design page, Order, add-on, the four steps,
validation, place order. FormSubmit is intercepted (no real lead is sent) and its posts are printed.
Screens go to /home/claude/hdm/_qa/order/ (o0_island ... o7_done) for a visual check.

Usage: python3 tools/check/orderflow.py [base]    (default http://127.0.0.1:8811, the local copy)
Locally /api/ does not exist, so the flow ends in call-back mode ("we call within 24 hours").
"""
import asyncio, fcntl, os, sys, json
from playwright.async_api import async_playwright
from PIL import Image
B = (sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8811').rstrip('/'); OUT = '/home/claude/hdm/_qa/order'; os.makedirs(OUT, exist_ok=True)
_lock = open('/tmp/hx-chromium.lock', 'w'); fcntl.flock(_lock, fcntl.LOCK_EX)
UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
posts = []
async def shot(p, name, full=False):
    f=f'{OUT}/{name}.png'; await p.screenshot(path=f, full_page=full); im=Image.open(f); im=im.resize((int(im.width*.75), int(im.height*.75))); im.save(f)
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        ctx = await b.new_context(viewport={'width':390,'height':844}, device_scale_factor=2, is_mobile=True, has_touch=True, user_agent=UA, timezone_id='Asia/Kolkata')
        async def fake(route):
            posts.append(json.loads(route.request.post_data or '{}')); await route.fulfill(status=200, content_type='application/json', body='{"success":"true"}')
        await ctx.route('https://formsubmit.co/**', fake)
        p = await ctx.new_page(); errs=[]
        p.on('pageerror', lambda e: errs.append(str(e))); p.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
        await p.goto(B + '/websites/glass/', wait_until='load'); await p.wait_for_timeout(4500)
        await p.evaluate("document.querySelector('#d-stage').scrollIntoView({block:'center'})"); await p.wait_for_timeout(1500); await shot(p, 'o0_island')
        await p.click('.buy-main'); await p.wait_for_load_state('load'); await p.wait_for_timeout(1200)
        await shot(p, 'o1_step1')
        await p.click('label[for="ao-booking"]'); await p.wait_for_timeout(300)
        await p.click('[data-next]'); await p.wait_for_timeout(700); await shot(p, 'o2_step2_empty')
        await p.click('[data-next]'); await p.wait_for_timeout(500); await shot(p, 'o3_step2_err')
        await p.fill('#o-biz', 'Smile Studio'); await p.fill('#o-what', 'A dental clinic in Indiranagar. We want more bookings.'); await p.fill('#o-city', 'Bengaluru, India')
        await p.click('[data-radio="logo"] [data-v="No, make one for me"]'); await p.click('[data-radio="domain"] [data-v="I have one"]'); await p.fill('#o-domain', 'smilestudio.in')
        await p.click('[data-multi="pages"] [data-v="Booking"]')
        await p.click('[data-next]'); await p.wait_for_timeout(700); await shot(p, 'o4_step3')
        await p.fill('#o-name', 'Test Person'); await p.fill('#o-phone', '+91 90000 00000'); await p.fill('#o-email', 'test@example.com')
        await p.click('[data-next]'); await p.wait_for_timeout(800); await shot(p, 'o5_step4')
        await p.evaluate("scrollTo(0, document.body.scrollHeight)"); await p.wait_for_timeout(500); await shot(p, 'o6_step4_bottom')
        await p.click('[data-next]'); await p.wait_for_timeout(1500); await shot(p, 'o7_done')
        print(json.dumps({'errors': errs[:8], 'posts': [{k: v for k, v in x.items() if k in ('_subject','order_id','design','addons','total','pay_now','logo','domain','pages','payment')} for x in posts]}, indent=1))
        await b.close()
asyncio.run(main())
