import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const projectRoot = process.cwd();
const distDir = join(projectRoot, "dist");
const template = await readFile(join(distDir, "index.html"), "utf8");
const readSiteUrl = async () => {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  for (const name of [
    ".env.production.local",
    ".env.production",
    ".env.local",
  ]) {
    const content = await readFile(join(projectRoot, name), "utf8").catch(
      () => "",
    );
    const match = content.match(/^SITE_URL\s*=\s*(.+)$/m);
    if (match) return match[1].trim().replace(/^['"]|['"]$/g, "");
  }
  return "";
};
const siteOrigin = (await readSiteUrl()).trim().replace(/\/$/, "");

const regionCatalog = JSON.parse(
  await readFile(join(projectRoot, "src/data/regions.json"), "utf8"),
);
const prefectureNames = Object.keys(regionCatalog);
const prefectures = prefectureNames.map((name, index) => ({
  id: `p${index + 1}`,
  name,
}));

const dialectFiles = await readdir(join(projectRoot, "src/data/dialects"));
const nationalDialects = (
  await Promise.all(
    dialectFiles
      .filter((file) => file.endsWith(".json"))
      .map(async (file) =>
        JSON.parse(
          await readFile(join(projectRoot, "src/data/dialects", file), "utf8"),
        ),
      ),
  )
).flat();
const meaningComparisons = JSON.parse(
  await readFile(join(projectRoot, "src/data/meaning-comparisons.json"), "utf8"),
);
const regionGuides = JSON.parse(
  await readFile(join(projectRoot, "src/data/region-guides.json"), "utf8"),
);
const cultureGuides = JSON.parse(
  await readFile(join(projectRoot, "src/data/culture-guides.json"), "utf8"),
);
const contextGuides = JSON.parse(
  await readFile(join(projectRoot, "src/data/context-guides.json"), "utf8"),
);

const quoted = '"((?:[^"\\\\]|\\\\.)*)"';
const parseQuoted = (value) => JSON.parse(`"${value}"`);
const baseSource = await readFile(join(projectRoot, "src/data.ts"), "utf8");
const extendedSource = await readFile(join(projectRoot, "src/extendedData.ts"), "utf8");
const basePattern = new RegExp(
  `base\\(\\s*${quoted},\\s*${quoted},\\s*${quoted},\\s*${quoted},\\s*${quoted},\\s*${quoted},\\s*${quoted},\\s*${quoted},\\s*${quoted}`,
  "g",
);
const seedPattern = new RegExp(
  `\\[\\s*${quoted},\\s*${quoted},\\s*${quoted},\\s*${quoted},\\s*${quoted},\\s*${quoted},\\s*${quoted},\\s*${quoted},\\s*${quoted},\\s*${quoted},\\s*${quoted}\\s*,?\\s*\\]`,
  "g",
);
const legacyFromMatch = (match) => ({
  id: parseQuoted(match[1]),
  phrase: parseQuoted(match[2]),
  reading: parseQuoted(match[3]),
  standardJapanese: parseQuoted(match[4]),
  description: parseQuoted(match[5]),
  exampleDialect: parseQuoted(match[6]),
  exampleStandard: parseQuoted(match[7]),
  prefectureName: parseQuoted(match[8]),
  regionName: parseQuoted(match[9]),
  verificationStatus: "demo_candidate",
});
const legacyDialects = [
  ...[...baseSource.matchAll(basePattern)].map(legacyFromMatch),
  ...[
    ...extendedSource
      .slice(
        extendedSource.indexOf("const seeds"),
        extendedSource.indexOf("export const moreDialects"),
      )
      .matchAll(seedPattern),
  ].map(legacyFromMatch),
];
const legacyConversations = [
  ["c1", "帰り道、夕飯の相談", "気心の知れた二人が、帰り道に話す短い確認前の会話です。"],
  ["c2", "写真を見ながら", "家族で昔の写真を眺める確認前の会話です。"],
  ["c3", "夕飯前の台所", "家族・食事の中で交わされる確認前の会話です。"],
  ["c4", "放課後の約束", "学校・友人の中で交わされる確認前の会話です。"],
  ["c5", "商店街でおつかい", "買い物・家族の中で交わされる確認前の会話です。"],
  ["c6", "友人への恋愛相談", "恋愛・友人の中で交わされる確認前の会話です。"],
  ["c7", "雪の朝の玄関", "家族・学校の中で交わされる確認前の会話です。"],
  ["c8", "祭りへ向かう道", "友人・行事の中で交わされる確認前の会話です。"],
];

const generalRoutes = [
  [
    "/",
    "ことばの地図｜声と暮らしでたどる日本の地域言語文化",
    "日本全国の方言と地域のことばを、土地・世代・暮らしの場面・確認状態とともに残す地域言語文化アーカイブ。",
  ],
  [
    "/prefectures",
    "47都道府県のことば｜ことばの地図",
    "47都道府県、171の地域区分から、暮らしのことばを探せます。",
  ],
  [
    "/search",
    "方言・地域のことばを検索｜ことばの地図",
    "方言、読み、標準語、地域、世代、暮らしの場面、確認状態から使用例を検索できます。",
  ],
  [
    "/compare",
    "全国ことばくらべ｜ことばの地図",
    "同じ場面のことばを福岡、大阪、青森の使用例で比べます。",
  ],
  [
    "/meanings",
    "一つの意味、全国のことば｜ことばの地図",
    "ありがとう、とても、がんばる。ひとつの意味が各地でどう響くかを横断して比べます。",
  ],
  [
    "/conversations",
    "地域の会話｜ことばの地図",
    "単語だけでは伝わらない地域のことばの間合いと温度を、短い会話からたどります。",
  ],
  [
    "/quiz",
    "方言クイズ｜ことばの地図",
    "地域のことばをクイズで楽しく学びます。",
  ],
  [
    "/favorites",
    "お気に入り｜ことばの地図",
    "気になった地域のことばを、この端末に保存して振り返れます。",
  ],
  [
    "/submit",
    "地域のことばを残す｜ことばの地図",
    "地域・家庭・世代で使われることばを、一つの使用例として投稿するための公開前デモです。",
  ],
  [
    "/editorial-policy",
    "編集方針と信頼性｜ことばの地図",
    "確認状態、出典、話者の権利を明示する、ことばの地図の編集方針です。",
  ],
  [
    "/for-organizations",
    "自治体・教育・研究機関の方へ｜ことばの地図",
    "共同収録、地域探究、教材、展示、研究データに向けた連携方針。",
  ],
  [
    "/sustainability",
    "文化を支える仕組み｜ことばの地図",
    "基本の文化アーカイブを無料で開きながら、個人支援と組織向けサービスで継続する方針。",
  ],
  [
    "/corrections",
    "訂正・権利の申請｜ことばの地図",
    "誤り、地域差、権利侵害、同意撤回について知らせるための受付です。",
  ],
  [
    "/privacy",
    "プライバシーについて｜ことばの地図",
    "ことばの地図における個人情報、端末保存、音声・映像の取扱方針。",
  ],
  [
    "/terms",
    "利用・投稿・権利について｜ことばの地図",
    "地域文化と話者・投稿者の権利を守るための利用・投稿方針。",
  ],
];

const primaryRegions = [
  [40, "r1", "福岡市周辺"],
  [40, "r2", "北九州"],
  [40, "r3", "筑後"],
  [27, "r4", "大阪市"],
  [27, "r5", "河内"],
  [27, "r6", "泉州"],
  [2, "r7", "津軽"],
  [2, "r8", "南部"],
  [2, "r9", "下北"],
];
const primaryRegionKeys = new Set(
  primaryRegions.map(([code, , name]) => `${code}:${name}`),
);
const regionRoutes = [
  ...primaryRegions.map(([code, id, name]) => {
    const prefectureName = prefectureNames[Number(code) - 1];
    return [
      `/regions/${id}`,
      `${name}の方言・地域のことば（${prefectureName}）｜ことばの地図`,
      `${prefectureName}・${name}で使われることばを、世代・場面・確認状態とともに紹介します。`,
    ];
  }),
  ...Object.entries(regionCatalog).flatMap(([prefectureName, names]) => {
    const code = prefectureNames.indexOf(prefectureName) + 1;
    return names
      .filter((name) => !primaryRegionKeys.has(`${code}:${name}`))
      .map((name) => [
        `/regions/jp-${String(code).padStart(2, "0")}-region-${name}`,
        `${name}の方言・地域のことば（${prefectureName}）｜ことばの地図`,
        `${prefectureName}・${name}で使われることばを、世代・場面・確認状態とともに紹介します。`,
      ]);
  }),
];

const routes = [
  ...generalRoutes,
  ...prefectures.map(({ id, name }) => [
    `/prefectures/${id}`,
    `${name}の方言・地域のことば｜ことばの地図`,
    `${name}で受け継がれる方言と地域のことばを、地域差・世代・使用場面・確認状態とともに紹介します。`,
  ]),
  ...regionRoutes,
  ...legacyDialects.map((item) => [
    `/dialects/${item.id}`,
    `${item.phrase}の意味・使い方（${item.municipality ? `${item.municipality}・` : ""}${item.prefectureName}）｜ことばの地図`,
    `${item.prefectureName}・${item.regionName}での「${item.phrase}」の確認前使用例。標準語では「${item.standardJapanese}」。地域差と確認状態を明示します。`,
  ]),
  ...nationalDialects.map((item) => [
    `/dialects/${item.id}`,
    `${item.phrase}の意味・使い方（${item.municipality ? `${item.municipality}・` : ""}${item.prefectureName}）｜ことばの地図`,
    `${item.prefectureName}・${item.regionName}での「${item.phrase}」の使用例。標準語では「${item.standardJapanese}」。確認状態と地域差を明示して紹介します。`,
  ]),
  ...meaningComparisons.map((item) => [
    `/meanings/${item.slug}`,
    `${item.title}｜ことばの地図`,
    item.description,
  ]),
  ...regionGuides.map((item) => [
    `/guides/regions/${item.slug}`,
    `${item.title}｜ことばの地図`,
    item.description,
  ]),
  ...cultureGuides.map((item) => [
    `/guides/culture/${item.slug}`,
    `${item.title}｜ことばの地図`,
    item.description,
  ]),
  ...contextGuides.map((item) => [
    `/stories/${item.slug}`,
    `${item.title}｜ことばの地図`,
    item.description,
  ]),
  ...legacyConversations.map(([id, title, description]) => [
    `/conversations/${id}`,
    `${title}｜地域の会話｜ことばの地図`,
    description,
  ]),
];

const escapeAttribute = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");

const escapeText = (value) =>
  escapeAttribute(String(value)).replaceAll(">", "&gt;");

const isIndexableDialect = (item) => {
  const confirmed = new Set([
    "verified",
    "reference_confirmed",
    "community_confirmed",
  ]);
  const scopes = new Set([
    ...(item.evidenceScopes ?? []),
    ...(item.additionalSources ?? []).flatMap(
      (source) => source.evidenceScopes ?? [],
    ),
  ]);
  return (
    confirmed.has(item.verificationStatus) &&
    item.description?.trim().length >= 100 &&
    item.exampleDialect?.trim() &&
    item.exampleStandard?.trim() &&
    item.sourceTitle?.trim() &&
    item.sourceUrl?.trim() &&
    item.sourceCheckedAt?.trim() &&
    ["phrase", "reading", "meaning", "region", "example", "usage"].every(
      (scope) => scopes.has(scope),
    )
  );
};

const dialectByRoute = new Map(
  [...legacyDialects, ...nationalDialects].map((item) => [
    `/dialects/${item.id}`,
    item,
  ]),
);
const meaningByRoute = new Map(
  meaningComparisons.map((item) => [`/meanings/${item.slug}`, item]),
);
const dialectById = new Map(
  [...legacyDialects, ...nationalDialects].map((item) => [item.id, item]),
);
const regionGuideByRoute = new Map(
  regionGuides.map((item) => [`/guides/regions/${item.slug}`, item]),
);
const cultureGuideByRoute = new Map(
  cultureGuides.map((item) => [`/guides/culture/${item.slug}`, item]),
);
const contextGuideByRoute = new Map(
  contextGuides.map((item) => [`/stories/${item.slug}`, item]),
);
const dialectsForGuide = (guide) =>
  nationalDialects.filter(
    (item) =>
      item.prefectureName === guide.prefectureName &&
      ((Array.isArray(guide.selector.dialectIds) &&
        guide.selector.dialectIds.includes(item.id)) ||
        guide.selector.prefectureWide === true ||
        item.municipality?.startsWith(guide.selector.municipalityPrefix)) &&
      isIndexableDialect(item),
  );

const breadcrumbJson = (route, title) => {
  const parts = route.split("/").filter(Boolean);
  const items = [
    { "@type": "ListItem", position: 1, name: "ホーム", item: siteOrigin || "/" },
  ];
  if (parts.length) {
    const parentName =
      parts[0] === "dialects"
        ? "ことばを探す"
        : parts[0] === "prefectures" || parts[0] === "regions"
          ? "地域から探す"
          : "ことばの地図";
    items.push({
      "@type": "ListItem",
      position: 2,
      name: parentName,
      item: `${siteOrigin}${parts[0] === "dialects" ? "/search" : `/${parts[0]}`}`,
    });
  }
  if (parts.length > 1)
    items.push({
      "@type": "ListItem",
      position: items.length + 1,
      name: title.replace(/｜ことばの地図$/, ""),
      item: `${siteOrigin}${route}`,
    });
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  }).replaceAll("<", "\\u003c");
};

