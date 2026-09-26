import { describe, it, expect } from "vitest";
import {
  allPageMetadata,
  getPageMetadata,
  structuredData,
  redirects,
  hasCoreEvidence,
  isIndexableDialect,
  isIndexableDialectRoute,
} from "./seo";
import { createDialectRoutePolicy } from "./dialectRoutePolicy.mjs";
import { repository } from "./repository";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { MemoryRouter } from "react-router-dom";
import { Breadcrumbs } from "./Breadcrumbs";

describe("publication and route integrity", () => {
  it("exposes one canonical, indexable map entry without query variants", () => {
    const map = getPageMetadata("/map");
    expect(map.indexable).toBe(true);
    expect(map.path).toBe("/map");
    expect(allPageMetadata.filter((page) => page.path.startsWith("/map"))).toHaveLength(1);
  });
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
  it("indexes only region collections with at least five core-evidence records", () => {
    expect(getPageMetadata("/search").indexable).toBe(false);
    for (const r of repository.regions()) {
      const evidence = repository.dialects({ regionId: r.id }).filter(hasCoreEvidence);
      expect(getPageMetadata(`/regions/${r.id}`).indexable).toBe(evidence.length >= 5);
    }
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
  it("does not require optional reading, example, usage, or description length", () => {
    const good = repository.dialects().find(isIndexableDialect)!;
    const withoutOptionalEvidence = {
      ...good,
      reading: "",
      exampleDialect: "",
      exampleStandard: "",
      usageContexts: [],
      usageFrequency: "unknown",
      description: "短い説明",
      source: {
        ...good.source!,
        evidenceScopes: ["phrase", "meaning", "region"],
      },
      additionalSources: [],
    };
    expect(isIndexableDialect(withoutOptionalEvidence)).toBe(true);
    for (const missing of ["phrase", "meaning", "region"] as const) {
      expect(isIndexableDialect({
        ...withoutOptionalEvidence,
        source: {
          ...withoutOptionalEvidence.source,
          evidenceScopes: withoutOptionalEvidence.source.evidenceScopes.filter((scope) => scope !== missing),
        },
      })).toBe(false);
    }
    expect(isIndexableDialect({ ...withoutOptionalEvidence, verificationStatus: "needs_review" })).toBe(false);
    expect(isIndexableDialect({ ...withoutOptionalEvidence, source: undefined, additionalSources: [] })).toBe(false);
    expect(isIndexableDialect(repository.archivedDialects()[0])).toBe(false);
  });
  it("keeps unresolved exact record identities out of the page index", () => {
    const indexedDialectPaths = allPageMetadata
      .filter((page) => page.indexable && page.path.startsWith("/dialects/"))
      .map((page) => page.path);
    expect(new Set(indexedDialectPaths).size).toBe(indexedDialectPaths.length);
    expect(getPageMetadata("/dialects/jp-32-shimane-049").indexable).toBe(false);
    expect(getPageMetadata("/dialects/jp-32-shimane-050").indexable).toBe(false);
    expect(isIndexableDialect(repository.dialect("jp-32-shimane-049")!)).toBe(true);
    expect(isIndexableDialectRoute(repository.dialect("jp-32-shimane-049")!)).toBe(false);
  });
  it("separates core publishability from route identity safety", () => {
    const good = repository.dialects().find(isIndexableDialect)!;
    const collision = { ...good, id: `${good.id}-collision` };
    const policy = createDialectRoutePolicy([good, collision]);
    expect(isIndexableDialect(good)).toBe(true);
    expect(policy.identityCollisions).toHaveLength(1);
    expect(policy.isRouteIndexable(good)).toBe(false);
    expect(policy.isRouteIndexable(collision)).toBe(false);
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
