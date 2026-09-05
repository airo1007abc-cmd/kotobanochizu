import fs from "node:fs";

const pages = [
  { path: "/prefectures/p42", expected: 5, kind: "prefecture", label: "nagasaki" },
  { path: "/regions/jp-42-region-県南", expected: 2, kind: "region", label: "nagasaki-kennan" },
  { path: "/prefectures/p46", expected: 3, kind: "prefecture", label: "kagoshima" },
  { path: "/regions/jp-46-region-奄美", expected: 2, kind: "region", label: "amami" },
  { path: "/prefectures/p47", expected: 3, kind: "prefecture", label: "okinawa" },
  { path: "/prefectures/p41", expected: 3, kind: "prefecture", label: "saga" },
];
fs.mkdirSync("reports/regional-culture-shots", { recursive: true });
const targets = await (await fetch("http://127.0.0.1:9223/json")).json();
const page = targets.find((item) => item.type === "page");
if (!page) throw new Error("Chrome DevTools page target not found");
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
let serial = 0;
const pending = new Map();
socket.addEventListener("message", (event) => { const message = JSON.parse(event.data); const request = pending.get(message.id); if (!request) return; pending.delete(message.id); message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result); });
const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++serial; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
await send("Page.enable");
await send("Runtime.enable");

const results = [];
for (const target of pages) for (const width of [1440, 390]) {
  await send("Emulation.setDeviceMetricsOverride", { width, height: 1400, deviceScaleFactor: 1, mobile: width === 390 });
  await send("Page.navigate", { url: `http://127.0.0.1:5181${target.path.split("/").map(encodeURIComponent).join("/")}` });
  await new Promise((resolve) => setTimeout(resolve, 650));
  const expression = `JSON.stringify({width:innerWidth,scrollWidth:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth),cards:document.querySelectorAll('.regional-culture-grid>a').length,heading:document.querySelector('.regional-culture h2')?.textContent?.trim(),external:[...document.querySelectorAll('.regional-culture-grid>a')].every(a=>a.target==='_blank'&&a.rel.includes('noreferrer')),rawMissing:/\\b(?:unknown|undefined|null|NaN|\\[object Object\\])\\b/.test(document.querySelector('.regional-culture')?.innerText||''),clipped:[...document.querySelectorAll('.regional-culture h2,.regional-culture h3,.regional-culture p,.regional-culture a')].some(el=>el.scrollWidth>el.clientWidth+1),version:document.querySelector('[data-${target.kind}-detail-version]')?.getAttribute('data-${target.kind}-detail-version')})`;
  const value = JSON.parse((await send("Runtime.evaluate", { expression, returnByValue: true })).result.value);
  const row = { ...target, width, ...value, overflow: value.scrollWidth > value.width };
  results.push(row);
  const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
  fs.writeFileSync(`reports/regional-culture-shots/${target.label}-${width}.png`, Buffer.from(shot.data, "base64"));
}
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
socket.close();
const failures = results.filter((row) => row.version !== "v2" || row.cards !== row.expected || row.overflow || row.rawMissing || row.clipped || !row.external);
const output = { generatedAt: new Date().toISOString(), status: failures.length ? "FAILED" : "PASSED", pages: pages.length, checks: results.length, failures, results };
fs.writeFileSync("reports/regional-culture-browser-audit.json", `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ status: output.status, pages: output.pages, checks: output.checks, failures: failures.length }, null, 2));
if (failures.length) process.exitCode = 1;