const dialectFallback = (item) => `
    <article class="static-entry" data-seo-fallback="dialect">
      <nav aria-label="パンくず"><a href="/">ホーム</a> / <a href="/search">ことばを探す</a></nav>
      <h1>${escapeText(item.phrase)}の意味・使い方</h1>
      <p>${escapeText(item.description)}</p>
      <dl>
        <div><dt>読み</dt><dd>${escapeText(item.reading)}</dd></div>
        <div><dt>標準語</dt><dd>${escapeText(item.standardJapanese)}</dd></div>
        <div><dt>使用地域</dt><dd>${escapeText(item.prefectureName)}・${escapeText(item.regionName)}</dd></div>
        <div><dt>例</dt><dd>${escapeText(item.exampleDialect)}（${escapeText(item.exampleStandard)}）</dd></div>
        <div><dt>確認状態</dt><dd>${isIndexableDialect(item) ? "出典確認済み" : "確認待ち候補"}</dd></div>
      </dl>
      <p><a href="/search">関連することばを探す</a></p>
    </article>`;

const meaningFallback = (item) => {
  const dialects = item.dialectIds
    .map((id) => dialectById.get(id))
    .filter(Boolean);
  return `
    <article class="static-entry" data-seo-fallback="meaning-comparison">
      <nav aria-label="パンくず"><a href="/">ホーム</a> / <a href="/meanings">意味から比べる</a></nav>
      <h1>${escapeText(item.title.replace(/｜.+$/, ""))}</h1>
      <p>${escapeText(item.description)}</p>
      ${item.indexStatus === "indexable" ? "" : "<p><strong>確認待ち比較：</strong>参照する語の一部は出典・用例の確認中で、このページは検索対象外です。</p>"}
      <h2>地域ごとの言い方</h2>
      <ul>${dialects.map((dialect) => `<li><a href="/dialects/${escapeAttribute(dialect.id)}"><strong>${escapeText(dialect.phrase)}</strong>（${escapeText(dialect.prefectureName)}）— ${escapeText(dialect.standardJapanese)}。例：${escapeText(dialect.exampleDialect)}（${escapeText(dialect.exampleStandard)}）</a></li>`).join("")}</ul>
      <h2>比較するときの注意</h2>
      <p>${escapeText(item.caution)}</p>
      <p>各語の出典または確認状態は個別記事に掲載。比較データ最終確認日：${escapeText(item.sourceCheckedAt)}</p>
    </article>`;
};

