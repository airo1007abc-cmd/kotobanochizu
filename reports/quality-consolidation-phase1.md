# Quality Consolidation Phase 1

Generated from current repository data by `node scripts/quality-consolidation-phase1.mjs`. Base: `44edfba2ff95d0c59220e060bb1965bc7214bc93`.

## Population

- Canonical prefecture JSON records: **3003**.
- Content audit and priority audit records: **3017** = canonical 3003 + retained legacy 14.
- Retained legacy IDs: `d4`, `d5`, `d6`, `d7`, `d14`, `d15`, `d16`, `d17`, `d18`, `d19`, `d20`, `d21`, `d22`, `d23`. The 21 legacy/archived noindex routes are a route population, not 21 additional content records.

## Missing source: 26

Recovered: **0**; HOLD: **26**. A matching word in another record or a web search hit does not establish the exact meaning, region, reading, and example. No source has been attached to a record without direct claim-level verification. All 26 routes remain noindex. Each row below identifies the current claim, lineage, source metadata, related sourced records, and public route. "None" under source metadata means no recorded source. Reading and example claims also remain unverified even where legacy seed strings exist.

| ID / public route | Claim: word → meaning | Region | Population / lineage | Current state | Same-word sourced IDs | Decision |
| --- | --- | --- | --- | --- | --- | --- |
| [d4](https://kotobanochizu.jp/dialects/d4) | ほんま？ → 本当？ | 大阪府・河内 | retained_legacy; `src/data.ts or src/extendedData.ts (legacy seed)` | noindex; demo_candidate; source metadata: none; evidence scopes: none | none | HOLD |
| [d5](https://kotobanochizu.jp/dialects/d5) | めんこい → かわいい | 青森県・津軽 | retained_legacy; `src/data.ts or src/extendedData.ts (legacy seed)` | noindex; demo_candidate; source metadata: none; evidence scopes: none | jp-01-hokkaido-004 | HOLD |
| [d6](https://kotobanochizu.jp/dialects/d6) | けっぱる → がんばる | 青森県・津軽 | retained_legacy; `src/data.ts or src/extendedData.ts (legacy seed)` | noindex; demo_candidate; source metadata: none; evidence scopes: none | none | HOLD |
| [d7](https://kotobanochizu.jp/dialects/d7) | だべ → でしょう | 青森県・南部 | retained_legacy; `src/data.ts or src/extendedData.ts (legacy seed)` | noindex; demo_candidate; source metadata: none; evidence scopes: none | none | HOLD |
| [d14](https://kotobanochizu.jp/dialects/d14) | なんぼ？ → いくら？ | 大阪府・大阪市 | retained_legacy; `src/data.ts or src/extendedData.ts (legacy seed)` | noindex; demo_candidate; source metadata: none; evidence scopes: none | none | HOLD |
| [d15](https://kotobanochizu.jp/dialects/d15) | 知らんけど → 確かではないけれど | 大阪府・大阪市 | retained_legacy; `src/data.ts or src/extendedData.ts (legacy seed)` | noindex; demo_candidate; source metadata: none; evidence scopes: none | none | HOLD |
| [d16](https://kotobanochizu.jp/dialects/d16) | いけず → 意地悪 | 大阪府・河内 | retained_legacy; `src/data.ts or src/extendedData.ts (legacy seed)` | noindex; demo_candidate; source metadata: none; evidence scopes: none | none | HOLD |
| [d17](https://kotobanochizu.jp/dialects/d17) | ほかす → 捨てる | 大阪府・泉州 | retained_legacy; `src/data.ts or src/extendedData.ts (legacy seed)` | noindex; demo_candidate; source metadata: none; evidence scopes: none | jp-18-fukui-011, jp-26-kyoto-031 | HOLD |
| [d18](https://kotobanochizu.jp/dialects/d18) | あかん → だめ | 大阪府・大阪市 | retained_legacy; `src/data.ts or src/extendedData.ts (legacy seed)` | noindex; demo_candidate; source metadata: none; evidence scopes: none | jp-23-aichi-016, jp-21-gifu-003 | HOLD |
| [d19](https://kotobanochizu.jp/dialects/d19) | まいね → だめ・よくない | 青森県・津軽 | retained_legacy; `src/data.ts or src/extendedData.ts (legacy seed)` | noindex; demo_candidate; source metadata: none; evidence scopes: none | none | HOLD |
| [d20](https://kotobanochizu.jp/dialects/d20) | わいは → まあ・驚いた | 青森県・津軽 | retained_legacy; `src/data.ts or src/extendedData.ts (legacy seed)` | noindex; demo_candidate; source metadata: none; evidence scopes: none | none | HOLD |
| [d21](https://kotobanochizu.jp/dialects/d21) | なげる → 捨てる | 青森県・南部 | retained_legacy; `src/data.ts or src/extendedData.ts (legacy seed)` | noindex; demo_candidate; source metadata: none; evidence scopes: none | none | HOLD |
| [d22](https://kotobanochizu.jp/dialects/d22) | けやぐ → 友だち | 青森県・津軽 | retained_legacy; `src/data.ts or src/extendedData.ts (legacy seed)` | noindex; demo_candidate; source metadata: none; evidence scopes: none | none | HOLD |
| [d23](https://kotobanochizu.jp/dialects/d23) | めじゃ → おいしい | 青森県・下北 | retained_legacy; `src/data.ts or src/extendedData.ts (legacy seed)` | noindex; demo_candidate; source metadata: none; evidence scopes: none | none | HOLD |
| [jp-12-chiba-001](https://kotobanochizu.jp/dialects/jp-12-chiba-001) | あおなじみ → 青あざ | 千葉県・北西部 | canonical; `src/data/dialects/chiba.json` | noindex; needs_review; source metadata: none; evidence scopes: none | none | HOLD |
| [jp-38-ehime-001](https://kotobanochizu.jp/dialects/jp-38-ehime-001) | いってこうわい → 行って帰ってきます | 愛媛県・中予 | canonical; `src/data/dialects/ehime.json` | noindex; needs_review; source metadata: none; evidence scopes: none | none | HOLD |
| [jp-21-gifu-001](https://kotobanochizu.jp/dialects/jp-21-gifu-001) | えらい → 疲れた・つらい | 岐阜県・美濃 | canonical; `src/data/dialects/gifu.json` | noindex; needs_review; source metadata: none; evidence scopes: none | jp-37-kagawa-026 | HOLD |
| [jp-10-gunma-001](https://kotobanochizu.jp/dialects/jp-10-gunma-001) | なっから → かなり・ずいぶん | 群馬県・中毛 | canonical; `src/data/dialects/gunma.json` | noindex; needs_review; source metadata: none; evidence scopes: none | none | HOLD |
| [jp-17-ishikawa-001](https://kotobanochizu.jp/dialects/jp-17-ishikawa-001) | だら → ばか・愚か | 石川県・加賀 | canonical; `src/data/dialects/ishikawa.json` | noindex; needs_review; source metadata: none; evidence scopes: none | none | HOLD |
| [jp-14-kanagawa-001](https://kotobanochizu.jp/dialects/jp-14-kanagawa-001) | じゃん → ではないか・でしょう | 神奈川県・横浜・川崎 | canonical; `src/data/dialects/kanagawa.json` | noindex; needs_review; source metadata: none; evidence scopes: none | none | HOLD |
| [jp-15-niigata-001](https://kotobanochizu.jp/dialects/jp-15-niigata-001) | なじらね → いかがですか | 新潟県・中越 | canonical; `src/data/dialects/niigata.json` | noindex; needs_review; source metadata: none; evidence scopes: none | none | HOLD |
| [jp-11-saitama-001](https://kotobanochizu.jp/dialects/jp-11-saitama-001) | かたす → 片づける | 埼玉県・東部 | canonical; `src/data/dialects/saitama.json` | noindex; needs_review; source metadata: none; evidence scopes: none | none | HOLD |
| [jp-25-shiga-001](https://kotobanochizu.jp/dialects/jp-25-shiga-001) | ほっこりする → 疲れる・一息つく | 滋賀県・湖東 | canonical; `src/data/dialects/shiga.json` | noindex; needs_review; source metadata: none; evidence scopes: none | jp-26-kyoto-032 | HOLD |
| [jp-22-shizuoka-001](https://kotobanochizu.jp/dialects/jp-22-shizuoka-001) | だら → でしょう | 静岡県・中部 | canonical; `src/data/dialects/shizuoka.json` | noindex; needs_review; source metadata: none; evidence scopes: none | none | HOLD |
| [jp-13-tokyo-001](https://kotobanochizu.jp/dialects/jp-13-tokyo-001) | うざったい → わずらわしい | 東京都・多摩 | canonical; `src/data/dialects/tokyo.json` | noindex; needs_review; source metadata: none; evidence scopes: none | none | HOLD |
| [jp-19-yamanashi-001](https://kotobanochizu.jp/dialects/jp-19-yamanashi-001) | ほうけ → そうなのか | 山梨県・国中 | canonical; `src/data/dialects/yamanashi.json` | noindex; needs_review; source metadata: none; evidence scopes: none | none | HOLD |

## Reading and example debt

Content audit: reading **1886**, example **1897**, records with at least one content issue **2297**. These are content-audit decisions, not a count of empty JSON strings. Raw empty-string counts in the priority audit are reading 1850 / example 1852. Reading 19 and example 8 records have a corresponding evidence scope despite the audit issue; inspect these records and the actual source first for possible ingestion/mapping gaps. For the remaining 1867 reading and 1889 example cases, source metadata does not establish that the source contains the missing claim. Source documents still require human inspection; no claim is inferred from a title or URL.

| Prefecture | Reading | Example |
| --- | --- | --- |
| 和歌山県 | 94 | 95 |
| 高知県 | 67 | 61 |
| 大阪府 | 64 | 64 |
| 広島県 | 63 | 59 |
| 岡山県 | 70 | 51 |
| 宮崎県 | 60 | 60 |
| 鹿児島県 | 64 | 53 |
| 新潟県 | 57 | 57 |
| 埼玉県 | 56 | 56 |
| 群馬県 | 55 | 55 |
| 神奈川県 | 55 | 55 |
| 長野県 | 54 | 55 |
| 福井県 | 54 | 55 |
| 香川県 | 59 | 49 |
| 愛媛県 | 56 | 52 |
| 茨城県 | 54 | 54 |
| 富山県 | 54 | 54 |
| 奈良県 | 54 | 53 |
| 兵庫県 | 53 | 53 |
| 福島県 | 54 | 48 |
| 京都府 | 49 | 49 |
| 岐阜県 | 47 | 47 |
| 島根県 | 39 | 52 |
| 山梨県 | 45 | 45 |
| 佐賀県 | 54 | 35 |
| 沖縄県 | 10 | 75 |
| 鳥取県 | 43 | 39 |
| 滋賀県 | 61 | 16 |
| 青森県 | 63 | 8 |
| 山口県 | 40 | 30 |
| 長崎県 | 0 | 69 |
| 北海道 | 55 | 3 |
| 山形県 | 56 | 0 |
| 東京都 | 1 | 55 |
| 岩手県 | 54 | 1 |
| 徳島県 | 1 | 53 |
| 栃木県 | 24 | 24 |
| 大分県 | 16 | 30 |
| 千葉県 | 1 | 38 |
| 熊本県 | 3 | 32 |
| 三重県 | 16 | 16 |
| 福岡県 | 0 | 28 |
| 秋田県 | 8 | 8 |
| 静岡県 | 1 | 2 |
| 愛知県 | 1 | 1 |
| 石川県 | 1 | 1 |
| 宮城県 | 0 | 1 |

### Largest source batches

| Source batch | Reading | Example |
| --- | --- | --- |
| bunkyo.repo.nii.ac.jp \| 埼玉県東部地方の方言分布と世代差（1）―語彙の分布― | 55 | 55 |
| repository.ninjal.ac.jp \| 全国方言談話データベース 日本のふるさとことば集成 第10巻 富山・石川・福井 | 54 | 54 |
| www.pref.fukui.lg.jp \| 方言辞典『まんでもん～若者と方言のズシ～』 | 54 | 54 |
| www.pref.ibaraki.jp \| 茨城県産魚類の方言について（第1報） | 54 | 54 |
| www.city.hadano.kanagawa.jp \| 秦野の方言 | 50 | 50 |
| www.pref.fukushima.lg.jp \| 海産魚類 方言から標準和名（『福島の海産動物方言集』抜粋） | 44 | 44 |
| www.city.gifu.lg.jp \| 令和8年度版 岐阜市まちなか博士認定試験公式テキストブック 資料編 | 43 | 43 |
| www.city.maebashi.gunma.jp \| 城南地区の今昔調べ | 43 | 43 |
| www.town.hayakawa.yamanashi.jp \| 早川町の方言 | 43 | 43 |
| mmsrv.ninjal.ac.jp \| 国立国語研究所資料集10 方言談話資料（10） | 31 | 31 |
| www.town.koryo.nara.jp \| ふるさとの言葉 | 28 | 28 |
| kikigengo.ninjal.ac.jp \| 日本の危機言語：語彙詳細 | 0 | 56 |
| repository.ninjal.ac.jp \| 「日本の危機言語・方言の記録とドキュメンテーションの作成」青森県むつ方言調査報告書 | 55 | 0 |
| mmsrv.ninjal.ac.jp \| 国立国語研究所資料集10 方言談話資料（5）―岩手・宮城・千葉・静岡― | 54 | 0 |
| repository.ninjal.ac.jp \| 八丈方言調査データ―八丈方言基礎語彙データ（かな表記） | 0 | 54 |
| source_pending | 26 | 26 |
| www.vill.totsukawa.lg.jp \| 十津川郷民俗語彙「ツ」 | 25 | 25 |
| www.jstage.jst.go.jp \| 北海道語について（Ⅱ）―十勝の方言を中心にして― | 48 | 0 |
| www.city.kyoto.lg.jp \| 京ことば辞典 | 24 | 24 |
| www.city.nasukarasuyama.lg.jp \| なすから方言講座 | 24 | 24 |

## Indexability and identity

Canonical eligible records: **2940**; indexable dialect routes: **2938**; noindex dialect routes: **86**. These route reasons are mutually exclusive by the current route-policy precedence; missing-source is a content issue, not an additional route-reason bucket.

| Primary route reason | Count | IDs |
| --- | --- | --- |
| dialect_missing_core_meaning | 26 | jp-38-ehime-059, jp-38-ehime-060, jp-34-hiroshima-016, jp-34-hiroshima-017, jp-34-hiroshima-018, jp-34-hiroshima-064, jp-36-tokushima-050, jp-31-tottori-025, jp-31-tottori-026, jp-31-tottori-027, jp-31-tottori-028, jp-31-tottori-029, jp-31-tottori-030, jp-31-tottori-031, jp-31-tottori-032, jp-31-tottori-033, jp-35-yamaguchi-043, jp-35-yamaguchi-044, jp-35-yamaguchi-045, jp-35-yamaguchi-046, jp-35-yamaguchi-047, jp-35-yamaguchi-048, jp-35-yamaguchi-049, jp-35-yamaguchi-050, jp-35-yamaguchi-051, jp-35-yamaguchi-052 |
| dialect_verification_status | 25 | jp-23-aichi-001, jp-12-chiba-001, jp-38-ehime-001, jp-18-fukui-001, jp-21-gifu-001, jp-10-gunma-001, jp-01-hokkaido-001, jp-17-ishikawa-001, jp-03-iwate-001, jp-14-kanagawa-001, jp-43-kumamoto-001, jp-04-miyagi-001, jp-20-nagano-001, jp-42-nagasaki-089, jp-15-niigata-001, jp-41-saga-001, jp-11-saitama-001, jp-25-shiga-001, jp-22-shizuoka-001, jp-22-shizuoka-179, jp-36-tokushima-001, jp-13-tokyo-001, jp-30-wakayama-001, jp-35-yamaguchi-001, jp-19-yamanashi-001 |
| dialect_legacy_or_archived | 21 | d3, d8, d9, d10, d11, d12, d13, d4, d5, d6, d7, d14, d15, d16, d17, d18, d19, d20, d21, d22, d23 |
| dialect_identity_collision | 14 | jp-38-ehime-047, jp-38-ehime-048, jp-38-ehime-049, jp-38-ehime-050, jp-38-ehime-051, jp-38-ehime-052, jp-38-ehime-053, jp-38-ehime-054, jp-38-ehime-055, jp-38-ehime-056, jp-38-ehime-057, jp-38-ehime-058, jp-32-shimane-049, jp-32-shimane-050 |

The 14 identity-collision routes form seven pairs. Their current key includes spelling, meaning, place, source URL and page but not reading or grammatical function. Review source pages and those two fields before any merge or canonical change; all remain noindex.

| IDs | Shared spelling / meaning / region | Reading | Source distinction retained in notes |
| --- | --- | --- | --- |
| jp-38-ehime-047 / jp-38-ehime-048 | 誰 / 誰 / 今治・しまなみ海道周辺の島嶼部 | ﾀﾞﾚ / ﾀﾞﾚ | 資料分類: 芸予諸島方言アクセントデータベース。話者 U・M氏（2000f）。当該語の型は「1」。凡例では〈式〉を有しない場合、数字は〈下げ核〉の位置を示し、0は無核。凡例URL: https://nihong ⇔ 資料分類: 芸予諸島方言アクセントデータベース。話者 K・M氏（1991f）。当該語の型は「0」。凡例では〈式〉を有しない場合、数字は〈下げ核〉の位置を示し、0は無核。凡例URL: https://nihong |
| jp-38-ehime-049 / jp-38-ehime-050 | どこ / どこ / 今治・しまなみ海道周辺の島嶼部 | ﾄﾞｺ / ﾄﾞｺ | 資料分類: 芸予諸島方言アクセントデータベース。話者 U・M氏（2000f）。当該語の型は「1」。凡例では〈式〉を有しない場合、数字は〈下げ核〉の位置を示し、0は無核。凡例URL: https://nihong ⇔ 資料分類: 芸予諸島方言アクセントデータベース。話者 K・M氏（1991f）。当該語の型は「0」。凡例では〈式〉を有しない場合、数字は〈下げ核〉の位置を示し、0は無核。凡例URL: https://nihong |
| jp-38-ehime-051 / jp-38-ehime-052 | 朝が / 朝が / 宇和海側の島嶼部（九島） | unrecorded / unrecorded | 清水誠治(2006)が金田一春彦(1974)の代表例を再掲・比較。当該地点の原表記は「HHL」。同論文の記号定義では H=高、L=低、F=拍内下降（H→L）。金田一資料の話者生年は不明。  ⇔ 清水誠治(2006)が金田一春彦(1974)の代表例を再掲・比較。当該地点の原表記は「LHL」。同論文の記号定義では H=高、L=低、F=拍内下降（H→L）。金田一資料の話者生年は不明。  |
| jp-38-ehime-053 / jp-38-ehime-054 | 烏 / 烏 / 宇和海側の島嶼部（九島） | unrecorded / unrecorded | 清水誠治(2006)が金田一春彦(1974)の代表例を再掲・比較。当該地点の原表記は「HHL」。同論文の記号定義では H=高、L=低、F=拍内下降（H→L）。金田一資料の話者生年は不明。  ⇔ 清水誠治(2006)が金田一春彦(1974)の代表例を再掲・比較。当該地点の原表記は「LHL」。同論文の記号定義では H=高、L=低、F=拍内下降（H→L）。金田一資料の話者生年は不明。  |
| jp-38-ehime-055 / jp-38-ehime-056 | 牛が / 牛が / 宇和海側の島嶼部（九島） | unrecorded / unrecorded | 清水誠治(2006)が金田一春彦(1974)の代表例を再掲・比較。当該地点の原表記は「LHH」。同論文の記号定義では H=高、L=低、F=拍内下降（H→L）。金田一資料の話者生年は不明。  ⇔ 清水誠治(2006)が金田一春彦(1974)の代表例を再掲・比較。当該地点の原表記は「LLH」。同論文の記号定義では H=高、L=低、F=拍内下降（H→L）。金田一資料の話者生年は不明。  |
| jp-38-ehime-057 / jp-38-ehime-058 | 桜 / 桜 / 宇和海側の島嶼部（九島） | unrecorded / unrecorded | 清水誠治(2006)が金田一春彦(1974)の代表例を再掲・比較。当該地点の原表記は「LHH」。同論文の記号定義では H=高、L=低、F=拍内下降（H→L）。金田一資料の話者生年は不明。  ⇔ 清水誠治(2006)が金田一春彦(1974)の代表例を再掲・比較。当該地点の原表記は「LLH」。同論文の記号定義では H=高、L=低、F=拍内下降（H→L）。金田一資料の話者生年は不明。  |
| jp-32-shimane-049 / jp-32-shimane-050 | チンカモ / 友達 / 隠岐諸島 | unrecorded / unrecorded | 五箇回答に「『チンカモ』は『友達』の意」と注記。  ⇔ 都万回答に「※チンカモは大人のみ」と明記。  |

Source notes distinguish speaker, place, accent pattern or usage limitation. These distinctions require primary-document review; identical public titles alone do not justify merging records.

## SEO duplicates

Title groups: **8**; description groups: **9**; blocking groups: **0**. Every group has zero indexable paths, explaining the blocking=0 result. Two groups concern redirected/archived legacy pages; seven dialect pairs overlap the identity-collision review. The remaining description group is archived conversations. No title, slug, or canonical identity changes are justified by this audit alone.

## Next research batches

1. Resolve the 19 reading and 8 example scope/content mismatches by checking the exact record, cited document location, and ingestion mapping.
2. Inspect high-volume source batches in the table above, recording whether each source actually contains reading or example claims before targeted imports. Start with Wakayama (94 reading / 95 example), then the highest-volume source-specific groups.
3. Review the seven collision pairs against their primary documents for region, sense, reading, grammar and source-page distinctions. Keep noindex until identity is resolved.
4. Research the 26 source-pending records in region-specific batches. Existing same-word sources are leads only.
5. In a separate expansion Goal, consider Akita and Mie (currently 17 canonical records each) to at least 30 with direct sources.
