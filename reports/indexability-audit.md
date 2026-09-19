# Indexability audit

Generated: 2026-09-19T01:06:45.636Z

## Summary

| Metric | Count |
| --- | ---: |
| Dialect records | 2709 |
| Record eligible | 2646 |
| Dialect routes indexable | 2644 |
| Dialect routes noindex | 86 |
| Static route decisions | 3400 |
| Static routes indexable | 3204 |
| Static routes noindex | 196 |
| Redirects | 2 |
| Sitemap URLs | 3204 |

## Before to after

- Indexable pages: 1049 -> 3204 (+2155)
- Indexable dialect routes: 630 -> 2644 (+2014)
- Indexable region routes: 0 -> 126 (+126)

## Remaining noindex routes

- culture_guide_policy: 1
- dialect_identity_collision: 14
- dialect_legacy_or_archived: 21
- dialect_missing_core_meaning: 26
- dialect_verification_status: 25
- meaning_policy: 15
- region_policy: 74
- utility_policy: 20

## Invariants

- Status: PASSED
- Noindex reason total: 196 / 196
- Redirect manifest/site pages: 2 / 2
- Sitemap/indexable route decisions: 3204 / 3204

## Prefecture gaps

- 秋田県: 9 records (to 30: 21, to 50: 41)
- 岐阜県: 9 records (to 30: 21, to 50: 41)
- 群馬県: 10 records (to 30: 20, to 50: 40)
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
