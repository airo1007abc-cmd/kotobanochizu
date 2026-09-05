import fs from "node:fs";

const baseline = JSON.parse(fs.readFileSync("reports/region-v2-baseline.json", "utf8"));
const selection = JSON.parse(fs.readFileSync("reports/region-v2-archetypes.json", "utf8"));
const selectedIds = [...new Set([...selection.archetypes.map((item) => item.regionId), selection.zeroWordSample[0]?.regionId].filter(Boolean))];
const selected = selectedIds.map((id) => baseline.regions.find((item) => item.regionId === id));
fs.mkdirSync("reports/region-v2-archetype-shots", { recursive: true });
const targets = await (await fetch("http://127.0.0.1:9223/json")).json();
const page = targets.find((item) => item.type === "page");
if (!page) throw new Error("Chrome DevTools page target not found");
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
let serial = 0; const pending = new Map();
socket.addEventListener("message", (event) => { const message = JSON.parse(event.data); const request = pending.get(message.id); if (!request) return; pending.delete(message.id); message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result); });
const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++serial; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
await send("Page.enable"); await send("Runtime.enable");
const results = [];
for (const expected of selected) for (const width of [1440, 1280, 768, 390]) {
  await send("Emulation.setDeviceMetricsOverride", { width, height: 1400, deviceScaleFactor: 1, mobile: width === 390 });
  await send("Page.navigate", { url: `http://127.0.0.1:5181/regions/${encodeURIComponent(expected.regionId)}` });
  await new Promise((resolve) => setTimeout(resolve, 600));
  const value = JSON.parse((await send("Runtime.evaluate", { expression: `JSON.stringify({width:innerWidth,scrollWidth:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth),version:document.querySelector('[data-region-detail-version]')?.getAttribute('data-region-detail-version'),h1:document.querySelector('h1')?.textContent?.trim(),prefectureLinks:[...document.querySelectorAll('.region-v2 a[href^="/prefectures/"]')].map(a=>a.getAttribute('href')),dialectLinks:[...document.querySelectorAll('.region-v2 .prefecture-v2-word-grid a')].map(a=>a.getAttribute('href')),siblingLinks:[...document.querySelectorAll('.region-v2-siblings nav a')].map(a=>a.getAttribute('href')),dialectCount:Number(document.querySelector('.region-v2 .prefecture-v2-stats strong')?.textContent),empty:Boolean(document.querySelector('.region-v2-empty')),rawMissing:/\\b(?:unknown|undefined|null|NaN|\\[object Object\\])\\b/.test(document.body.innerText),clipped:[...document.querySelectorAll('.region-v2 h1,.region-v2 a,.region-v2 strong')].some(el=>el.scrollWidth>el.clientWidth+1)})`, returnByValue: true })).result.value);
  const row = { regionId: expected.regionId, regionName: expected.regionName, prefectureId: expected.prefectureId, expectedDialectCount: expected.dialectCount, width, ...value, overflow: value.scrollWidth > value.width };
  results.push(row);
  const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  fs.writeFileSync(`reports/region-v2-archetype-shots/${expected.prefectureId}-${Buffer.from(expected.regionId).toString("base64url").slice(0, 18)}-${width}.png`, Buffer.from(shot.data, "base64"));
}
socket.close();
const failures = results.filter((row) => row.version !== "v2" || row.h1 !== `${row.regionName}のことば` || row.dialectCount !== row.expectedDialectCount || row.dialectLinks.length > 6 || row.empty !== (row.expectedDialectCount === 0) || row.overflow || row.rawMissing || row.clipped || !row.prefectureLinks.includes(`/prefectures/${row.prefectureId}`));
const output = { generatedAt: "2026-09-05", status: failures.length ? "FAILED" : "PASSED", regions: selected.length, checks: results.length, failures, results };
fs.writeFileSync("reports/region-v2-archetype-browser-audit.json", `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ status: output.status, regions: output.regions, checks: output.checks, failures: failures.length }, null, 2));
if (failures.length) process.exitCode = 1;
