# WORKTREE BASELINE AUDIT — 2026-09-10

## Executive Summary

`C:\Projects\hougen` の `main` は、今後の worktree 運用の基準点として安全に使用できる。監査時点で `HEAD`、`main`、fetch 後の `origin/main` はすべて `098783d270935eb893fbe5e5ebfc7fc8b64c4bdb` で、ahead / behind は `0 / 0`、tracked file の staged・unstaged・untracked 変更はなかった。detached HEAD、追加 worktree、locked / prunable worktree、未統合 local branch はない。

既存の `npm run lint`、`npm run typecheck`、`npm test`、`npm run build` はすべて成功した。テストは 9 files / 55 tests、build は 2,314 complete pages、2 redirects、1,044 indexable pages を生成し、build verifier も PASSED だった。検証後も tracked diff はない。

Production は Vercel project `catholic-web/kotobanochizu` に接続され、`https://kotobanochizu.jp/` は READY の production deployment `dpl_7rxadz2kCvAnRYqFWWceW8yRFsMd` を指す。project は Vite、Node.js 24.x、root `.`、build command `npm run build` と認識されている。`kotobanochizu-git-main-catholic-web.vercel.app` alias が存在するため main 系統との接続は確認できるが、Vercel CLI の読み取り結果だけでは GitHub integration の自動 deploy policy、Preview 作成条件、deploy hook の有無までは確定できない。

この commit を **WORKTREE_BASELINE** と定義する。ここより後は `1 Goal = 1 branch = 1 worktree = 1 Codex chat` を適用する。

## Current Git Baseline

| Item | Observed value |
| --- | --- |
| Repository root | `C:\Projects\hougen` |
| Current branch | `main` |
| Current HEAD | `098783d270935eb893fbe5e5ebfc7fc8b64c4bdb` |
| main | `098783d270935eb893fbe5e5ebfc7fc8b64c4bdb` |
| origin/main after fetch | `098783d270935eb893fbe5e5ebfc7fc8b64c4bdb` |
| Ahead / behind | `0 / 0` |
| Upstream | `main -> origin/main` |
| Remote | `https://github.com/airo1007abc-cmd/kotobanochizu.git` |
| Detached HEAD | No |
| Tags | None |

`git fetch --prune` は成功し、その後も local main と origin/main は一致した。

## HEAD / main / origin-main

3つの参照は完全一致する。監査開始時と validation 終了後の双方で `main...origin/main` に差分はない。現在の main は remote に対する未送信 commit も、未取得 commit も持たない。

## Working Tree State

- staged files: なし
- unstaged tracked changes: なし
- untracked files: なし
- detached HEAD: なし
- validation 後の tracked diff: なし
- ignored files: `.chrome-audit/`、`dist/`、`node_modules/`、`tmp/`、`.vercel/`、`*.tsbuildinfo` などが存在する。これらは削除していない。

`reports/dialect-v2-content-audit.json` に LF/CRLF の warning が出るが、実 diff はない。生成 script や editor が同ファイルを書き直すと改行だけの差分を生む可能性がある。

## Branch Inventory

| Branch | HEAD | mainとの差 | Classification | Notes |
| --- | --- | --- | --- | --- |
| `main` | `098783d` | identical | active | `origin/main` を追跡 |
| `codex/editorial-readiness-phase2` | `098783d` | identical | merged | remote branchあり。履歴保存のため維持 |
| `codex/site-audit-2026-09` | `57f33f6` | fully contained in main | merged / probably stale | remote branchあり。削除判断はしていない |

未統合 local branch はない。remote には上記3 branch と `origin/HEAD -> origin/main` がある。既存 branch は一切削除していない。

## Worktree Inventory

監査開始時の `git worktree list --porcelain` は次の1件だけだった。

```text
worktree C:/Projects/hougen
HEAD 098783d270935eb893fbe5e5ebfc7fc8b64c4bdb
branch refs/heads/main
```

locked / prunable / detached worktree はなく、同じ branch を複数 worktree が参照する異常もなかった。監査確定後、文書専用の `C:\Projects\hougen-worktrees\worktree-baseline-audit` を `codex/worktree-baseline-audit` で追加した。

## Commit History Summary

現リポジトリの履歴は全17 commitsで、2026-09-05から2026-09-08にかけて1本の線形履歴として積み上がっている。merge commit はない。履歴の書き換えは行わない。

