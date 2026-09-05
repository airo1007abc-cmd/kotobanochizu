# DEVELOPMENT STATUS

## 完了したこと

React/TypeScript基盤、47都道府県・171地域・67表現・8会話、県・地域・方言詳細、会話、47県対応の複合検索、「一つの意味、全国のことば」、全国比較、クイズ、お気に入り、投稿、構造化審査、訂正・権利申請、編集方針、団体向け、持続可能性、法務方針ページを実装。Supabaseの初期schemaに加え、staff role、同意証跡、非公開原本、撤回、訂正、監査ログの追補migrationを用意しました。

## 主な設計判断

空のリポジトリだったため、依存と運用負担が小さいVite SPAを採用。コンテンツをUIから分離し、`ContentRepository` 契約とページング結果型を追加しました。LocalStorageはバージョン付きキーとruntime validationを使います。文化的断定を避け、全件をデモ使用例と明示しています。

## 仮定したこと

初期MVPは認証・公開バックエンドなし。お気に入りと反応、投稿下書きは端末内保存。実在人物の音声・画像は使わず、音声領域は権利確認後の接続を前提とします。

## 未完了・次にやるべきこと

1. 青森・大阪・福岡で各20件以上の文献または複数話者確認済みデータ
2. 許諾済み音声・映像、正式な撤回窓口、話者への謝礼・還元条件
3. Supabase本番環境へのmigration適用、認証、Storage、バックアップ、監視
4. 本番URL・運営者・問い合わせ先・OG画像・法務確認済み規約
5. axe、実機、NVDA/JAWS/VoiceOverによる人手アクセシビリティ監査

## 技術的負債・外部接続

CSRを維持しつつ、全308ルートに固有title/descriptionを持つ静的HTML入口を生成します。主要な補助ページはroute chunkへ分割済みですが、`App.tsx` の主要画面は引き続き分割余地があります。Supabase URL/Anon Key、Storage、メール認証は未接続です。`npm run release:check` が正式公開条件を満たさないdeployを停止します。

## 品質確認

lint、strict typecheck、18 unit tests、data validation、production build、308 static route artifact validationが成功。実ブラウザでトップ、検索、意味地図、方言詳細、投稿、審査、訂正、事業ページを検証しconsole errorは0件。主要7ルートのDOMアクセシビリティ監査では、無名control/link、alt欠落、重複IDはいずれも0件でした。実機・スクリーンリーダー・axe・視覚回帰は未実施です。

## 全国データ整備フェーズ

47県別JSON、全国171地域区分、安定ID/slug、拡張verification/source/confidence/language variety/audio priority、NFKC・かな正規化検索index、data validator・統計コマンドを追加しました。総数67件で全県最低1件を達成しましたが、全国候補44件はすべて要確認です。100件以上の県はまだ0県であり、正確性を優先して推測による4,700件生成は行っていません。県別進捗は `DATA_STATUS.md` を参照してください。

現在の初期JSはmain gzip 99.36KBと共有JSX runtime gzip 16.80KBです。補助ルートは0.37〜6.42KBの遅延chunkです。数千件投入前に県単位dynamic importまたはAPI paginationへ切り替えます。過去のnpm audit結果は現在性を保証しないため、deploy CIで毎回再検査してください。