const regionGuideFallback = (guide) => {
  const dialects = dialectsForGuide(guide);
  return `
    <article class="static-entry" data-seo-fallback="region-guide">
      <nav aria-label="パンくず"><a href="/">ホーム</a> / <a href="/prefectures">地域から探す</a></nav>
      <h1>${escapeText(guide.title.replace(/｜.+$/, ""))}</h1>
      <p>${escapeText(guide.description)}</p>
      <h2>この地域のことばを読む前に</h2><p>${escapeText(guide.introduction)}</p>
      <h2>確認済みのことば（${dialects.length}語）</h2>
      <ul>${dialects.map((dialect) => `<li><a href="/dialects/${escapeAttribute(dialect.id)}"><strong>${escapeText(dialect.phrase)}</strong> — ${escapeText(dialect.standardJapanese)}</a></li>`).join("")}</ul>
      <h2>主な資料</h2><p><a href="${escapeAttribute(guide.sourceUrl)}">${escapeText(guide.sourceOrganization)}「${escapeText(guide.sourceTitle)}」</a>（確認日：${escapeText(guide.sourceCheckedAt)}）</p>
    </article>`;
};

const cultureGuideFallback = (guide) => {
  const dialects = guide.dialectIds.map((id) => dialectById.get(id)).filter(Boolean);
  return `
    <article class="static-entry" data-seo-fallback="culture-guide">
      <nav aria-label="パンくず"><a href="/">ホーム</a> / 文化・歴史 / ${escapeText(guide.category)}</nav>
      <h1>${escapeText(guide.title.replace(/｜.+$/, ""))}</h1>
      <p>${escapeText(guide.description)}</p>
      <h2>このテーマの見方</h2><p>${escapeText(guide.introduction)}</p>
      <h2>ことばから文化をたどる</h2>
      <ul>${dialects.map((dialect) => `<li><a href="/dialects/${escapeAttribute(dialect.id)}"><strong>${escapeText(dialect.phrase)}</strong> — ${escapeText(dialect.standardJapanese)}</a></li>`).join("")}</ul>
      <h2>根拠資料</h2><p><a href="${escapeAttribute(guide.sourceUrl)}">${escapeText(guide.sourceOrganization)}「${escapeText(guide.sourceTitle)}」</a>（確認日：${escapeText(guide.sourceCheckedAt)}）</p>
    </article>`;
};

