import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { HomeDiscovery } from "./HomeDiscovery";
import { homeScenes } from "./homeDiscovery";
import { allPageMetadata } from "./seo";
import contextGuides from "./data/context-guides.json";
import { repository } from "./repository";
import { hasEvidenceScope } from "./evidencePolicy.mjs";
import App from "./App";
import { isPreview } from "./siteConfig";

const render = () =>
  renderToStaticMarkup(
    <MemoryRouter>
      <HomeDiscovery />
    </MemoryRouter>,
  );

describe("homepage discovery", () => {
  it("provides three reader-facing entrances without a process or editorial-policy card", () => {
    const html = render();
    for (const path of ["/prefectures", "/meanings", "/conversations"])
      expect(html).toContain(`href="${path}"`);
    expect(html.match(/class="journey-card /g)).toHaveLength(3);
    expect(html).not.toMatch(/編集方針|根拠まで|TRUST|出典、話者確認/);
  });

  it("links every scene directly to an existing, populated guide with evidenced examples", () => {
    expect(homeScenes).toHaveLength(6);
    const html = render();
    expect(html).toContain('class="situation-grid"');
    expect(html).not.toContain("/search?q=");
    expect(new Set(homeScenes.map((scene) => scene.path)).size).toBe(
      homeScenes.length,
    );
    for (const scene of homeScenes) {
      expect(html).toContain(`href="${scene.path}"`);
      expect(
        allPageMetadata.find((page) => page.path === scene.path)?.indexable,
      ).toBe(true);
      const guide = contextGuides.find((item) => item.slug === scene.slug)!;
      expect(scene.count).toBe(guide.dialectIds.length);
      expect(scene.count).toBeGreaterThan(0);
      for (const id of guide.dialectIds) {
        const record = repository.dialect(id)!;
        expect(record).toBeDefined();
        expect(hasEvidenceScope(record, "example")).toBe(true);
        expect(record.exampleDialect).toBeTruthy();
        expect(record.exampleStandard).toBeTruthy();
      }
    }
  });

  it("keeps the editorial-policy link and record cautions outside the discovery cards", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    expect(html).not.toContain('class="archive-manifesto"');
    expect(html).not.toContain('class="preview-banner"');
    expect(html).toContain('href="/editorial-policy"');
    expect(html).toContain("掲載内容は地域・家庭・世代で異なる使用例です");
  });
  it("keeps preview-state disclosure available away from the homepage", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/search"]}>
        <App />
      </MemoryRouter>,
    );
    expect(html.includes('class="preview-banner"')).toBe(isPreview);
  });
});
