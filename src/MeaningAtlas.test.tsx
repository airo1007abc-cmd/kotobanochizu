import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Dialect } from "./domain";
import { repository } from "./repository";
import { MeaningComparisonExample } from "./MeaningAtlas";

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