const contextGuideFallback = (record) => {
  const dialects = record.dialectIds.map((id) => dialectById.get(id)).filter(Boolean);
  return `
    <article class="static-entry" data-seo-fallback="context-guide">
      <nav aria-label="パンくず"><a href="/">ホーム</a> / <a href="/conversations">地域の会話</a> / ${escapeText(record.format)}</nav>
      <h1>${escapeText(record.title.replace(/｜.+$/, ""))}</h1><p>${escapeText(record.description)}</p>
      <h2>創作会話ではありません</h2><p>${escapeText(record.introduction)}</p>
      <h2>発話と標準語訳</h2>${dialects.map((dialect) => `<section><blockquote>${escapeText(dialect.exampleDialect)}</blockquote><p>${escapeText(dialect.exampleStandard)}</p><a href="/dialects/${escapeAttribute(dialect.id)}">${escapeText(dialect.phrase)}の意味・地域・出典を確認する</a></section>`).join("")}
      <h2>根拠資料</h2><p><a href="${escapeAttribute(record.sourceUrl)}">${escapeText(record.sourceOrganization)}「${escapeText(record.sourceTitle)}」</a>（確認日：${escapeText(record.sourceCheckedAt)}）</p>
    </article>`;
};

const linkList = (items) =>
  `<ul>${items.map(([href, label]) => `<li><a href="${escapeAttribute(href)}">${escapeText(label)}</a></li>`).join("")}</ul>`;

