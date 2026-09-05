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
const urls = [
  "jp-46-kagoshima-022",
  "jp-46-kagoshima-049",
  "jp-06-yamagata-001",
];
const widths = [1440, 390];
const results = [];
for (const width of widths) {
  await send("Emulation.setDeviceMetricsOverride", { width, height: 1600, deviceScaleFactor: 1, mobile: width === 390 });
  for (const dialectId of urls) {
    await send("Page.navigate", { url: `http://127.0.0.1:5181/dialects/${dialectId}` });
    await new Promise((resolve) => setTimeout(resolve, 500));
    const evaluation = await send("Runtime.evaluate", {
      expression: `JSON.stringify({
        innerWidth,
        documentScrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) > innerWidth,
        version: document.querySelector('[data-dialect-detail-version]')?.getAttribute('data-dialect-detail-version'),
        h1: document.querySelector('h1')?.textContent?.trim(),
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content,
        canonical: document.querySelector('link[rel="canonical"]')?.href,
        hasUnknown: /\\b(?:unknown|undefined|null|NaN)\\b/.test(document.body.innerText),
        sourceCount: document.querySelectorAll('.v2-source-list > p').length,
        exampleText: document.querySelector('.v2-example-card')?.innerText?.trim()
      })`,
      returnByValue: true,
    });
    results.push({ dialectId, width, ...JSON.parse(evaluation.result.value) });
  }
}
socket.close();
console.log(JSON.stringify(results, null, 2));
