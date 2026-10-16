"""Capture the real concept pages for the catalog. Requires Playwright + Chromium.
Run with a static server (see README), then optimize PNGs to WEBP with Sharp.
"""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

url = os.environ.get('PORTFOLIO_URL', 'http://127.0.0.1:8765/Portfolio.io/')
out = Path('/tmp/wunder-concept-captures')
out.mkdir(exist_ok=True)
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH', '/usr/bin/chromium'), args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 1280, 'height': 880}, device_scale_factor=1, reduced_motion='reduce')
    for slug in ['aura', 'serena', 'brasa', 'forma', 'orbit']:
        page.goto(f'{url}concepts/{slug}.html', wait_until='networkidle')
        page.evaluate('document.fonts.ready')
        page.wait_for_function('Array.from(document.images).every(i => i.complete && i.naturalWidth > 0)')
        # The real pages show their disclosure; the catalog has its own visible disclosure.
        page.add_style_tag(content='.concept-note{display:none}')
        page.screenshot(path=str(out / f'{slug}.png'), animations='disabled')
        print(f'Captured {slug}', flush=True)
    browser.close()