主な境界は次のとおり。

| Boundary | Commit | Category | Meaning |
| --- | --- | --- | --- |
| Production launch | `7376632` | infra / release | 初期production準備 |
| OG validation | `9f7e2a3` | SEO / validation | production URL検証 |
| Regional expansion | `a3641f7`〜`1704f87` | content / audit | 地域文化・方言・調査データの拡張 |
| Vercel hardening | `c8ddd7d` | infra | deployment input整理 |
| Editorial recovery | `57f33f6`〜`cf8710a` | editorial / SEO / UI | archive evidence、静的SEO、出典表示 |
| Contrast fix | `04979b7` | UI / accessibility | editorial control contrast改善 |
| Verification record | `098783d` | docs / reports | Production確認とsource recovery evidence記録 |

17 commitsという短い履歴に feature、content、SEO、infra、audit artifact が直接積み上がっている。`098783d` は remote と一致し、全検証を通過し、最後のcommitが報告・証跡中心なので、新運用への境界として適切である。

## Repository Structure

| Area | Findings | Worktree behavior |
| --- | --- | --- |
| Runtime | Vite 8.2.2 + React + TypeScript。Next.jsは不使用 | 各worktree独立 |
| Node | local `v24.18.1`; Vercel `24.x`; repo内に `.nvmrc` / `.node-version` / `engines` なし | version drift risk |
| Package manager | npm、tracked `package-lock.json` lockfile v3 | `node_modules` は各worktreeで `npm ci` |
| TypeScript | strict、`noEmit`、project build | `*.tsbuildinfo` はignored、各worktree生成 |
| Lint | ESLint scriptあり | 各worktreeで実行 |
| Tests | Vitest 4.1.11 | 各worktreeで実行 |
| Build | `tsc -b` + Vite + static page generation + build verification | `dist/` はignored、各worktree生成 |
| SEO output | static generatorが sitemap / robots / route HTML を `dist/` に生成 | 自動生成可能、commitしない |
| Source data | `src/`、`content/`、多数の `research/` raw data | tracked。編集担当を1 worktreeに限定 |
| Reports | `reports/` にJSON、Markdown、Lighthouse、screenshots多数 | tracked。audit scriptsが上書きし得る |
| DB | SQLiteなし。`supabase/migrations/` に2 SQL migration | migrationは直列運用が必要 |
| Environment | `.env.example`のみtracked。`.env` / `.env.*` はignored | secretをGit経由で共有しない。必要なworktreeごとに用意 |
| Vercel local link | ignored `.vercel/project.json` | 新worktreeへ自動継承されない。Previewが必要なworktreeで安全にlink |
| Vercel config | `vercel.json`: clean URLs、trailing slash off、redirect 2件 | tracked / repository共通 |
| Deploy exclusions | `.vercelignore` が docs、reports、research、artifacts等を除外 | deploy payloadに含まれない |
| CI | `.github/workflows` なし | GitHub側の必須checkはrepoから確認不能 |
| Local audit cache | `.chrome-audit/`、`tmp/`、browser profile、screenshots | ignoredだが容量・port衝突に注意 |

`package.json` に `validate:system` はないため追加も実行もしていない。`release:check` はSupabase系production environmentを要求するため、今回のbaseline minimum validationには含めていない。

## Validation Results

| Command | Result | Evidence / warning |
| --- | --- | --- |
| `npm run lint` | SUCCESS | errorなし |
| `npm run typecheck` | SUCCESS | TypeScript errorなし |
| `npm test` | SUCCESS | 9 files / 55 tests passed |
| `npm run build` | SUCCESS | 2,314 complete pages + 2 redirects = 2,316 routes; 1,044 indexable; verifier PASSED |
| `npm run validate:system` | NOT RUN | scriptが存在しない |

## Production Relationship

- Production domain: `https://kotobanochizu.jp/`
- Vercel project: `catholic-web/kotobanochizu`
- Project ID: `prj_Cn3VReZiBUlv9PsLGGqpNOLV7ap9`
- Current production deployment: `dpl_7rxadz2kCvAnRYqFWWceW8yRFsMd`
- State: `READY`
- Framework: Vite
- Node.js: 24.x
- Root directory: `.`
- Build command: `npm run build` または Vite default として認識
- Production aliases: `kotobanochizu.jp`、`www.kotobanochizu.jp`、`kotobanochizu.vercel.app`、`kotobanochizu-git-main-catholic-web.vercel.app` ほか

