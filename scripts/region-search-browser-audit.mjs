import fs from "node:fs";
const baseline = JSON.parse(fs.readFileSync("reports/region-v2-baseline.json", "utf8"));
const samples = [
  baseline.regions.find((item) => item.prefectureName === "佐賀県" && item.regionName === "佐賀平野"),
  baseline.regions.find((item) => item.prefectureName === "沖縄県" && item.regionName === "宮古諸島"),
  baseline.regions.find((item) => item.prefectureName === "北海道" && item.dialectCount === 0),
];
const targets = await (await fetch("http://127.0.0.1:9223/json")).json(); const page = targets.find((item) => item.type === "page"); const socket = new WebSocket(page.webSocketDebuggerUrl); await new Promise((resolve) => socket.addEventListener("open", resolve, { once: true }));
let serial = 0; const pending = new Map(); socket.addEventListener("message", (event) => { const message = JSON.parse(event.data); const request = pending.get(message.id); if (!request) return; pending.delete(message.id); request.resolve(message.result); }); const send = (method, params = {}) => new Promise((resolve) => { const id = ++serial; pending.set(id, { resolve }); socket.send(JSON.stringify({ id, method, params })); }); await send("Page.enable"); await send("Runtime.enable");
const results = [];
for (const sample of samples) { await send("Page.navigate", { url: `http://127.0.0.1:5181/search?pref=${sample.prefectureId}&region=${encodeURIComponent(sample.regionId)}` }); await new Promise((resolve) => setTimeout(resolve, 500)); const value = JSON.parse((await send("Runtime.evaluate", { expression: `JSON.stringify({count:Number(document.querySelector('.result-summary strong')?.textContent),pref:document.querySelector('select[aria-label="都道府県"]')?.value,region:[...document.querySelectorAll('.facet-bar select')].find(el=>el.parentElement?.textContent?.includes('地域'))?.value})`, returnByValue: true })).result.value); results.push({ id: sample.regionId, expected: sample.dialectCount, ...value }); }
socket.close(); const failures = results.filter((item) => item.count !== item.expected || !item.region || !item.pref); const output = { generatedAt: "2026-09-05", status: failures.length ? "FAILED" : "PASSED", failures, results }; fs.writeFileSync("reports/region-search-browser-audit.json", `${JSON.stringify(output, null, 2)}\n`); console.log(JSON.stringify(output, null, 2)); if (failures.length) process.exitCode = 1;
