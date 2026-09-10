# Worktree Operating Model

この文書は「ことばの地図」の恒久的な開発ルールである。新しいCodex taskを開始するときに参照する。

## Core Rule

```text
1 Goal = 1 branch = 1 worktree = 1 Codex chat
```

同じGoalの修正、QA、review対応は同じ組に留める。Goalが変わる場合は新branch、新worktree、新Codex chatへ分離する。

## Baseline

新運用の開始点は次のcommitである。

```text
WORKTREE_BASELINE=098783d270935eb893fbe5e5ebfc7fc8b64c4bdb
```

この境界より前の履歴は書き換えない。

## Main Repository

```text
C:\Projects\hougen
```

main管理専用とし、ここでは原則実装しない。許可するのはmain状態確認、fetch / fast-forward pull、統合後確認、worktree管理、repository全体管理である。変更が見つかった場合はreset、stash、削除、上書きをせず、所有者と目的を確認する。

## Worktree Root and Branch Names

```text
C:\Projects\hougen-worktrees\<task-name>
codex/<task-name>
```

worktreeをrepository内部や `.git` 配下へ作らない。巨大な万能branchを作らず、task名は目的が判別できる短いkebab-caseにする。同じbranchを複数worktreeでcheckoutしない。

## Standard Lifecycle

### 1. Confirm clean, current main

```powershell
Set-Location C:\Projects\hougen
git switch main
git status --short --branch
git fetch --prune
git pull --ff-only
git rev-list --left-right --count main...origin/main
```

statusがcleanでない、またはahead / behindが `0 0` でない場合は作業を止め、状態を記録する。reset、stash、rebase、force pushで整えない。

### 2. Create one task branch and worktree

```powershell
git worktree add C:\Projects\hougen-worktrees\lcp-home -b codex/lcp-home main
Set-Location C:\Projects\hougen-worktrees\lcp-home
git status --short --branch
```

作成前に同名branchと同名directoryが存在しないことを確認する。

### 3. Bootstrap the worktree

```powershell
npm ci
```

`node_modules/`、`dist/`、`tmp/`、`*.tsbuildinfo` はworktreeごとに生成する。NodeはVercelと合わせて24.xを使う。repoにversion pinが追加されるまでは、作業開始時に `node --version` と `npm --version` を記録する。

`.env.*` と `.vercel/` はGit管理外で自動継承されない。必要な値は承認されたsecret sourceからworktreeごとに用意し、表示・commit・chatへの貼付をしない。Previewが必要なworktreeだけを正しいVercel projectへlinkし、project IDを確認する。

### 4. Implement only the stated Goal

変更はtask worktree内だけで行う。開始時と終了時に `git status` と `git diff` を確認する。別目的の修正を見つけたら新Goal候補として記録し、現在branchへ混ぜない。

### 5. Validate

最低限を実行する。

```powershell
npm run lint
npm run typecheck
npm test
npm run build
git status --short
git diff --check
```

現在の `package.json` に `validate:system` はない。存在しないscriptは追加せず、実行もしない。変更内容に応じて browser QA、Lighthouse、sitemap / robots確認、production-like smoke testを追加する。

`audit:*` commandはtracked `reports/` を更新し得る。実行前後にdiffを確認し、意図したreportだけをcommitする。生成物のtimestamp更新だけを無関係なcommitへ混ぜない。

### 6. Commit and push

```powershell
git diff --stat
git diff --check
git add <goal-related-files>
git diff --cached
git commit -m "<goal-focused subject>"
git push -u origin codex/lcp-home
```

`git add .` を機械的に使わず、Goalに属するfileだけをstageする。secret、local cache、build outputを含めない。mainへ直接pushしない。

### 7. Preview and PR QA

branchのPreview URLをVercel / GitHub checksで取得し、対象画面、主要route、console error、SEO artifactを確認する。Previewが自動生成されない場合はVercel設定を確認し、production deployは行わない。PRには問題、変更後の挙動、validation、Preview QA、既知のriskを書く。

### 8. Integrate into main

