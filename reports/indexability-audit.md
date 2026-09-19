# Indexability audit

Generated: 2026-09-19T07:53:00.772Z

## Summary

| Metric | Count |
| --- | ---: |
| Dialect records | 3003 |
| Record eligible | 2940 |
| Dialect routes indexable | 2938 |
| Dialect routes noindex | 86 |
| Static route decisions | 3694 |
| Static routes indexable | 3506 |
| Static routes noindex | 188 |
| Redirects | 2 |
| Sitemap URLs | 3506 |

## Historical policy-v2 baseline to current

The before values come from reports/indexability-before.json and are not the latest expansion baseline. See the expansion integration audit for that comparison.

- Indexable pages: 1049 -> 3506 (+2457)
- Indexable dialect routes: 630 -> 2938 (+2308)
- Indexable region routes: 0 -> 134 (+134)

## Remaining noindex routes

- culture_guide_policy: 1
- dialect_identity_collision: 14
- dialect_legacy_or_archived: 21
- dialect_missing_core_meaning: 26
- dialect_verification_status: 25
- meaning_policy: 15
- region_policy: 66
- utility_policy: 20

## Invariants

- Status: PASSED
- Noindex reason total: 188 / 188
- Redirect manifest/site pages: 2 / 2
- Sitemap/indexable route decisions: 3506 / 3506

## Prefecture gaps

- 秋田県: 17 records (to 30: 13, to 50: 33)
- 三重県: 17 records (to 30: 13, to 50: 33)

## Database readiness

The current 47-file JSON model remains workable at 3,000-5,000 records for static builds, but cross-record identity, claim-level evidence reuse, concurrent editing, and partial updates become increasingly costly. A future migration should separate `dialect_entries`, `dialect_forms`, `places`, `dialect_places`, `sources`, `evidence_claims`, `examples`, and `publication_state`. Indexability does not depend on that migration.
