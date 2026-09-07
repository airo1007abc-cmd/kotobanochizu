# SEOコンテンツ公開判定

最終更新：2026-09-08。最新の全体評価は [監査報告](docs/site-audit-2026-09.md)。過去のページ数目標は現在の公開判定には使いません。

## 現在地

公開2,314ページ＋308リダイレクト2件。index対象1,044件（単語630、意味比較135、地域ガイド149、文化ガイド70、文脈資料30、トップ・編集方針・県一覧3、県別入口27）、noindex 1,270件。sitemapはindex対象だけを収録します。

地域ページ195件は、閲覧導線として残し、独自資料・説明の個別評価が済むまでnoindexを維持します。検索・条件URL・デモ・根拠不足ページもnoindexです。新しい読み・例文を作成して昇格させることはありません。

## 判定の実装

`src/evidencePolicy.mjs`が全国JSONとドメイン型で共通の根拠判定を行います。確認状態、語形・意味、資料名・HTTP(S) URL・参照日、および語形・意味・地域を裏付ける確認範囲を確認します。

既存単語630件の公開群は維持しています。既存判定にあった説明100文字以上・例文・読み等の確認範囲は、その公開群を再現する条件です。これらがないことだけで資料価値がないと結論しません。それ以外の記録の昇格には、固有情報・資料の裏付け・重複の個別編集審査が必要です。説明文の160文字上限は資料本文の価値判定に使いません。

県別入口27件は、複数記録を比較できる根拠付き記録5件以上に加え、地域別導線・資料記録・関連記事への到達性があるグループとして昇格しました。県を単一の方言区分とする説明は追加していません。閾値だけで新規単語や地域ページを昇格させません。

## metadataとクロール

- `src/seo.ts`のルート定義をHTML生成・SPA遷移・表示パンくず・JSON-LDで共有。
- 正規URLは本番HTTPS origin、パラメータなし、末尾スラッシュなし。
- 追跡パラメータはcanonicalで正規化し、既存index判定を変えない。検索の条件URLはnoindex。
- `robots.txt`で公開ページをブロックせず、noindexを取得可能にする。
- 旧`/dialects/d1`と`/dialects/d2`だけを既存の正規記録へ308。地域差のある同形語は統合しない。
- 存在しないURLは実HTTP 404とnoindex。全URLのH1は1個、構造化パンくずのリンク先は実在ルート。

```sh
npm run seo:audit
npm run seo:audit:meanings
npm run seo:audit:regions
npm run seo:audit:culture
npm run seo:audit:contexts
npm run build
npm run audit:site
```

`reports/site-audit/production-before.json`と`production-after.json`が本番比較の根拠です。`decisions.json`は公開URLごとのKEEP/PROMOTE/REDIRECT台帳です。Search Consoleの順位やインデックス実績は今回の評価に含めていません。既存GA4の設定を維持しています。
