import { describe, it, expect } from "vitest";
import {
  allPageMetadata,
  getPageMetadata,
  structuredData,
  redirects,
  hasCoreEvidence,
  isIndexableDialect,
} from "./seo";
import { repository } from "./repository";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { MemoryRouter } from "react-router-dom";
import { Breadcrumbs } from "./Breadcrumbs";

describe("publication and route integrity", () => {
  it("resolves every public record and every breadcrumb to a real route", () => {
    const paths = new Set(allPageMetadata.map((p) => p.path));
    expect(paths.size).toBe(allPageMetadata.length);
    for (const p of allPageMetadata) {
      expect(p.title.trim()).not.toBe("");
      expect(p.description.trim()).not.toBe("");
      for (const c of p.breadcrumbs)
        expect(paths.has(c.path), `${p.path} -> ${c.path}`).toBe(true);
    }
    for (const d of repository.dialects())
      expect(paths.has(`/dialects/${d.id}`)).toBe(true);
  });
  it("uses the same decision for direct, encoded and trailing-slash navigation", () => {
    for (const p of allPageMetadata)
      expect(getPageMetadata(encodeURI(p.path) + "/")).toEqual(p);
    expect(getPageMetadata("/not-a-page").indexable).toBe(false);
    expect(getPageMetadata("/regions/%E0%A4%A").path).toBe("/404");
  });
  it("keeps search, empty regions and unsupported collections out of the index", () => {
    expect(getPageMetadata("/search").indexable).toBe(false);
    for (const r of repository.regions())
      expect(getPageMetadata(`/regions/${r.id}`).indexable).toBe(false);
    for (const p of repository.prefectures()) {
      const evidence = repository
        .dialects({ prefectureId: p.id })
        .filter(hasCoreEvidence);
      expect(getPageMetadata(`/prefectures/${p.id}`).indexable).toBe(
        evidence.length >= 5,
      );
    }
  });
  it("never counts untraceable source claims as evidence", () => {
    const good = repository.dialects().find(isIndexableDialect)!;
    expect(isIndexableDialect(good)).toBe(true);
    expect(
      isIndexableDialect({ ...good, source: undefined, additionalSources: [] }),
    ).toBe(false);
    expect(
      hasCoreEvidence({
        ...good,
        source: { ...good.source!, evidenceScopes: ["phrase", "meaning"] },
        additionalSources: [],
      }),
    ).toBe(false);
    expect(
      hasCoreEvidence({
        ...good,
        reading: "",
        exampleDialect: "",
        exampleStandard: "",
      }),
    ).toBe(true);
    expect(
      isIndexableDialect({ ...good, verificationStatus: "needs_review" }),
    ).toBe(false);
  });
  it("preserves approved legacy redirects without chains", () => {
    for (const [from, to] of Object.entries(redirects)) {
      expect(redirects[to]).toBeUndefined();
      expect(getPageMetadata(from).path).toBe(to);
      expect(repository.dialect(from.split("/").pop()!)?.id).toBe(
        to.split("/").pop(),
      );
    }
  });
  it("renders breadcrumb labels from the same data as JSON-LD", () => {
    for (const path of [
      "/prefectures/p42",
      "/regions/r1",
      "/dialects/jp-40-fukuoka-011",
      allPageMetadata.find((p) => p.path.startsWith("/meanings/"))!.path,
    ]) {
      const p = getPageMetadata(path);
      const html = renderToStaticMarkup(
        createElement(
          MemoryRouter,
          { initialEntries: [path] },
          createElement(Breadcrumbs),
        ),
      );
      for (const c of structuredData(p, "https://kotobanochizu.jp")
        .itemListElement)
        expect(html).toContain(c.name);
    }
  });
});
