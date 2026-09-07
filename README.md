# ことばの地図

日本各地のことばの表現・意味・記録地点・地域差・資料をたどる地域言語アーカイブです。都道府県・地域は閲覧の入口であり、言語学上の方言境界や県全域での使用を意味しません。

## 現在の実装

React 19 / TypeScript / Vite 8 / React Router / Zod / Vitest。Node.js 22.12以上（監査環境は24.18.1）を使用します。ビルド時にReact画面と共通のルート・metadataから全公開ページを静的生成し、ブラウザではcreateRootで操作を有効化します。hydrationは使用していません。LocalStorageはブラウザ外・破損・保存失敗時に安全な初期値へ戻ります。

2026-09-08の再集計：47都道府県、195閲覧地域、全国JSON 1,628記録、通常一覧1,643記録（デモ15件を含む）。公開URLは2,314ページと既存別名2件の308リダイレクト。index対象1,044件、noindex 1,270件です。実際の検索エンジン登録件数を表す数字ではありません。

最新の判断・検証・保留事項は [全体監査報告](docs/site-audit-2026-09.md)、SEO方針は [SEO_READINESS.md](SEO_READINESS.md) を参照してください。古い監査文書の件数は当時のスナップショットです。

## 起動と検証

```sh
npm ci
npm run dev
npm run lint
npm run typecheck
npm test
npm run validate:data
npm run build
npm run audit:site
npm run audit:sources
```

`SITE_URL=https://kotobanochizu.jp` をビルド環境に設定するとcanonical・sitemapに本番originを使用します。環境変数なしのローカルビルドは相対URLになります。`audit:site` は生成した全URLのmetadata・見出し・パンくず・リンク・index/sitemap整合を検査し、不整合時は失敗します。`AUDIT_ORIGIN` を指定すれば同じ全URLをHTTPで巡回します。`audit:sources` は外部資料の到達性を検査するもので、内容の真偽を自動認定しません。

`npm run release:preview` は未確認データを区別する既存公開プレビューの総合確認です。`release:check` はバックエンド・権利確認・人手監査等を含む将来の正式資料公開条件であり、現行の静的サイトを本番ドメインへ配置する判定とは異なります。

## 構成と編集

- `src/domain.ts` / `src/repository.ts`：ドメイン型とUIのデータ取得契約。
- `src/data/dialects/*.json` / `src/nationalData.ts`：県別に編集する資料記録とドメインへの変換。
- `src/data/regions.json`：閲覧用地域区分。
- `src/evidencePolicy.mjs`：出典範囲に基づく共通の根拠・公開判定。
- `src/seo.ts` / `src/PageHead.tsx` / `src/Breadcrumbs.tsx`：静的HTMLと画面遷移で共通のmetadataとパンくず。
- `src/prerender.tsx` / `scripts/static-pages.mjs`：画面の静的生成、404、sitemap、robots。
- `scripts/site-audit.mjs`：全URL監査。結果は`reports/site-audit/`。
- `src/storage.ts` / `src/submission.ts`：端末内のお気に入り・投稿デモ。
- `supabase/migrations` / `docs/BACKEND_DESIGN.md`：将来のDB/RLS設計。未適用。

語形・読み・意味・例文・使用範囲・分類を資料なしで補完しません。資料確認済み記録と未確認デモが混在します。出典メタデータの登録は研究機関による監修や全項目の再検証を意味しません。音声・投稿・訂正受付は未接続部分を明示しています。

## 本番反映

既存のVercelプロジェクト`kotobanochizu`を使用します。`.vercelignore`で端末情報・環境変数ファイル・監査資料・ローカル成果物を除外し、Vercel内の既存環境設定でビルドします。秘密情報をローカルへ取得する必要はありません。

```sh
vercel deploy --prod --skip-domain --yes
vercel inspect <deployment-url>
# ビルドと生成内容を確認した後
vercel promote <deployment-url> --yes
```

本番URLは https://kotobanochizu.jp 。公開後はrobots・sitemap・404・redirectを確認し、`AUDIT_ORIGIN`を設定して全URL監査と実ブラウザの主要導線確認を行います。
