# Repository Agent Rules

このファイルは、このRepositoryを変更するすべてのGoalに適用する恒久的な安全ルールである。
Repositoryの現物と依頼されたGoalを優先し、件数、Phase、日付に依存する作業メモはここへ固定しない。
system、developer、userの明示instructionに従い、その範囲内でこの恒久安全ルールを適用する。
Goalの要求とこの恒久安全ルールが衝突する場合は、黙って一方をoverrideせず、作業を停止して衝突内容を報告する。
詳細な手順と現在のmachine固有pathは `docs/WORKTREE_OPERATING_MODEL.md` を参照する。
基準状態と未確認事項は `docs/WORKTREE_BASELINE_AUDIT_2026-09-10.md` を参照する。

## Git and Worktrees

- 原則を `1 Goal = 1 Codex chat = 1 branch = 1 worktree` とする。
- code、data、research、source、SEO、生成物、docsを含むRepository変更をmain上で行わない。
- 作業開始時に現在のpath、branch、HEAD、working tree、起点mainを確認する。
- mainがcleanでremoteと同期していることを確認してから、Goal専用branch/worktreeを作る。
- branchは原則 `codex/<goal-name>` とし、同じbranchを複数worktreeでcheckoutしない。
- 実装、生成、validation、commitはGoal専用worktree内だけで行う。
- unrelated taskや、別Goalで扱うべき修正を同じbranchへ混ぜない。
- userの既存変更をreset、stash、上書き、削除しない。
- history rewrite、force push、無断rebaseを行わない。
- merge前に最新mainとの差分、競合、validation結果を確認する。
- merge確認前にbranchまたはworktreeを削除しない。
- merge、remote同期、必要なProduction QAが完了するまでcleanupしない。

## Goal Scope

- 依頼されたGoalだけを実装する。
- previous chatのTODOを、現在のGoalへ自動的に持ち込まない。
- unrelatedなSEO、UI、refactor、prefecture、source cleanupへ範囲を広げない。
- Goal外の問題を見つけた場合は原則として変更せず、証拠と影響を報告する。
- dependency、lockfile、migration、deploymentはGoalが明示的に必要とする場合だけ変更する。

## Authoritative Data and Evidence

- 公開用の県別方言レコードの主入力は `src/data/dialects/{prefecture}.json` である。
- 閲覧用地域の共有catalogは `src/data/regions.json` である。
- `research/` は調査資料・候補・review記録であり、公開済み事実と同一視しない。
- `src/data/source-availability.json` や `reports/` の監査結果だけで、レコード本文を確定しない。
- source registryは独立した単一台帳ではなく、現在は各レコードの `source` / `additionalSources` にも分散する。
- 資料から確認できないreading、meaning、example、地域、語源、現用性、世代差を捏造・推測しない。
- language classification、citation、source URL、確認日も推測で補わない。
- sourceの説明や用例は必要な範囲で要約し、長い転載を避ける。
- source recoveryでは元sourceとのlineageを保持し、別資料を同一sourceとして置換しない。
- 代替sourceは、その資料が直接支えるclaimだけの根拠として追加する。

## Claim-Level Verification

- verificationはrecord-levelではなくclaim-levelで判断する。
- `evidenceScopes` の `phrase`、`reading`、`meaning`、`region`、`example`、`usage`、`history` を個別に確認する。
- sourceが存在しても、そのsourceが支えないfieldをverified扱いしない。
- primary sourceとadditional sourceの各metadata、URL、checkedAt、scopeを実際の根拠と照合する。
- 未確認fieldはRepository schemaと現行policyが許す正直な状態で表現し、埋め合わせない。

## Geography and Language Classification

- 資料が直接支える地点・市町村・地域以上へgeographic claimを拡張しない。
- 一地点の資料から市全域、地方全域、県全域での使用を一般化しない。
- `src/data/regions.json` の地域は閲覧・navigation区分であり、言語学的境界ではない。
- browsing regionをsource evidenceなしに方言境界、分布範囲、文化圏として扱わない。
- `languageVariety` は既存schemaとsource evidenceを優先する。
- 沖縄、奄美、琉球諸語等をAI判断だけで `japanese_dialect` 等へ確定しない。

## Duplicate and Identity Safety

- 表記一致だけでdialect recordを統合しない。
- duplicate候補はmeaning、region、municipality、reading、grammatical function、sourceを比較する。
- historical/current distinctionと、同形異義・地域差を確認してから判断する。
- 公開済みrecord ID、slug、region ID、source identity、canonical URLを整理目的だけで変更しない。
- 方言IDは現行の `jp-{都道府県番号2桁}-{英字県名}-{連番}` 形式と県別既存系列に従う。
- 連番を割り当てる前にRepository全体でIDとslugの重複を確認し、並行branch間でも予約を調整する。
- 新規IDはcommit直前にもRepository全体で重複確認し、並行Goalと競合する場合はcommitせずownershipを調整する。
- region IDは `src/nationalData.ts` の既存legacy mappingと生成規則を壊さない。
- 公開URL変更時はredirect、canonical、internal links、sitemapを一体で検証する。
- redirectは `src/seo.ts` と `vercel.json` の双方の責務を確認する。

