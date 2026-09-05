import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
// @ts-expect-error -- Vitest runs in Node; the production TS config intentionally excludes Node globals.
import { mkdirSync, writeFileSync } from "node:fs";
import type { Dialect } from "./domain";
import { createDialectDetailViewModel } from "./dialectDetailViewModel";
import { repository } from "./repository";
import { dialectDetailVersion } from "./dialectDetailVersion";
import { DialectDetailV2 } from "./DialectDetailV2";

const makeViewModel = (dialect: Dialect) => createDialectDetailViewModel(dialect, {
  prefectureName: (id) => repository.prefectures().find((item) => item.id === id)?.name,
  regionName: (id) => repository.regions().find((item) => item.id === id)?.name,
});

describe("DialectDetailViewModel", () => {
  it("converts the complete catalogue and routes every id to V2", () => {
    const dialects = repository.dialects();
    expect(dialects).toHaveLength(1643);
    const invalidTokens = /(^|[\s"':])(unknown|undefined|null|nan|\[object Object\])([\s"',:]|$)/i;

    for (const dialect of dialects) {
      const viewModel = makeViewModel(dialect);
      expect(viewModel.id).toBe(dialect.id);
      expect(viewModel.word).toBeTruthy();
      expect(viewModel.meanings.length || viewModel.isResearchPending).toBeTruthy();
      expect(Array.isArray(viewModel.examples)).toBe(true);
      expect(viewModel.primaryRegion).toBeTruthy();
      expect(Array.isArray(viewModel.locationBadges)).toBe(true);
      expect(Array.isArray(viewModel.sources)).toBe(true);
      expect(Array.isArray(viewModel.verifiedItems)).toBe(true);
      expect(Array.isArray(viewModel.pendingItems)).toBe(true);
      expect(JSON.stringify(viewModel)).not.toMatch(invalidTokens);
      expect(dialectDetailVersion()).toBe("v2");
    }
  });

  it("server-renders every catalogue entry through V2 without legacy UI or broken text", () => {
    const invalidText = /(^|[>\s])(unknown|undefined|null|nan|\[object Object\])([<\s]|$)/i;
    for (const dialect of repository.dialects()) {
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={[`/dialects/${dialect.id}`]}>
          <DialectDetailV2 dialect={dialect} />
        </MemoryRouter>,
      );
      expect(html).toContain('class="dialect-v2"');
      expect(html).toContain("<h1");
      expect(html).not.toContain("ARCHIVE RECORD");
      expect(html).not.toContain("あなたはこのことばを…");
      expect(html).not.toMatch(invalidText);
      expect((html.match(/class="v2-related-card"/g) ?? []).length).toBeLessThanOrEqual(4);
    }
  }, 60_000);

  it("reports catalogue-wide display risks and a diverse visual sample", () => {
    const dialects = repository.dialects();
    const rows = dialects.map((dialect) => {
      const vm = makeViewModel(dialect);
      return {
        id: dialect.id,
        word: vm.word,
        prefecture: vm.prefecture.name,
        wordLength: vm.word.length,
        meaningLength: vm.meanings.join(" ").length,
        sources: vm.sources.length,
        locations: vm.locationBadges.length,
        meanings: vm.meanings.length,
        examples: vm.examples.length,
        missingReading: !vm.reading,
        missingDescription: !vm.description,
        missingMeaning: vm.meanings.length === 0,
        missingExample: vm.examples.length === 0,
        missingSource: vm.sources.length === 0,
        regionPending: vm.primaryRegion.name === "地域確認中",
      };
    });
    const by = (key: keyof (typeof rows)[number]) => rows.filter((row) => Boolean(row[key])).length;
    const riskyIds = new Set(rows.filter((row) => row.missingReading || row.missingDescription || row.missingMeaning || row.missingExample || row.missingSource || row.regionPending).map((row) => row.id));
    const seedIds = ["jp-41-saga-001", "jp-38-ehime-039", "jp-34-hiroshima-001", "jp-43-kumamoto-010", "jp-46-kagoshima-044", "jp-36-tokushima-006"];
    const extremes = [
      ...[...rows].sort((a, b) => b.wordLength - a.wordLength).slice(0, 5),
      ...[...rows].sort((a, b) => b.meaningLength - a.meaningLength).slice(0, 5),
      ...[...rows].sort((a, b) => b.sources - a.sources || b.locations - a.locations).slice(0, 5),
      ...rows.filter((row) => row.missingExample || row.missingReading || row.missingSource).slice(0, 10),
    ];
    const selected = new Map<string, (typeof rows)[number]>();
    for (const id of seedIds) {
      const row = rows.find((candidate) => candidate.id === id);
      if (row) selected.set(row.id, row);
    }
    for (const row of extremes) selected.set(row.id, row);
    for (const row of rows) {
      if (selected.size >= 40) break;
      if (![...selected.values()].some((item) => item.prefecture === row.prefecture)) selected.set(row.id, row);
    }
    for (const row of rows) {
      if (selected.size >= 40) break;
      selected.set(row.id, row);
    }
    const report = {
      total: rows.length,
      warnings: {
        missingReading: by("missingReading"),
        missingDescription: by("missingDescription"),
        missingMeaning: by("missingMeaning"),
        missingExample: by("missingExample"),
        missingSource: by("missingSource"),
        regionPending: by("regionPending"),
      },
      contentAuditDialectCount: riskyIds.size,
      visualSample: [...selected.values()].map(({ id, word, prefecture }) => ({ id, word, prefecture })),
      issues: rows.flatMap((row) => {
        const issues = [
          row.missingReading && "missing_reading",
          row.missingDescription && "missing_description",
          row.missingMeaning && "missing_meaning",
          row.missingExample && "missing_example",
          row.missingSource && "missing_source",
          row.regionPending && "region_pending",
        ].filter((issue): issue is string => Boolean(issue));
        return issues.length ? [{ id: row.id, word: row.word, prefecture: row.prefecture, issues }] : [];
      }),
    };
    expect(selected.size).toBe(40);
    expect(rows.filter((row) => row.missingMeaning).length).toBe(0);
    expect(rows.filter((row) => row.regionPending).length).toBe(0);
    mkdirSync("reports", { recursive: true });
    writeFileSync("reports/dialect-v2-content-audit.json", `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(`DIALECT_V2_AUDIT ${JSON.stringify({ ...report, issues: `${report.issues.length}件をreports/dialect-v2-content-audit.jsonへ記録` })}`);
  });

  it("does not reuse description as nuance and normalizes a missing example", () => {
    const dialect = repository.dialect("jp-46-kagoshima-044")!;
    const viewModel = makeViewModel(dialect);
    expect(viewModel.description).toBeTruthy();
    expect(viewModel.nuance).toBeUndefined();
    expect(viewModel.examples).toEqual([]);
    expect(viewModel.pendingItems).toContain("自然な用例");
  });

  it("normalizes primary and additional sources", () => {
    const viewModel = makeViewModel(repository.dialect("jp-34-hiroshima-001")!);
    expect(viewModel.sources).toHaveLength(2);
    expect(viewModel.verifiedItems).toContain("例文");
  });

  it("separates multiple recorded locations into badges", () => {
    const viewModel = makeViewModel(repository.dialect("jp-43-kumamoto-010")!);
    expect(viewModel.primaryRegion.name).toBe("熊本周辺");
    expect(viewModel.locationBadges).toEqual(["熊本市", "玉名市"]);
  });

  it("accepts future nuance and multiple examples without changing Dialect", () => {
    const current = repository.dialect("jp-41-saga-001")!;
    const future = {
      ...current,
      nuance: "将来追加された専用ニュアンス",
      examples: [
        { dialect: "例文一", standard: "標準語一" },
        { dialect: "例文二", standard: "標準語二" },
      ],
      exampleDialect: "",
      exampleStandard: "",
    } as Dialect & { nuance: string; examples: Array<{ dialect: string; standard: string }> };
    const viewModel = makeViewModel(future);
    expect(viewModel.nuance).toBe("将来追加された専用ニュアンス");
    expect(viewModel.examples).toHaveLength(2);
  });

  it("normalizes future multiple meanings without changing the current schema", () => {
    const current = repository.dialect("jp-41-saga-001")!;
    const future = {
      ...current,
      meanings: [current.standardJapanese, "大変に", "unknown", "大変に"],
    } as Dialect & { meanings: string[] };
    expect(makeViewModel(future).meanings).toEqual([current.standardJapanese, "大変に"]);
  });

  it("never exposes raw missing-value tokens", () => {
    const current = repository.dialect("jp-41-saga-001")!;
    const viewModel = makeViewModel({
      ...current,
      reading: "unknown",
      description: "null",
      updatedAt: "undefined",
    });
    expect(viewModel.reading).toBeUndefined();
    expect(viewModel.description).toBeUndefined();
    expect(viewModel.updatedAt).toBeUndefined();
    expect(JSON.stringify(viewModel)).not.toMatch(/"unknown"|"undefined"|"null"/);
  });
});
