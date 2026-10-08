"""Run with a static server at PORTFOLIO_URL; requires Python Playwright + Chromium."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

URL=os.environ.get('PORTFOLIO_URL','http://127.0.0.1:8765/Portfolio.io/')
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox'])
    errors=[]
    failures=[]
    page=browser.new_page(viewport={'width':1440,'height':1000},reduced_motion='reduce')
    page.on('pageerror',lambda err: errors.append(str(err)))
    page.on('response',lambda response: failures.append(f'{response.status} {response.url}') if response.status>=400 else None)
    requests=[]
    page.on('request',lambda req:requests.append(req.url))
    page.goto(URL,wait_until='networkidle')
    assert page.title()=='WunderHub — Design, código e movimento'
    assert not any('reel-' in url or 'hyperframes-player-' in url for url in requests), 'Players loaded before user interaction'
    assert page.locator('[data-open="aura"]').is_enabled()
    assert page.evaluate('Array.from(document.images).every(i=>i.loading==="lazy" || (i.complete && i.naturalWidth>0))')
    page.keyboard.press('Tab')
    assert page.locator('.skip-link').evaluate('(el)=>el===document.activeElement')
    page.keyboard.press('Enter')
    assert page.url.endswith('#conteudo')
    print('PASS initial loading, lazy players, images and keyboard skip link',flush=True)

    page.locator('[data-open="aura"]').click()
    assert page.locator('#aura-dialog').is_visible()
    assert page.locator('#quantity-minus').is_disabled()
    page.locator('#quantity-plus').click()
    page.locator('#quantity-plus').click()
    assert page.locator('#quantity-output').inner_text()=='3'
    page.locator('#add-selection').click()
    assert '3 unidades adicionadas' in page.locator('#selection-status').inner_text()
    page.locator('#details-tab').focus()
    page.keyboard.press('ArrowLeft')
    assert page.locator('#overview-tab').get_attribute('aria-selected')=='true'
    page.keyboard.press('ArrowRight')
    assert page.locator('#details-panel').is_visible()
    page.locator('#clear-selection').click()
    assert 'Seleção limpa' in page.locator('#selection-status').inner_text()
    page.keyboard.press('Escape')
    assert not page.locator('#aura-dialog').is_visible()
    assert page.locator('[data-open="aura"]').evaluate('(el)=>el===document.activeElement')
    print('PASS Aura tabs, keyboard, quantity, selection, reset and dialog focus',flush=True)

    page.locator('[data-open="reel"]').first.click()
    page.wait_for_selector('#reel-mount button',timeout=20000)
    assert page.locator('#reel-mount').get_by_text('Uma ideia.',exact=True).count()==1
    # Remotion's native controls expose play/pause; use their accessible label.
    controls=page.locator('#reel-mount button').evaluate_all('(els)=>els.map(e=>({label:e.getAttribute("aria-label"),title:e.title}))')
    print('Remotion controls:',controls,flush=True)
    page.get_by_role('button',name='Play video',exact=True).click()
    page.get_by_text('Cada detalhe responde.',exact=True).wait_for(state='visible',timeout=12000)
    page.wait_for_function("Array.from(document.querySelectorAll('#reel-mount div')).some(el=>el.textContent==='Cada detalhe responde.' && getComputedStyle(el).opacity==='1')")
    page.get_by_role('button',name='Pause video',exact=True).click()
    page.screenshot(path='/tmp/wunder-reel.png')
    page.keyboard.press('Escape')
    assert page.locator('#reel-mount').inner_html()==''
    print('PASS lazy Remotion mount and cleanup',flush=True)

    page.locator('[data-open="frame"]').click()
    page.wait_for_function("document.querySelector('hyperframes-player')?.duration > 0",timeout=30000)
    duration=page.locator('hyperframes-player').evaluate('(p)=>p.duration')
    assert abs(duration-10)<.1,duration
    page.locator('hyperframes-player').evaluate('(p)=>p.seek(3)')
    page.wait_for_timeout(300)
    t=page.locator('hyperframes-player').evaluate('(p)=>p.currentTime')
    assert abs(t-3)<.2,t
    page.locator('hyperframes-player').evaluate('(p)=>p.play()')
    page.wait_for_function("document.querySelector('hyperframes-player').currentTime > 3.2",timeout=15000)
    page.locator('hyperframes-player').evaluate('(p)=>p.pause()')
    assert page.locator('hyperframes-player').evaluate('(p)=>p.currentTime')>3
    page.screenshot(path='/tmp/wunder-hyperframes.png')
    page.keyboard.press('Escape')
    assert page.locator('hyperframes-player').count()==0
    print('PASS HyperFrames duration, seek, playback, pause and cleanup',flush=True)

    page.goto(URL,wait_until='networkidle')
    page.locator('#estudio').scroll_into_view_if_needed()
    page.wait_for_function("Array.from(document.images).every(i=>i.complete && i.naturalWidth>0)")
    page.evaluate('window.scrollTo(0,0)')
    for width,height in [(1440,1000),(1024,768),(768,1024),(390,844),(320,740)]:
        page.set_viewport_size({'width':width,'height':height})
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),f'Overflow at {width}'
        assert page.locator('a[href="https://wa.me/5511959300903"]').count()==4
        page.screenshot(path=f'/tmp/wunder-v2-{width}.png',full_page=True,animations='disabled')
        print(f'PASS responsive layout at {width}px',flush=True)
    # Native accordion is available without application scripts.
    offline=browser.new_page(java_script_enabled=False,viewport={'width':390,'height':844})
    offline.goto(URL,wait_until='networkidle')
    offline.get_by_text('Interações que respondem',exact=True).click()
    assert offline.get_by_text('Motion / JavaScript / Acessibilidade',exact=True).is_visible()
    assert offline.locator('h1').is_visible()
    assert not errors,errors
    assert not failures,failures
    print('PASS no-JS content and accordion, no failed requests or runtime errors',flush=True)
    browser.close()
