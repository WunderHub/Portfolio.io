"""Exercise catalog filtering, real concept navigation and narrow/mobile layouts."""
import os
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright

URL = os.environ.get('PORTFOLIO_URL', 'http://127.0.0.1:8765/Portfolio.io/')
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH', '/usr/bin/chromium'), args=['--no-sandbox'])
    page = browser.new_page(viewport={'width':1440, 'height':1000}, reduced_motion='reduce')
    errors, failures = [], []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('response', lambda r: failures.append(f'{r.status} {r.url}') if r.status >= 400 else None)
    page.goto(URL, wait_until='networkidle')
    assert page.locator('.logo-sequence-progress').count() == 0
    page.locator('#trabalhos').scroll_into_view_if_needed()
    assert page.locator('.showcase-card:visible').count() == 5
    for category, count in [('servicos',2),('comercio',1),('gastronomia',1),('imoveis',1),('all',5)]:
        button = page.locator(f'[data-filter="{category}"]')
        button.focus()
        page.keyboard.press('Enter')
        assert button.get_attribute('aria-pressed') == 'true'
        assert page.locator('.showcase-card:visible').count() == count
        assert page.locator('.showcase-count').inner_text().startswith(str(count))
    print('PASS category filtering and keyboard activation', flush=True)
    page.evaluate('document.querySelectorAll("img").forEach(i => i.loading="eager")')
    page.wait_for_function('Array.from(document.images).every(i=>i.complete && i.naturalWidth>0)')
    page.locator('.showcase').screenshot(path='/tmp/wunder-catalog-desktop.png', animations='disabled')
    for width in [1440,1024,768,390,320]:
        page.set_viewport_size({'width':width,'height':900})
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'Catalog overflow at {width}'
    page.set_viewport_size({'width':390,'height':844})
    page.locator('.showcase').screenshot(path='/tmp/wunder-catalog-mobile.png', animations='disabled')
    page.set_viewport_size({'width':1440,'height':1000})
    page.locator('#inicio').scroll_into_view_if_needed()
    page.screenshot(path='/tmp/wunder-new-intro.png', animations='disabled')
    for slug in ['aura','serena','brasa','forma','orbit']:
        page.goto(URL, wait_until='networkidle')
        page.locator(f'.showcase-{slug} .showcase-preview').click()
        assert page.url.endswith(f'concepts/{slug}.html')
        assert page.locator('h1').count() == 1
        assert page.get_by_text('Marca fictícia · demonstração visual').is_visible()
        page.wait_for_function('Array.from(document.images).every(i=>i.complete && i.naturalWidth>0)')
        page.locator('.hero .button').click()
        assert '#' in page.url
        contact = page.locator('.closing .button').get_attribute('href')
        assert urlparse(contact).path == '/5511959300903'
        assert slug.lower() in parse_qs(urlparse(contact).query)['text'][0].lower()
        for width in [1280,768,390,320]:
            page.set_viewport_size({'width':width,'height':844})
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'{slug} overflow at {width}'
        page.evaluate('window.scrollTo(0,0)')
        page.screenshot(path=f'/tmp/wunder-concept-{slug}-mobile.png', full_page=True, animations='disabled')
        page.locator('.concept-note a').click()
        assert page.url.endswith('index.html#trabalhos')
        print(f'PASS {slug}: real navigation, images, contact context, 4 widths, return to catalog', flush=True)
    offline = browser.new_page(java_script_enabled=False,viewport={'width':390,'height':844})
    offline.goto(URL, wait_until='networkidle')
    assert offline.locator('.showcase-card:visible').count() == 5
    assert offline.locator('.showcase-filters').is_hidden()
    offline.locator('.showcase-serena .showcase-preview').click()
    assert offline.locator('h1').is_visible()
    offline.locator('details').nth(1).locator('summary').click()
    assert offline.locator('details').nth(1).get_attribute('open') is not None
    assert not errors, errors
    assert not failures, failures
    print('PASS no-JS navigation and details, no missing assets or runtime errors', flush=True)
    browser.close()
