# Wave B integration review

Baseline: 82a1e392c35b03f031b32ab2a62a19d4036f60aa (fetched origin/main, clean main verified). Dedicated worktree: codex/wave-b-dialect-integration. Source PRs #22–#32 were rechecked for head SHA, draft status, mergeability and exactly three prefecture paths. Only those paths were restored; no source branch merge/cherry-pick. Full inventory: source-inventory.json. Gifu was recreated after unsuccessful recovery; see gifu/research-summary.md.

## Data reconciliation

Canonical 2709 → 3003 (+294); 3,000 exceeded by 3. Accepted = added = core eligible = route indexable = 294. HOLD 24, rejected 3. All prior canonical records unchanged.

| Prefecture | Before | After | Added |
|---|---:|---:|---:|
| 秋田県 | 9 | 17 | 8 |
| 千葉県 | 18 | 55 | 37 |
| 岐阜県 | 9 | 55 | 46 |
| 群馬県 | 10 | 55 | 45 |
| 兵庫県 | 39 | 59 | 20 |
| 三重県 | 10 | 17 | 7 |
| 奈良県 | 27 | 55 | 28 |
| 大阪府 | 39 | 58 | 19 |
| 佐賀県 | 47 | 55 | 8 |
| 栃木県 | 31 | 55 | 24 |
| 鳥取県 | 44 | 52 | 8 |
| 山梨県 | 11 | 55 | 44 |

| Metric | Before | After |
|---|---:|---:|
| Dialect routes (excluding redirects) | 2730 | 3024 |
| Indexable dialect routes | 2644 | 2938 |
| Static pages (including redirects) | 3402 | 3696 |
| Indexable pages / sitemap URLs | 3204 | 3506 |
| Noindex pages (including redirects) | 198 | 190 |
| Indexable region pages | 126 | 134 |

Dialect routes exceed canonical records by 21 legacy/archived routes. The two redirect stubs are counted separately. Eight region collections now meet the existing core-record threshold. No publication policy changes. The historical reports/indexability-before.json is deliberately preserved and explicitly labelled in the generator.

## Claim and source review

All new records were checked for unique ID/slug, nonempty phrase/meaning, publishable status, source metadata/date/URL, core scopes, known browsing region, route indexability and decision correspondence. reports/wave-b-integration-audit.json lists all 294 records with source and geography side by side; source-batch-review.json records 29 source batches and downloaded content hashes. Research geography and canonical source notes/evidenceRegion were compared in context; different wording does not broaden evidence. New languageVariety follows the Japanese dialect contexts of these sources, not browsing-region boundaries.

Corrections: Nara's 28 PDF references were all one page early and were corrected after whole-batch image review. Gunma's 43 Maebashi and two Kuni references/locations were made explicit; Kuni's actual PDF page is 3. Chiba's Kamogawa printed pages are 5–7. Hyogo's 20 library-dictionary entries retain only the directly listed phrase/meaning/Tajima context; every sourceNote discloses the library's lack of linguistic-accuracy guarantee. Mie's two illustrative window sentences were returned to HOLD rather than treated as lexical entries.

Reading exists only on the 37 Chiba entries, matching explicit kana forms; no inferred pronunciation/accent. Other new readings and all new examples are absent. Stored usageContexts are category placeholders and are not usage evidence: no new usage/history scope, frequency or age assertion is published. Existing UI scope gates remain unchanged.

Cross-record review: all seven existing identity collisions remain noindex. No new same-prefecture normalized-phrase match was found. The 23 cross-prefecture normalized-phrase pairs were reviewed with meanings, geography and source: distinct regional attestations or senses are retained; none is an identical source/place claim. NFKC/kana normalization is a candidate detector, not a deletion rule. IDs and URLs are preserved.

## Validation

Independent npm ci --ignore-scripts environment, no dependency/lockfile changes. SITE_URL=https://kotobanochizu.jp.

- npm run lint: PASS
- npm run typecheck: PASS
- npm run test: PASS
- npm run validate:data: PASS
- npm run data:stats: PASS
- npm run seo:audit: PASS
- npm run seo:audit:meanings: PASS
- npm run seo:audit:regions: PASS
- npm run seo:audit:culture: PASS
- npm run seo:audit:contexts: PASS
- npm run build: PASS
- npm run seo:site-audit: PASS
- npm run audit:site: PASS
- npm run audit:indexability: PASS
- npm run audit:content-priority: PASS
- node scripts/wave-b-integration-audit.mjs 82a1e392c35b03f031b32ab2a62a19d4036f60aa: PASS
- node scripts/preview-release-check.mjs: EDITORIAL_READY, no failures
- Tests: 63/63 across 10 files. One pre-existing Saga test fixed catalogue counts at 47/46; changed to input-derived totals and regional membership checks instead of new fixed counts.
- After the final Gunma geography metadata refinement: validate:data, production-like build, site/indexability/content audits rerun successfully.
- Duplicate IDs/slugs, new identity collisions, core-less indexable routes, unexpected new noindex, missing accepted mappings, HOLD IDs in canonical, broken internal links, blocking duplicate metadata, sitemap mismatch, noindex in sitemap, missing robots and invalid canonical: zero.

Reports were regenerated by the existing npm scripts; integration audit is generated by scripts/wave-b-integration-audit.mjs. No secrets, local cache, source PDFs or build junk are included. No application UI, schema, policy, source-availability registry, migration or deployment configuration changes.

## Remaining limitations

Uneven coverage remains: Osaka Hokusettsu 0 and one Osaka-city study; Hyogo Tajima; Gunma Imai; Saga Genkai; Nara Koryo; Chiba Ichihara/Kamogawa; Tochigi Nasukarasuyama. Yamanashi Konchu 54/Gunnai 1. Gifu Mino 52/Hida 3 despite investigating Hida first. Akita/Mie 17 and Tottori 52 are not padded to 55. Missing optional evidence remains transparent. Legacy duplicate/noindex and validation warnings predate or reflect intentionally absent optional fields; no new duplicate identity is promoted. Production/PR outcome is recorded in the integration PR after deployment, rather than predicted here.