const fallbackNavigation = (route) => {
  const core = [
    ["/", "ホーム"],
    ["/prefectures", "地域から探す"],
    ["/search", "ことばを探す"],
    ["/meanings", "意味から比べる"],
    ["/conversations", "地域の会話"],
  ];
  let children = [];
  if (route === "/")
    children = [
      ...generalRoutes.filter(([path]) => path !== "/").map(([path, title]) => [path, title.replace(/｜ことばの地図$/, "")]),
      ...cultureGuides.map((guide) => [`/guides/culture/${guide.slug}`, guide.title]),
      ...prefectures.map(({ id, name }) => [`/prefectures/${id}`, `${name}のことば`]),
    ];
  else if (route === "/prefectures")
    children = prefectures.map(({ id, name }) => [`/prefectures/${id}`, `${name}のことば`]);
  else if (/^\/prefectures\/p\d+$/.test(route)) {
    const prefecture = prefectures.find(({ id }) => route === `/prefectures/${id}`);
    if (prefecture) {
      const code = prefectureNames.indexOf(prefecture.name) + 1;
      children = [
        ...regionGuides.filter((guide) => guide.prefectureName === prefecture.name).map((guide) => [`/guides/regions/${guide.slug}`, guide.title]),
        ...regionRoutes.filter(([path, title]) => title.includes(`（${prefecture.name}）`)).map(([path, title]) => [path, title.replace(/｜ことばの地図$/, "")]),
        ...[...legacyDialects, ...nationalDialects]
          .filter((item) => item.prefectureName === prefecture.name || item.prefectureCode === code)
          .map((item) => [`/dialects/${item.id}`, `${item.phrase}の意味・使い方`]),
      ];
    }
  } else if (route === "/search")
    children = [...legacyDialects, ...nationalDialects].map((item) => [`/dialects/${item.id}`, `${item.phrase}（${item.prefectureName}）`]);
  else if (route === "/meanings")
    children = meaningComparisons.map((item) => [`/meanings/${item.slug}`, item.title]);
  else if (route === "/conversations")
    children = [...contextGuides.map((item) => [`/stories/${item.slug}`, item.title]), ...legacyConversations.map(([id, title]) => [`/conversations/${id}`, title])];
  return `<nav class="static-navigation" aria-label="主要ページ">${linkList(core)}</nav>${children.length ? `<section class="static-children"><h2>関連ページ</h2>${linkList(children)}</section>` : ""}`;
};

