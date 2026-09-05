const targets = await (await fetch("http://127.0.0.1:9223/json")).json();
const page = targets.find((item) => item.type === "page");
if (!page) throw new Error("Chrome DevTools page target not found");
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});
let id = 0;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  const request = pending.get(message.id);
  if (!request) return;
  pending.delete(message.id);
  message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result);
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const requestId = ++id;
  pending.set(requestId, { resolve, reject });
  socket.send(JSON.stringify({ id: requestId, method, params }));
});
await send("Page.enable");
await send("Runtime.enable");
const expected = new Map([
  ["jp-40-fukuoka-006", "標準語の「修理する」とは異なる"],
  ["jp-07-fukushima-001", "ねっかさすけねえ"],
  ["jp-43-kumamoto-003", "一般名詞の「町」ではなく"],
  ["jp-44-oita-001", "おっくうになり気が進まない"],
  ["jp-09-tochigi-001", "特にダイジは若い人も使う"],
]);
const ids = [...expected.keys()];
const results = [];
for (const width of [1440, 390]) {
  await send("Emulation.setDeviceMetricsOverride", { width, height: 1600, deviceScaleFactor: 1, mobile: width === 390 });
  for (const dialectId of ids) {
    await send("Page.navigate", { url: `http://127.0.0.1:5181/dialects/${dialectId}` });
    await new Promise((resolve) => setTimeout(resolve, 600));
    const evaluation = await send("Runtime.evaluate", {
      expression: `JSON.stringify({
        innerWidth,
        documentScrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) > innerWidth,
        version: document.querySelector('.dialect-v2') ? 'v2' : document.querySelector('[data-dialect-detail-version]')?.getAttribute('data-dialect-detail-version'),
        h1: document.querySelector('h1')?.textContent?.trim(),
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content,
        canonical: document.querySelector('link[rel="canonical"]')?.href,
        hasRawMissing: /\\b(?:unknown|undefined|null|NaN)\\b/.test(document.body.innerText),
        hasSources: Boolean(document.querySelector('.v2-source-list')),
        bodyText: document.body.innerText.slice(0, 4000)
      })`,
      returnByValue: true,
    });
    const value = JSON.parse(evaluation.result.value);
    results.push({ dialectId, width, ...value, expectedContentVisible: value.bodyText.includes(expected.get(dialectId)), bodyText: undefined });
  }
}
socket.close();
const failed = results.filter((row) => row.overflow || row.version !== "v2" || row.hasRawMissing || !row.h1 || !row.hasSources || !row.expectedContentVisible);
console.log(JSON.stringify({ status: failed.length ? "FAILED" : "PASSED", checked: results.length, failed, results }, null, 2));
if (failed.length) process.exitCode = 1;
