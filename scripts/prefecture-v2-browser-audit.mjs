import fs from "node:fs";

const targets = await (await fetch("http://127.0.0.1:9223/json")).json();
const page = targets.find((item) => item.type === "page");
if (!page) throw new Error("Chrome DevTools page target not found");
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});
let requestId = 0;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  const request = pending.get(message.id);
  if (!request) return;
  pending.delete(message.id);
  message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result);
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++requestId;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});

await send("Page.enable");
await send("Runtime.enable");
const results = [];
for (const width of [1440, 1280, 768, 390]) {
  await send("Emulation.setDeviceMetricsOverride", { width, height: 1500, deviceScaleFactor: 1, mobile: width === 390 });
  await send("Page.navigate", { url: "http://127.0.0.1:5181/prefectures/p41" });
  await new Promise((resolve) => setTimeout(resolve, 900));
  const evaluation = await send("Runtime.evaluate", {
    expression: `JSON.stringify({
      innerWidth,
      scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) > innerWidth,
      version: document.querySelector('[data-prefecture-detail-version]')?.getAttribute('data-prefecture-detail-version'),
      h1: document.querySelector('h1')?.textContent?.trim(),
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content,
      regionLinks: document.querySelectorAll('.prefecture-v2-region-list a').length,
      wordLinks: document.querySelectorAll('.prefecture-v2-word-grid a').length,
      hasGabaiLink: Boolean(document.querySelector('.prefecture-v2-word-grid a[href="/dialects/jp-41-saga-001"]')),
      allWordsHref: document.querySelector('.prefecture-v2-all-link')?.getAttribute('href'),
      hasBreadcrumb: Boolean(document.querySelector('.prefecture-v2-breadcrumb')),
      mapReady: document.querySelector('.prefecture-v2-map')?.classList.contains('is-ready'),
      hasOldCardGrid: Boolean(document.querySelector('.prefecture-v2 > .card-grid')),
      hasRawMissing: /\\b(?:unknown|undefined|null|NaN)\\b/.test(document.body.innerText)
    })`,
    returnByValue: true,
  });
  results.push({ width, ...JSON.parse(evaluation.result.value) });
  if (width === 1440 || width === 390) {
    const screenshot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
    fs.writeFileSync(`reports/saga-prefecture-v2-${width}.png`, Buffer.from(screenshot.data, "base64"));
  }
}

await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: "http://127.0.0.1:5181/prefectures/p40" });
await new Promise((resolve) => setTimeout(resolve, 600));
const otherPrefecture = JSON.parse((await send("Runtime.evaluate", {
  expression: `JSON.stringify({ h1: document.querySelector('h1')?.textContent?.trim(), hasV2: Boolean(document.querySelector('.prefecture-v2')), hasLegacyRegionGrid: Boolean(document.querySelector('.region-grid')) })`,
  returnByValue: true,
})).result.value);
socket.close();

const failures = results.filter((row) => row.overflow || row.version !== "v2" || row.h1 !== "佐賀県の方言" || row.regionLinks !== 4 || row.wordLinks !== 6 || !row.hasGabaiLink || row.allWordsHref !== "/search?pref=p41" || !row.hasBreadcrumb || !row.mapReady || row.hasOldCardGrid || row.hasRawMissing);
if (otherPrefecture.hasV2 || !otherPrefecture.hasLegacyRegionGrid) failures.push({ otherPrefecture });
console.log(JSON.stringify({ status: failures.length ? "FAILED" : "PASSED", results, otherPrefecture, failures }, null, 2));
if (failures.length) process.exitCode = 1;