const render = (route, title, description) => {
  const dialect = dialectByRoute.get(route);
  const meaning = meaningByRoute.get(route);
  const regionGuide = regionGuideByRoute.get(route);
  const cultureGuide = cultureGuideByRoute.get(route);
  const contextGuide = contextGuideByRoute.get(route);
  const indexable = dialect
    ? isIndexableDialect(dialect)
    : meaning
      ? meaning.indexStatus === "indexable" &&
        meaning.dialectIds.every((id) =>
          isIndexableDialect(dialectById.get(id) ?? {}),
        )
      : regionGuide
        ? regionGuide.indexStatus === "indexable" && dialectsForGuide(regionGuide).length >= 5
        : cultureGuide
          ? cultureGuide.indexStatus === "indexable" && cultureGuide.dialectIds.length >= 3 && cultureGuide.dialectIds.every((id) => isIndexableDialect(dialectById.get(id) ?? {}))
          : contextGuide
            ? contextGuide.indexStatus === "indexable" && contextGuide.dialectIds.length >= 3 && contextGuide.dialectIds.every((id) => isIndexableDialect(dialectById.get(id) ?? {}))
            : false;
  const canonical = siteOrigin
    ? `    <link rel="canonical" href="${escapeAttribute(`${siteOrigin}${route}`)}" />\n`
    : "";
  let html = template
    .replace(/\s*<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/g, "")
    .replace(/<title>.*?<\/title>/, `<title>${escapeAttribute(title)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/>/s,
      `<meta name="description" content="${escapeAttribute(description)}" />`,
    )
    .replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/s,
      `<meta property="og:title" content="${escapeAttribute(title)}" />`,
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/s,
      `<meta property="og:description" content="${escapeAttribute(description)}" />`,
    )
    .replace("    <title>", `${canonical}    <title>`)
    .replace(
      "    <title>",
      `    <meta name="robots" content="${indexable ? "index,follow" : "noindex,follow"}" />\n    <script type="application/ld+json">${breadcrumbJson(route, title)}</script>\n    <title>`,
    );
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${fallbackNavigation(route)}${dialect ? dialectFallback(dialect) : meaning ? meaningFallback(meaning) : regionGuide ? regionGuideFallback(regionGuide) : cultureGuide ? cultureGuideFallback(cultureGuide) : contextGuide ? contextGuideFallback(contextGuide) : ""}</div>`,
  );
  return html;
};

