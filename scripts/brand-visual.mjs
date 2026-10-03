import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const output = 'tmp/brand-visual';
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  for (const width of [390, 768, 1024, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:5181/', { waitUntil: 'networkidle' });
    await page.locator('.brand-wordmark').first().waitFor();
    await page.evaluate(() => document.fonts.ready);
    const state = await page.evaluate(() => ({
      width: innerWidth,
      scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      images: [...document.querySelectorAll('.brand-wordmark')].map(image => ({
        loaded: image.complete && image.naturalWidth === 2172,
        alt: image.alt,
        width: image.getBoundingClientRect().width,
        height: image.getBoundingClientRect().height,
      })),
      headerRight: document.querySelector('.site-header').getBoundingClientRect().right,
      navVisible: getComputedStyle(document.querySelector('.site-header nav')).display !== 'none',
    }));
    await page.screenshot({ path: `${output}/home-${width}.png`, fullPage: true });
    await page.locator('.site-header').screenshot({ path: `${output}/header-${width}.png` });
    await page.locator('footer').screenshot({ path: `${output}/footer-${width}.png` });
    results.push({ ...state, errors });
    assert.equal(state.scrollWidth, width, `Horizontal overflow at ${width}`);
    assert.equal(state.images.length, 2);
    assert.ok(state.images.every(image => image.loaded && image.alt === 'ことばの地図'));
    assert.equal(errors.length, 0);
    await page.goto('http://127.0.0.1:5181/map', { waitUntil: 'networkidle' });
    await page.locator('.site-header .brand').click();
    await page.waitForURL('http://127.0.0.1:5181/');
    assert.equal(await page.locator('.site-header .brand-wordmark').count(), 1);
    await page.close();
  }
} finally {
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  await browser.close();
}
