# Indexability audit

Generated: 2026-09-18T17:00:32.695Z

## Summary

| Metric | Count |
| --- | ---: |
| Dialect records | 1938 |
| Record eligible | 1875 |
| Dialect routes indexable | 1873 |
| Dialect routes noindex | 86 |
| Static route decisions | 2629 |
| Static routes indexable | 2390 |
| Static routes noindex | 239 |
| Redirects | 2 |
| Sitemap URLs | 2390 |

## Before to after

- Indexable pages: 1049 -> 2390 (+1341)
- Indexable dialect routes: 630 -> 1873 (+1243)
- Indexable region routes: 0 -> 98 (+98)

## Remaining noindex routes

- culture_guide_policy: 1
- dialect_identity_collision: 14
- dialect_legacy_or_archived: 21
- dialect_missing_core_meaning: 26
- dialect_verification_status: 25
- meaning_policy: 15
- prefecture_policy: 15
- region_policy: 102
- utility_policy: 20

## Invariants

- Status: PASSED
- Noindex reason total: 239 / 239
- Redirect manifest/site pages: 2 / 2
- Sitemap/indexable route decisions: 2390 / 2390

## Prefecture gaps

- 青森県: 0 records (to 30: 30, to 50: 50)
- 北海道: 1 records (to 30: 29, to 50: 49)
- 岩手県: 1 records (to 30: 29, to 50: 49)
- 宮城県: 1 records (to 30: 29, to 50: 49)
- 山形県: 1 records (to 30: 29, to 50: 49)
- 福島県: 1 records (to 30: 29, to 50: 49)
- 茨城県: 1 records (to 30: 29, to 50: 49)
- 群馬県: 1 records (to 30: 29, to 50: 49)
- 埼玉県: 1 records (to 30: 29, to 50: 49)
- 東京都: 1 records (to 30: 29, to 50: 49)
- 神奈川県: 1 records (to 30: 29, to 50: 49)
- 新潟県: 1 records (to 30: 29, to 50: 49)
- 富山県: 1 records (to 30: 29, to 50: 49)
- 福井県: 1 records (to 30: 29, to 50: 49)
- 長野県: 1 records (to 30: 29, to 50: 49)
- 秋田県: 9 records (to 30: 21, to 50: 41)
- 岐阜県: 9 records (to 30: 21, to 50: 41)
- 三重県: 10 records (to 30: 20, to 50: 40)
- 山梨県: 11 records (to 30: 19, to 50: 39)
- 千葉県: 18 records (to 30: 12, to 50: 32)
- 奈良県: 27 records (to 30: 3, to 50: 23)
- 栃木県: 31 records (to 30: 0, to 50: 19)
- 大阪府: 39 records (to 30: 0, to 50: 11)
- 兵庫県: 39 records (to 30: 0, to 50: 11)
- 鳥取県: 44 records (to 30: 0, to 50: 6)
- 佐賀県: 47 records (to 30: 0, to 50: 3)

## Database readiness

The current 47-file JSON model remains workable at 3,000-5,000 records for static builds, but cross-record identity, claim-level evidence reuse, concurrent editing, and partial updates become increasingly costly. A future migration should separate `dialect_entries`, `dialect_forms`, `places`, `dialect_places`, `sources`, `evidence_claims`, `examples`, and `publication_state`. Indexability does not depend on that migration.
