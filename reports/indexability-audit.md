# Indexability audit

Generated: 2026-10-01T23:06:05.744Z

## Summary

| Metric | Count |
| --- | ---: |
| Dialect records | 3020 |
| Record eligible | 630 |
| Dialect routes indexable | 630 |
| Dialect routes noindex | 2411 |
| Static route decisions | 3718 |
| Static routes indexable | 1067 |
| Static routes noindex | 2651 |
| Redirects | 2 |
| Sitemap URLs | 1067 |

## Historical high-quality baseline to current

The before values in reports/indexability-before.json capture the searchable cohort before the policy-v2 expansion.

- Indexable pages: 1049 -> 1067 (+18)
- Indexable dialect routes: 630 -> 630 (+0)
- Indexable region routes: 0 -> 0 (+0)

## Remaining noindex routes

- culture_guide_policy: 2
- dialect_identity_collision: 14
- dialect_legacy_or_archived: 21
- dialect_missing_answer_evidence_example_usage: 2
- dialect_missing_answer_evidence_reading: 86
- dialect_missing_answer_evidence_reading_usage: 13
- dialect_missing_answer_evidence_usage: 36
- dialect_missing_core_meaning: 26
- dialect_missing_example_text: 681
- dialect_short_description: 1507
- dialect_verification_status: 25
- meaning_policy: 15
- region_guide_policy: 2
- region_policy: 200
- utility_policy: 21

## Invariants

- Status: PASSED
- Noindex reason total: 2651 / 2651
- Redirect manifest/site pages: 2 / 2
- Sitemap/indexable route decisions: 1067 / 1067

## Prefecture gaps

- 秋田県: 23 records (to 30: 7, to 50: 27)
- 三重県: 27 records (to 30: 3, to 50: 23)

## Database readiness

The current 47-file JSON model remains workable at 3,000-5,000 records for static builds, but cross-record identity, claim-level evidence reuse, concurrent editing, and partial updates become increasingly costly. A future migration should separate `dialect_entries`, `dialect_forms`, `places`, `dialect_places`, `sources`, `evidence_claims`, `examples`, and `publication_state`. Indexability does not depend on that migration.
