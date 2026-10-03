import { describe, expect, it } from "vitest";
import relatedReadings from "./data/related-readings.json";
import { getPageMetadata } from "./seo";

describe("related readings", () => {
  it("only connects unique, indexable pages", () => {
    const fromPaths = relatedReadings.map((item) => item.fromPath);
    expect(new Set(fromPaths).size).toBe(fromPaths.length);

    for (const item of relatedReadings) {
      expect(getPageMetadata(item.fromPath).indexable).toBe(true);
      expect(getPageMetadata(item.toPath).indexable).toBe(true);
    }
  });
});
