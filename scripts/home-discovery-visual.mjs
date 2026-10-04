import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const { chromium } = await import(
  pathToFileURL(process.env.PLAYWRIGHT_MODULE).href
);
const origin = "http://127.0.0.1:5181";
const output = "tmp/home-discovery-visual";
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  for (const width of [320, 390, 760, 768, 1024, 1440]) {
    const page = await browser.newPage({
      viewport: { width, height: 1000 },
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(origin, { waitUntil: "networkidle" });
    await page.locator(".situation-grid").waitFor();
    await page.evaluate(() => document.fonts.ready);
    const state = await page.evaluate(() => {
      const grid = document.querySelector(".situation-grid");
      const rects = [...grid.querySelectorAll("a")].map((card) => {
        const { x, y, width, height } = card.getBoundingClientRect();
        return {
          x,
          y,
          width,
          height,
          textClipped: card.scrollWidth > card.clientWidth,
        };
      });
      return {
        width: innerWidth,
        scrollWidth: Math.max(
          document.documentElement.scrollWidth,
          document.body.scrollWidth,
        ),
        columns: getComputedStyle(grid).gridTemplateColumns.split(" ").length,
        gridOverflow: grid.scrollWidth > grid.clientWidth,
        scenePaths: [...grid.querySelectorAll("a")].map((link) =>
          link.getAttribute("href"),
        ),
        rects,
      };
    });
    assert.equal(state.columns, width <= 760 ? 2 : 3);
    assert.equal(state.scrollWidth, width, `Horizontal overflow at ${width}`);
    assert.equal(state.gridOverflow, false);
    assert.equal(state.scenePaths.length, 6);
    assert.ok(
      state.rects.every(
        (rect) => rect.width >= 130 && rect.height >= 44 && !rect.textClipped,
      ),
    );
    assert.equal(await page.locator(".journey-card").count(), 3);
    assert.equal(
      await page.locator('.home-discovery a[href="/editorial-policy"]').count(),
      0,
    );
    assert.ok(await page.locator('footer a[href="/editorial-policy"]').count());
    assert.equal(await page.locator(".preview-banner").count(), 0);
    await page.screenshot({ path: `${output}/top-${width}.png` });
    await page.screenshot({
      path: `${output}/home-${width}.png`,
      fullPage: true,
    });
    // A taller capture viewport keeps fixed navigation outside the component crops.
    await page.setViewportSize({ width, height: 1800 });
    await page
      .locator(".home-discovery")
      .screenshot({ path: `${output}/entrances-${width}.png` });
    await page
      .locator(".situation-section")
      .screenshot({ path: `${output}/scenes-${width}.png` });
    await page.setViewportSize({ width, height: 1000 });
    // Follow every displayed destination, then return through real browser history.
    for (const path of state.scenePaths) {
      await page.locator(`.scene-card[href="${path}"]`).click();
      await page.waitForURL(`${origin}${path}`);
      await page.locator(".utterance-list").waitFor();
      assert.ok(await page.locator(".utterance-list > article").count());
      assert.equal(
        await page
          .locator(".utterance-list")
          .getByText("用例は確認中です")
          .count(),
        0,
      );
      await page.goBack();
      await page.locator(".situation-grid").waitFor();
    }
    for (const path of ["/prefectures", "/meanings", "/conversations"]) {
      await page.locator(`.journey-card[href="${path}"]`).focus();
      await page.keyboard.press("Enter");
      await page.waitForURL(`${origin}${path}`);
      await page.locator("h1").first().waitFor();
      await page.goBack();
      await page.locator(".journey-grid").waitFor();
    }
    assert.equal(errors.length, 0, `Browser errors at ${width}`);
    results.push({
      ...state,
      sceneNavigation: "passed",
      entranceKeyboardNavigation: "passed",
      errors,
    });
    await page.close();
  }
} finally {
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  await browser.close();
}
