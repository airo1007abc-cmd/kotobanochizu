import fs from "node:fs";

const report = JSON.parse(fs.readFileSync("reports/prefecture-v2-archetypes.json", "utf8"));
const archetypes = [...new Map(report.archetypes.map((item) => [item.prefectureId, item.metrics])).values()];
fs.mkdirSync("reports/prefecture-v2-archetype-shots", { recursive: true });
const targets = await (await fetch("http://127.0.0.1:9223/json")).json();
const page = targets.find((item) => item.type === "page");
if (!page) throw new Error("Chrome DevTools page target not found");
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
let serial = 0;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  const request = pending.get(message.id);
  if (!request) return;
  pending.delete(message.id);
  message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result);
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++serial;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});
await send("Page.enable");
await send("Runtime.enable");

const results = [];
for (const expected of archetypes) {
  for (const width of [1440, 1280, 768, 390]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 1400, deviceScaleFactor: 1, mobile: width === 390 });
    await send("Page.navigate", { url: `http://127.0.0.1:5181/prefectures/${expected.prefectureId}` });
    await new Promise((resolve) => setTimeout(resolve, 650));
    const value = JSON.parse((await send("Runtime.evaluate", {
      expression: `JSON.stringify({
        width: innerWidth,
        scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
        overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) > innerWidth,
        version: document.querySelector('[data-prefecture-detail-version]')?.getAttribute('data-prefecture-detail-version'),
        h1: document.querySelector('h1')?.textContent?.trim(),
        dialectCount: Number(document.querySelector('.prefecture-v2-stats strong')?.textContent),
        regionLinks: document.querySelectorAll('.prefecture-v2-region-list a').length,
        featuredWords: document.querySelectorAll('.prefecture-v2-word-grid a').length,
        mapReady: document.querySelector('.prefecture-v2-map')?.classList.contains('is-ready'),
        emptyRegionSection: Boolean(document.querySelector('.prefecture-v2-regions')) && document.querySelectorAll('.prefecture-v2-region-list a').length === 0,
        hasRawMissing: /\\b(?:unknown|undefined|null|NaN)\\b/.test(document.body.innerText),
        varietyText: document.querySelector('.prefecture-v2-varieties')?.textContent?.trim(),
        clipped: [...document.querySelectorAll('.prefecture-v2 h1, .prefecture-v2-region-list strong, .prefecture-v2-all-link')].some((el) => el.scrollWidth > el.clientWidth + 1)
      })`, returnByValue: true,
    })).result.value);
    const row = { prefectureId: expected.prefectureId, prefectureName: expected.prefectureName, expectedDialectCount: expected.dialectCount, expectedRegionCount: expected.regionCount, ...value };
    results.push(row);
    const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    fs.writeFileSync(`reports/prefecture-v2-archetype-shots/${expected.prefectureId}-${width}.png`, Buffer.from(shot.data, "base64"));
  }
}
socket.close();
const failures = results.filter((row) => row.overflow || row.version !== "v2" || row.h1 !== `${row.prefectureName}の方言` || row.dialectCount !== row.expectedDialectCount || row.regionLinks !== row.expectedRegionCount || row.featuredWords > 6 || !row.mapReady || row.emptyRegionSection || row.hasRawMissing || row.clipped);
const output = { generatedAt: "2026-09-05", phase: "archetype_allowlist", archetypes: archetypes.length, checks: results.length, status: failures.length ? "FAILED" : "PASSED", failures, results };
fs.writeFileSync("reports/prefecture-v2-archetype-browser-audit.json", `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ status: output.status, archetypes: output.archetypes, checks: output.checks, failures: failures.length }, null, 2));
if (failures.length) process.exitCode = 1;
