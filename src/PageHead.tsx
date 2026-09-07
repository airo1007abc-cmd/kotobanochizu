import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getPageMetadata, structuredData } from "./seo";

export function PageHead() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
  }, [pathname]);
  useEffect(() => {
    const page = getPageMetadata(pathname);
    const origin =
      document.documentElement.dataset.siteOrigin || window.location.origin;
    const url = origin + encodeURI(page.path);
    const meta = (name: string, content: string, property = false) => {
      const attribute = property ? "property" : "name";
      let el = document.head.querySelector<HTMLMetaElement>(
        `meta[${attribute}="${name}"]`,
      );
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attribute, name);
        document.head.append(el);
      }
      el.content = content;
    };
    document.title = page.title;
    meta("description", page.description);
    meta("robots", page.indexable ? "index,follow" : "noindex,follow");
    meta("og:title", page.title, true);
    meta("og:description", page.description, true);
    meta("og:url", url, true);
    let canonical = document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.append(canonical);
    }
    canonical.href = url;
    let schema = document.getElementById("page-schema");
    if (!schema) {
      schema = document.createElement("script");
      schema.id = "page-schema";
      schema.setAttribute("type", "application/ld+json");
      document.head.append(schema);
    }
    schema.textContent = JSON.stringify(structuredData(page, origin));
  }, [pathname, search]);
  return null;
}