## Publication and Indexability

- missing fieldをindexabilityのために捏造しない。
- 1 fieldが未確認という理由だけで、自動的にnoindexと決めない。
- recordは `src/evidencePolicy.mjs`、pageは `src/seo.ts` の現行gateに従う。
- 既存quality grade、verification state、publication stateを県別Goal内で再定義しない。
- これらの基準変更は県別データ追加から分離し、専用Goalとして扱う。
- guide類は各JSONの `indexStatus` と、参照recordのgateを合わせて確認する。
- indexability変更時はHTTP status、robots/meta robots、canonical、sitemap membership、internal linksを確認する。
- canonical、meta robots、sitemapは `npm run build` 内のstatic generationにも反映されることを確認する。
- `public/robots.txt` と生成後の `dist/robots.txt` の役割を混同しない。

## Generated Artifacts and Shared Writes

- generated outputをauthoritative sourceとして手編集しない。
- authoritative input、generator、tracked/untracked outputの関係を確認してから変更する。
- `dist/`、`tmp/`、`*.tsbuildinfo` はworktree固有のignored生成物として扱う。
- `package-lock.json`、`reports/`、`content/`、`artifacts/` にはtracked fileがあり得る。
- `audit:*`、`seo:plan` 等はtracked report/contentを上書きし得るため、実行前後にdiffを確認する。
- timestampや全体集計だけの無関係な変更をGoalのcommitへ混ぜない。
- 無関係なglobal artifactを「整合性のため」だけに再生成しない。
- generated fileをcommitする場合は、対応するauthoritative inputとgenerator実行結果を説明する。

## Parallel Prefecture Work

- 同一都道府県のauthoritative dialect dataへ新規recordを追加するGoalは、原則として並行実行しない。
- 同一県で作業が重なる場合は、一方を開始・継続する前にownershipと実行順を調整する。
- 県別Goalでは原則として、その県の `src/data/dialects/{prefecture}.json` と必要な調査入力だけを変更する。
- 愛知県Goalで理由なく岐阜県、三重県、長崎県その他の県別fileを変更しない。
- `src/data/regions.json` は全県共有、`src/data/meaning-comparisons.json`、各guide JSONも共有入力である。
- `src/data/source-availability.json`、`content/`、`reports/`、shared UI/SEO fileも競合しやすい。
- `src/nationalData.ts` は全県JSONを集約し、`src/repository.ts` はglobal検索indexをruntimeで構築する。
- `src/seo.ts` と `scripts/static-pages.mjs` は全recordからpage metadataとsitemapを生成する。
- 県別branchでglobal aggregateを更新する必要がある場合は、ownerとmerge順を先に決める。
- sequential ID、shared region、guideへの参照、source metadataの同時編集は意味上の競合も確認する。
- shared/global生成物の再生成はRepository構造とGoalの必要性を確認し、県別branchごとに一律実行しない。

## Environment, Database, and Production

- `.env.example` だけをtemplateとし、`.env` / `.env.*` のsecretを表示・commit・chatへ貼付しない。
- `.vercel/` はlocal-onlyでworktreeへ自動継承されない。link先を推測しない。
- `supabase/migrations/` は追記型の共有履歴として扱い、serial ownershipと明示承認なしに変更しない。
- 基本フローは worktree → validation → commit → push → Preview/PR → review → main → Production → QA とする。
- Vercel GitHub integration、main merge時の自動deploy、Preview条件を未確認のまま断定しない。
- 明示的なProduction Goalと承認なしにdeploy、promote、production migrationを行わない。

## Validation and Completion

- `package.json` の現行scriptを実物で確認し、存在しないcommandを要求しない。
- 基本validationは `npm run lint`、`npm run typecheck`、`npm run test`、`npm run build` とする。
- data変更時は `npm run validate:data` を追加し、必要に応じて `npm run data:stats` で確認する。
- SEO/guide変更時は対象の `seo:audit:*` と生成後のsite/build検証を追加する。
- `validate:system` は現在存在しないため、必須化しない。
- tracked outputを書き得るvalidation後は `git status` と `git diff` を再確認する。
- 完了時にGoal内の差分だけであること、application/data/Productionへの意図しない変更がないことを報告する。
- commit前にsecret、local cache、generated junk、別worktreeのartifactが含まれていないことを確認する。