`git-main` alias は main 系統のproduction routeを示す。一方、読み取り専用CLI出力には source commit SHA、GitHub integration toggle、Preview policy、deploy hook一覧は含まれなかった。このため「現在のProductionがREADYでmain系統aliasを持つ」ことまでは確認済み、「main mergeだけで必ず自動deployされる」ことは要確認とする。手動deployやpromoteの履歴が存在し得るため、初回の新運用taskではVercel dashboardまたはGitHub deployment checksで方針を確定する。

目標の `feature worktree -> branch -> Preview -> PR -> main -> Production` は構成上実現可能。ただし最初のfeature branchでPreview自動生成を実測し、main統合後のproduction promotion方式を明文化してから恒常運用にする。

## Risks

1. **Production policyが完全にはrepo化されていない。** VercelのGit連携、自動deploy、Preview条件、deploy hookはdashboard側設定を追加確認する必要がある。
2. **Node versionがrepo内で固定されていない。** localとVercelは現在24系だが、新worktreeやCIで別versionになる余地がある。
3. **tracked generated reportsが多い。** `audit:*` scriptは `reports/` を更新し得るため、単なるvalidationでも実行前後のdiff確認が必要。
4. **research/dataの共有編集範囲が広い。** JSONやraw sourceを複数branchで同時編集すると意味上の競合やlost updateを起こしやすい。
5. **migration競合。** Supabase migration番号と適用順はbranch間で自然には調整されない。
6. **dependency競合。** 複数branchで `package-lock.json` を更新するとmerge conflictと解決ミスが起こりやすい。
7. **local-only設定。** `.env.*` と `.vercel/` は新worktreeへ自動で現れない。secretの安易なcopyやcommitを避ける必要がある。
8. **port / browser profile競合。** browser audit scriptsに固定port（例: 5181、CDP 9223）があり、並行実行時は衝突する。
9. **大きなignored cache。** `.chrome-audit/` 等はGit事故ではないが、storageと古い結果の取り違えに注意する。
10. **CI設定が見えない。** repository内にGitHub Actionsがなく、branch protectionやrequired checksはGitHub側で要確認。

## Recommended Operating Model

- `C:\Projects\hougen` は main管理専用とする。
- worktree root は `C:\Projects\hougen-worktrees\` とする。
- branch は `codex/<task-name>`、1 branch / worktreeにつき1目的とする。
- mainのclean・remote同期を確認してから、必ずmainを起点にworktreeを作る。
- 実装、生成、validation、commitはtask worktree内だけで行う。
- push後にPreviewとPRを確認し、mainへは原則PR経由で統合する。
- merge前に最新mainとの競合を確認し、merge後にmain / origin/main / Production QAを行う。
- worktreeとbranchの削除はmergeとProduction QAが完了し、所有者が確認した後だけ行う。
- detailed procedureは `docs/WORKTREE_OPERATING_MODEL.md` を正とする。

## Current Baseline Commit

```text
WORKTREE_BASELINE=098783d270935eb893fbe5e5ebfc7fc8b64c4bdb
```

Suitability: **SAFE**

## Open Questions

- Vercel GitHub integrationは有効か。main push時のproduction auto deployは必須か、承認promotionか。
- branch push時にPreview deploymentが常に作られるか。
- deploy hookが存在するか。手動 `vercel --prod` / promoteをどの場面で許可するか。
- GitHub branch protectionとrequired checksは設定されているか。
- Node 24.xを `.nvmrc`、`.node-version`、`engines` のどれで固定するか。
- tracked reportsのうち、長期保存する証跡と再生成物をどう分けるか。
- Supabase migrationの責任者とstaging適用手順をどう定義するか。

## Next Recommended Workstreams

候補のみ。今回の監査では作成・実装しない。

1. `codex/lcp-home` — 最大の既知UX課題であるhome LCPを測定条件固定のうえ改善する。
2. `codex/source-hold-recovery` — 高知・沖縄等のHOLDを出典単位で回復し、content ownershipを試行する。
3. `codex/noindex-quality-promotion` — noindex候補を品質基準で小分けに昇格し、SEOと編集判断を分離する。
4. `codex/editorial-research-pipeline` — raw research、review、published data、generated reportの境界とownershipを整備する。
