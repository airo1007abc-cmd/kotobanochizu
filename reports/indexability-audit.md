# Indexability audit

Generated: 2026-09-18T16:40:54.933Z

## Summary

| Metric | Count |
| --- | ---: |
| Dialect records | 1938 |
| Dialect indexable | 1875 |
| Dialect noindex | 63 |
| Core-evidence records | 1875 |
| Static route decisions | 2629 |
| Static routes indexable | 2390 |
| Static routes noindex | 239 |
| Region routes indexable | 98 |

## Before to after

- Indexable pages: 1049 -> 2390 (+1341)
- Indexable dialect routes: 630 -> 1873 (+1243)
- Indexable region routes: 0 -> 98 (+98)

## Remaining noindex routes

- dialectMissingCoreMeaning: 38
- dialectVerificationStatus: 25
- dialectIdentityCollision: 2
- dialectLegacyOrDemo: 21
- thinRegion: 102
- insufficientPrefectureCollection: 15
- meaningPolicy: 15
- cultureGuidePolicy: 1
- utilityOrArchived: 20

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

The current 47-file JSON model remains workable at 3,000-5,000 records for static builds, but cross-record identity, claim-level evidence reuse, concurrent editing, and partial updates become increasingly costly. A future migration should separate `dialect_entries`, `dialect_forms`, `places`, `dialect_places`, `sources`, `evidence_claims`, `examples`, and `publication_state`. Import JSON into staging tables, validate IDs and claim scopes, dual-read during parity checks, then export a deterministic static snapshot for Vercel. Postgres/Supabase improves constraints, review workflow, and querying, while adding migrations, credentials, availability, and build-time snapshot complexity; indexability does not depend on that migration.
