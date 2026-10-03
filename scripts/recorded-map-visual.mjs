import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const output = "tmp/recorded-map-visual";
const origin = "http://127.0.0.1:5181";
const baseline = "http://127.0.0.1:5182";
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  for (const width of [320, 390, 760, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const [version, base] of [["before", baseline], ["after", origin]]) {
      for (const [state, query] of [["national", ""], ["okinawa", "?prefecture=p47"]]) {
        await page.goto(`${base}/map${query}`, { waitUntil: "networkidle" });
        await page.locator(".interactive-prefecture").first().waitFor({ state: "attached" });
        await page.evaluate(() => document.fonts.ready);
        if (version === "after" && query) await page.waitForFunction(() => {
          const svg = document.querySelector(".recorded-map-svg svg");
          return svg.getAttribute("viewBox") !== svg.dataset.nationalViewBox;
        });
        await page.screenshot({ path: `${output}/${version}-${state}-${width}.png`, fullPage: true });
      }
    }
    await page.goto(`${origin}/map`, { waitUntil: "networkidle" });
    await page.locator('[data-prefecture-id="p47"]').waitFor();
    assert.equal(await page.locator('.interactive-prefecture[tabindex="0"]').count(), 47);
    assert.equal(await page.locator(".recorded-map-panel").count(), 0);
    await page.locator('[data-prefecture-id="p47"]').press("Enter");
    await page.locator(".recorded-map-panel").waitFor();
    await page.waitForFunction(() => document.activeElement.id === "recorded-map-panel");
    assert.match(page.url(), /prefecture=p47/);
    assert.equal(await page.locator('.interactive-prefecture[aria-hidden="true"]').count(), 46);
    const dimensions = await page.locator(".recorded-map-panel").evaluate((element) => ({ height: element.clientHeight, scroll: element.scrollHeight, overflow: getComputedStyle(element).overflowY }));
    assert.equal(dimensions.overflow, "visible");
    assert.ok(dimensions.height >= dimensions.scroll - 2);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    const historyLength = await page.evaluate(() => history.length);
    await page.locator(".recorded-map-directory").getByRole("button", { name: /沖縄県/ }).click();
    assert.equal(await page.evaluate(() => history.length), historyLength);
    await page.getByRole("button", { name: /宮古島市上野野原/ }).click();
    await page.locator(".recorded-map-words").waitFor();
    assert.match(decodeURIComponent(page.url()), /place=宮古島市上野野原/);
    assert.equal(await page.locator(".recorded-map-words li").count(), 56);
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await page.locator(".recorded-map-words li").count(), 56);
    await page.goBack();
    await page.locator(".recorded-map-places").waitFor();
    await page.goForward();
    await page.locator(".recorded-map-words").waitFor();
    await page.getByRole("button", { name: "沖縄県の地点へ戻る" }).click();
    await page.getByRole("button", { name: "全国の地図へ", exact: true }).click();
    await page.locator(".recorded-map-panel").waitFor({ state: "detached" });
    await page.waitForFunction(() => document.activeElement.id === "recorded-map-instructions");
    assert.equal(await page.locator('.interactive-prefecture[tabindex="0"]').count(), 47);
    await page.locator('[data-prefecture-id="p13"]').press("Space");
    await page.locator(".recorded-map-panel").waitFor();
    assert.match(page.url(), /prefecture=p13/);
    await page.getByRole("button", { name: "全国へ戻る", exact: true }).click();
    await page.locator("summary").click();
    assert.equal(await page.locator(".recorded-map-notes").getAttribute("open"), "");
    assert.deepEqual(errors, []);
    results.push({ width, status: "PASS", checks: ["before/after screenshots", "Enter/Space", "prefecture/place URL and reload", "Back/Forward", "repeat selection", "return focus", "no nested scroll or horizontal overflow", "no runtime errors"] });
    await page.close();
  }
  const page = await browser.newPage();
  await page.route("**/japan-prefectures.svg", (route) => route.abort());
  await page.goto(`${origin}/map`);
  await page.getByRole("status").waitFor();
  await page.locator(".recorded-map-directory").getByRole("button", { name: /沖縄県/ }).click();
  await page.locator(".recorded-map-places").waitFor();
  results.push({ status: "PASS", checks: ["failed SVG fallback"] });
} finally {
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  await browser.close();
}
console.log(JSON.stringify(results, null, 2));
