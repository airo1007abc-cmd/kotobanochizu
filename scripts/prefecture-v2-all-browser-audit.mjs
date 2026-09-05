import fs from "node:fs";

const baseline = JSON.parse(fs.readFileSync("reports/prefecture-v2-baseline.json", "utf8"));
const archetypeReport = JSON.parse(fs.readFileSync("reports/prefecture-v2-archetypes.json", "utf8"));
const archetypeIds = new Set(archetypeReport.archetypes.map((item) => item.prefectureId));
const cases = baseline.prefectures.flatMap((item) => {
  const widths = archetypeIds.has(item.prefectureId) ? [1440, 1280, 768, 390] : [390];
  return widths.map((width) => ({ item, width }));
});
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
for (const { item: expected, width } of cases) {
  await send("Emulation.setDeviceMetricsOverride", { width, height: 1200, deviceScaleFactor: 1, mobile: width === 390 });
  await send("Page.navigate", { url: `http://127.0.0.1:5181/prefectures/${expected.prefectureId}` });
  await new Promise((resolve) => setTimeout(resolve, 450));
  const value = JSON.parse((await send("Runtime.evaluate", { expression: `JSON.stringify({
    responseText: document.body.innerText,
    width: innerWidth,
    scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
    version: document.querySelector('[data-prefecture-detail-version]')?.getAttribute('data-prefecture-detail-version'),
    h1: document.querySelector('h1')?.textContent?.trim(),
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.content || '',
    robots: document.querySelector('meta[name="robots"]')?.content || '',
    regionLinks: [...document.querySelectorAll('.prefecture-v2-region-list a')].map(a => a.getAttribute('href')),
    dialectLinks: [...document.querySelectorAll('.prefecture-v2-word-grid a')].map(a => a.getAttribute('href')),
    dialectCount: Number(document.querySelector('.prefecture-v2-stats strong')?.textContent),
    rawMissing: /\\b(?:unknown|undefined|null|NaN|\\[object Object\\])\\b/.test(document.body.innerText),
    clipping: [...document.querySelectorAll('.prefecture-v2 h1, .prefecture-v2 a, .prefecture-v2 strong')].some(el => el.scrollWidth > el.clientWidth + 1)
  })`, returnByValue: true })).result.value);
  const responseText = value.responseText;
  delete value.responseText;
  results.push({ prefectureId: expected.prefectureId, prefectureName: expected.prefectureName, expectedDialectCount: expected.dialectCount, expectedRegionCount: expected.regionCount, width, ...value,
    overflow: value.scrollWidth > value.width,
    oldUi: /ARCHIVE RECORD|あなたはこのことばを/.test(responseText),
  });
}
socket.close();
const failures = results.filter((row) => row.version !== "v2" || row.h1 !== `${row.prefectureName}の方言` || row.dialectCount !== row.expectedDialectCount || row.regionLinks.length !== row.expectedRegionCount || row.dialectLinks.length > 6 || row.overflow || row.rawMissing || row.clipping || row.oldUi || !row.title || !row.description || row.regionLinks.some((href) => !href?.startsWith("/regions/")) || row.dialectLinks.some((href) => !href?.startsWith("/dialects/")));
const uniqueV2 = new Set(results.filter((row) => row.version === "v2").map((row) => row.prefectureId));
const uniqueV1 = new Set(results.filter((row) => row.version === "v1").map((row) => row.prefectureId));
const output = { generatedAt: "2026-09-05", status: failures.length ? "FAILED" : "PASSED", prefectures: baseline.totalPrefectures, checks: results.length, widths: [1440, 1280, 768, 390], v2Prefectures: uniqueV2.size, v1Prefectures: uniqueV1.size, failures, results };
fs.writeFileSync("reports/prefecture-v2-browser-audit.json", `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ status: output.status, prefectures: output.prefectures, checks: output.checks, v2: output.v2Prefectures, v1: output.v1Prefectures, failures: failures.length }, null, 2));
if (failures.length) process.exitCode = 1;