原則PR経由とする。merge前にremoteをfetchし、最新mainとの差分・競合・validationを確認する。競合解決はtask worktree内で行い、履歴を書き換える必要がある操作は無断で行わない。

### 9. Confirm Production

merge後、main管理repositoryで次を確認する。

```powershell
Set-Location C:\Projects\hougen
git switch main
git pull --ff-only
git rev-list --left-right --count main...origin/main
```

Vercel production deploymentがREADYであること、custom domainが期待deploymentを指すこと、mainのsource commitとdeployment sourceが対応することを確認する。対象routeをsmoke testし、Production QA結果をPRまたはreportへ記録する。Vercelの自動deploy policyが確定するまでは、main mergeだけで反映済みと推定しない。

### 10. Cleanup only after completion

merge、remote同期、Production QA、必要な証跡保存がすべて完了してからworktree removalとbranch deletionを検討する。実行前に `git status`、merge containment、worktree pathを確認する。未commit変更、未統合commit、調査中artifactがある場合は削除しない。

## Concurrent Worktree Rules

1. 同じbranchを複数worktreeで使用しない。
2. main管理repositoryで実装しない。
3. 1 worktreeは1目的だけを持つ。
4. `.env.*` は各worktreeのlocal fileとして管理し、Gitで共有しない。
5. migration taskは同時並行を避け、番号・適用順・staging ownerを先に決める。
6. `package.json` / `package-lock.json` を変更するtaskは並行数を絞り、merge順を決める。
7. `src/data/`、`content/`、`research/`、`reports/` を書くtaskはdirectoryまたはdatasetごとにownerを決める。
8. 大型refactorと大量content更新を同時進行しない。
9. merge前に最新mainとの競合とvalidationを確認する。
10. merge後にmain、origin/main、Productionの対応をQAする。
11. Vite server port、audit server port、CDP port、browser profile directoryをworktreeごとに分ける。既存scriptの固定port 5181 / 9223を同時使用しない。
12. `dist/`、`tmp/`、`.chrome-audit/`、screenshotsの結果を別worktreeの証跡として再利用しない。

## Shared and Generated Assets

| Asset | Git | Rule |
| --- | --- | --- |
| `package-lock.json` | tracked | dependency taskだけが変更。並行変更時はmerge順を決める |
| `.env.*` | ignored | worktreeごと。secret sourceから用意しcommitしない |
| `.vercel/` | ignored | worktreeごと。link先projectを確認 |
| `node_modules/` | ignored | worktreeごとに `npm ci` |
| `dist/` / `tmp/` | ignored | 自動生成。検証後もcommitしない |
| `*.tsbuildinfo` | ignored | 自動生成 |
| `.chrome-audit/` | ignored | worktree固有cache / profile。並行共有しない |
| `reports/` | tracked | 生成commandのownerを決め、意図した差分だけcommit |
| `research/` / `content/` / `src/data/` | tracked | dataset ownerとmerge順を決める |
| `supabase/migrations/` | tracked | serial ownership、staging検証、Production承認が必要 |

## Task Start Checklist

- Goal、非対象範囲、完了条件を1文で定義した。
- main repositoryがcleanで、mainとorigin/mainが一致する。
- 新branch / worktree名が一意で、baselineが正しい。
- Node 24.xと `npm ci` を確認した。
- 必要なlocal env、Vercel link、portを安全に分離した。
- data、reports、migration、lockfileのowner競合がない。

## Merge Checklist

- Goal外のfileがdiffにない。
- lint、typecheck、tests、buildが成功した。
- 追加QAとPreview確認が完了した。
- secret、cache、generated junkがstageされていない。
- latest mainとの競合を確認した。
- PRのsource branchとtarget mainが正しい。

## Completion Checklist

- PRがmainへ統合された。
- local main、origin/main、期待commitが一致する。
- Production deploymentとcustom domainを確認した。
- Production smoke testを記録した。
- worktreeがcleanで、未統合commitがない。
- cleanupは上記確認後にだけ実施する。
