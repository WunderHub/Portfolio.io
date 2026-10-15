"""Native scroll sequence integration tests. Run with the site's static server."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

URL=os.environ.get('PORTFOLIO_URL','http://127.0.0.1:8765/Portfolio.io/')

def scroll_to(page, fraction):
    page.evaluate('''fraction => {
      const section=document.querySelector('[data-logo-sequence]');
      const stage=section.querySelector('.logo-sequence-stage');
      const top=section.getBoundingClientRect().top+scrollY;
      window.scrollTo({top:top+(section.offsetHeight-stage.clientHeight)*fraction,behavior:'instant'});
    }''',fraction)

def wait_frame(page, expected):
    page.wait_for_function('(expected)=>Number(document.querySelector("[data-logo-sequence]").dataset.currentFrame)===expected',arg=expected,timeout=20000)

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox'])
    errors=[]
    page=browser.new_page(viewport={'width':1440,'height':900},reduced_motion='no-preference')
    page.on('pageerror',lambda err:errors.append(str(err)))
    page.goto(URL,wait_until='domcontentloaded')
    wait_frame(page,1)
    assert page.locator('[data-logo-sequence]').get_attribute('data-variant')=='desktop'
    assert page.locator('.logo-sequence-stage').evaluate('(el)=>getComputedStyle(el).position')=='sticky'
    assert page.locator('.logo-sequence-stage').bounding_box()['height']==900
    assert page.evaluate('document.documentElement.scrollWidth===innerWidth')
    for fraction,expected in [(0,1),(.25,61),(.5,121),(.75,180),(1,240),(.25,61),(0,1)]:
        scroll_to(page,fraction)
        wait_frame(page,expected)
        stage=page.locator('.logo-sequence-stage').bounding_box()
        assert abs(stage['y'])<2,(fraction,stage)
        assert int(page.locator('[data-logo-sequence]').get_attribute('data-decoded-frames'))<=20
        if fraction in [.5,1]:
            page.screenshot(path=f'/tmp/wunder-scroll-desktop-{expected}.png')
    print('PASS 240-frame mapping, sticky stage, forward/reverse and bounded decoded cache',flush=True)

    scroll_to(page,1)
    wait_frame(page,240)
    page.evaluate('window.scrollBy({top:250,behavior:"instant"})')
    assert page.locator('.logo-sequence-stage').bounding_box()['y']<-200
    page.locator('.logo-sequence-skip').click()
    assert page.url.endswith('#inicio')
    assert page.locator('#inicio').evaluate('(el)=>el===document.activeElement')
    assert abs(page.locator('#inicio').bounding_box()['y'])<60
    print('PASS natural release and instant keyboard-accessible skip',flush=True)

    # Resize in place and rotate the viewport; verify mobile assets and a bounded DPR buffer.
    page.set_viewport_size({'width':390,'height':844})
    scroll_to(page,.5)
    wait_frame(page,121)
    assert page.locator('[data-logo-sequence]').get_attribute('data-variant')=='mobile'
    assert int(page.locator('[data-logo-sequence]').get_attribute('data-decoded-frames'))<=14
    assert page.evaluate('document.documentElement.scrollWidth===innerWidth')
    page.screenshot(path='/tmp/wunder-scroll-mobile.png')
    page.set_viewport_size({'width':844,'height':390})
    scroll_to(page,1)
    wait_frame(page,240)
    assert page.locator('.logo-sequence-stage').bounding_box()['height']==390
    assert page.evaluate('document.documentElement.scrollWidth===innerWidth')
    page.screenshot(path='/tmp/wunder-scroll-landscape.png')
    print('PASS mobile variant, responsive canvas and orientation change',flush=True)

    page.emulate_media(reduced_motion='reduce')
    page.wait_for_function('document.querySelector("[data-logo-sequence]").dataset.mode==="static"')
    assert page.locator('[data-logo-sequence]').bounding_box()['height']==390
    assert page.locator('.logo-sequence-poster').is_visible()
    assert page.locator('.logo-sequence-stage').evaluate('(el)=>getComputedStyle(el).position')=='relative'
    assert int(page.locator('[data-logo-sequence]').get_attribute('data-decoded-frames'))==0
    page.emulate_media(reduced_motion='no-preference')
    scroll_to(page,.75)
    wait_frame(page,180)
    print('PASS live prefers-reduced-motion toggle and cache disposal',flush=True)

    reduced=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=3,reduced_motion='reduce')
    requests=[]
    reduced.on('request',lambda req:requests.append(req.url))
    reduced.goto(URL,wait_until='networkidle')
    assert not any('/frame-' in url for url in requests),requests
    assert reduced.locator('.logo-sequence-poster img').evaluate('(img)=>img.complete && img.naturalWidth>0')
    assert reduced.locator('[data-logo-sequence]').bounding_box()['height']==844
    print('PASS reduced motion loads only the static poster, not sequence frames',flush=True)

    # Component must work if the application bundle and its dependencies are absent.
    standalone=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=3,reduced_motion='no-preference')
    standalone.route('**/assets/dist/**',lambda route:route.abort())
    standalone.goto(URL,wait_until='domcontentloaded')
    scroll_to(standalone,1)
    wait_frame(standalone,240)
    pixels=standalone.locator('.logo-sequence canvas').evaluate('(c)=>c.width*c.height')
    assert pixels<=3_010_000,pixels
    assert standalone.locator('.logo-sequence-poster').is_hidden()
    print('PASS pure-JavaScript isolation and high-DPI canvas memory cap',flush=True)

    nojs=browser.new_page(java_script_enabled=False,viewport={'width':390,'height':844})
    nojs.goto(URL,wait_until='networkidle')
    assert nojs.locator('.logo-sequence-poster img').evaluate('(i)=>i.complete && i.naturalWidth>0')
    assert nojs.locator('[data-logo-sequence]').bounding_box()['height']==844
    assert nojs.locator('.logo-sequence-stage').evaluate('(el)=>getComputedStyle(el).position')=='relative'
    nojs.locator('.logo-sequence-skip').click()
    assert nojs.url.endswith('#inicio')
    print('PASS no-JavaScript poster and ordinary anchor navigation',flush=True)

    failed=browser.new_page(reduced_motion='no-preference')
    failed.route('**/logo-sequence/**/frame-*.webp',lambda route:route.fulfill(status=404,body='missing'))
    failed.goto(URL,wait_until='domcontentloaded')
    failed.wait_for_function('document.querySelector("[data-logo-sequence]").dataset.mode==="static"',timeout=20000)
    assert failed.locator('.logo-sequence-poster').is_visible()
    assert failed.locator('.logo-sequence-stage').evaluate('(el)=>getComputedStyle(el).position')=='relative'
    print('PASS missing-frame fallback removes the long sticky section',flush=True)
    assert not errors,errors
    browser.close()
