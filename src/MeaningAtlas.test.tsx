import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { Dialect } from "./domain";
import { repository } from "./repository";
import { MeaningComparison, MeaningComparisonExample } from "./MeaningAtlas";

describe("MeaningComparisonExample", () => {
  it("does not render either stored example field without example evidence", () => {
    const current = repository.dialects()[0]!;
    const item = {
      ...current,
      exampleDialect: "未確認の方言例文",
      exampleStandard: "未確認の標準語訳",
      source: {
        ...current.source!,
        evidenceScopes: ["phrase", "meaning", "region"],
      },
      additionalSources: [],
    } as Dialect;
    const html = renderToStaticMarkup(<MeaningComparisonExample item={item} />);
    expect(html).toContain("用例は確認中です");
    expect(html).toContain("出典で確認できる用例を確認中です");
    expect(html).not.toContain("未確認の方言例文");
    expect(html).not.toContain("未確認の標準語訳");
  });
});

describe("MeaningComparison related reading", () => {
  it("links the jurui comparison to the matching Yaizu life-context guide", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/meanings/jurui-muddy-regional-words"]}>
        <Routes>
          <Route path="/meanings/:slug" element={<MeaningComparison />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(html).toContain('id="comparison-related-reading-heading"');
    expect(html).toContain("焼津の暮らしの場面へ進む");
    expect(html).toContain("足元・食べ物・手の感覚");
    expect(html).toContain(
      'href="/guides/culture/yaizu-ground-temperature-body-words"',
    );
    expect(html).toContain("冷たさ・ぬかるみ・かじかみを場面でたどる");
  });
});
