import { renderToReadableStream, renderToStaticMarkup } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import App from "./App";
export {
  allPageMetadata,
  getPageMetadata,
  redirects,
  structuredData,
} from "./seo";

export async function renderPage(path: string) {
  const errors: unknown[] = [];
  const stream = await renderToReadableStream(
    <StaticRouter location={encodeURI(path)}>
      <App />
    </StaticRouter>,
    {
      onError: (error) => {
        errors.push(error);
      },
    },
  );
  await stream.allReady;
  await new Response(stream).text();
  if (errors.length)
    throw new Error(`Render failed: ${path}: ${String(errors[0])}`);
  return renderToStaticMarkup(
    <StaticRouter location={encodeURI(path)}>
      <App />
    </StaticRouter>,
  );
}
