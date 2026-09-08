import { describe, expect, it } from "vitest";
import { isEditorialExampleNotice, recordDescription } from "./editorialDisplay";

describe("public editorial display", () => {
  it("keeps the uncertainty when updating obsolete pre-publication wording", () => {
    expect(recordDescription("公開前に地域話者または参照資料による追加確認が必要です。")).toContain("追加確認が必要");
  });
  it("excludes workflow notes from examples without hiding genuine dialect text", () => {
    expect(isEditorialExampleNotice("資料に方言例文あり（最終公開前に原文転記確認）")).toBe(true);
    expect(isEditorialExampleNotice("「なまら」を使う会話例は確認・収集中です。")).toBe(true);
    expect(isEditorialExampleNotice("ユキガ　フライデモネー……")).toBe(false);
  });
});