for (const [route, title, description] of routes) {
  const targetDir =
    route === "/" ? distDir : join(distDir, ...route.slice(1).split("/"));
  await mkdir(targetDir, { recursive: true });
  await writeFile(
    join(targetDir, "index.html"),
    render(route, title, description),
  );
}

if (siteOrigin) {
  const sitemapRoutes = routes.filter(([route]) => {
    const dialect = dialectByRoute.get(route);
    const meaning = meaningByRoute.get(route);
    const regionGuide = regionGuideByRoute.get(route);
    const cultureGuide = cultureGuideByRoute.get(route);
    const contextGuide = contextGuideByRoute.get(route);
    return dialect
      ? isIndexableDialect(dialect)
      : meaning
        ? meaning.indexStatus === "indexable" &&
          meaning.dialectIds.every((id) =>
            isIndexableDialect(dialectById.get(id) ?? {}),
          )
        : regionGuide
          ? regionGuide.indexStatus === "indexable" && dialectsForGuide(regionGuide).length >= 5
          : cultureGuide
            ? cultureGuide.indexStatus === "indexable" && cultureGuide.dialectIds.length >= 3 && cultureGuide.dialectIds.every((id) => isIndexableDialect(dialectById.get(id) ?? {}))
            : contextGuide
              ? contextGuide.indexStatus === "indexable" && contextGuide.dialectIds.length >= 3 && contextGuide.dialectIds.every((id) => isIndexableDialect(dialectById.get(id) ?? {}))
              : false;
  });
  const sitemapChunks = [];
  for (let index = 0; index < sitemapRoutes.length; index += 500)
    sitemapChunks.push(sitemapRoutes.slice(index, index + 500));
  if (!sitemapChunks.length) sitemapChunks.push([]);
  for (const [index, chunk] of sitemapChunks.entries()) {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${chunk
      .map(([route]) => `  <url><loc>${escapeAttribute(`${siteOrigin}${route}`)}</loc></url>`)
      .join("\n")}\n</urlset>\n`;
    await writeFile(join(distDir, `sitemap-${index + 1}.xml`), sitemap);
  }
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapChunks
    .map((_, index) => `  <sitemap><loc>${siteOrigin}/sitemap-${index + 1}.xml</loc></sitemap>`)
    .join("\n")}\n</sitemapindex>\n`;
  await writeFile(join(distDir, "sitemap.xml"), sitemapIndex);
  const robotsPath = join(distDir, "robots.txt");
  const robots = await readFile(robotsPath, "utf8");
  await writeFile(
    robotsPath,
    `${robots.trim()}\nSitemap: ${siteOrigin}/sitemap.xml\n`,
  );
} else {
  await rm(join(distDir, "sitemap.xml"), { force: true });
  await writeFile(
    join(distDir, "robots.txt"),
    await readFile(join(projectRoot, "public/robots.txt"), "utf8"),
  );
}

console.log(
  `generated ${routes.length} static route entries${siteOrigin ? " with canonical URLs and sitemap" : " without canonical URLs (SITE_URL is not set)"}`,
);
