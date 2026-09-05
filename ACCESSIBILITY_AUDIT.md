# アクセシビリティ監査記録

最終更新: 2026-08-31

## 対象

実ブラウザで以下の代表ルートを監査した。

- `/`
- `/search`
- `/meanings`
- `/dialects/d1`
- `/submit`
- `/editorial-policy`
- `/sustainability`

## 自動確認結果

全対象ルートで以下を確認した。

- HTML言語は `ja`
- 表示完了後の `h1` は各ページ1件
- accessible nameのないbutton/input/select/textareaは0件
- accessible nameのないlinkは0件
- alt属性のない画像は0件
- 重複IDは0件
- フッター、パンくず、buttonの単独操作領域は24px以上
- 本文スキップリンクと明示的なfocus outlineあり
- `prefers-reduced-motion` 対応あり

小さな文字にも使うアクセント色を `#e66f45` から `#b94e2d` へ変更した。背景 `#fcfaf5` との計算上のコントラスト比は約4.80:1で、WCAG AAの通常文字4.5:1を上回る。緑 `#315c49` と白の比は約7.62:1。

## 操作フロー確認

キーボードで到達できるsemantic controlとして、検索、複合filter、投稿フォーム、3種類の同意checkbox、送信前確認、管理画面の5項目チェック、確認根拠、審査メモ、承認disabled状態をDOM上で確認した。

## 正式公開前に必要な人手監査

この記録はWCAG 2.2 AAへの完全準拠を証明しない。以下は外部環境・当事者評価が必要な公開ブロッカーとして残す。

- NVDA + Firefox、JAWS + Chrome、VoiceOver + Safariの読み上げ順と操作
- iOS/Android実機での拡大、横向き、スイッチ操作
- 200%/400% zoomとreflow
- 日本語の読み上げ、方言表記、ルビ、音声transcriptの理解しやすさ
- axe-core等による全ルート監査（現在の依存には未導入）
- 色覚多様性、高コントラストモード、Windows forced-colors
- 地域話者、高齢者、日本語学習者を含むユーザビリティ評価

問題を発見した場合は、重大度、対象ルート、再現手順、支援技術、修正、再確認日をこの文書へ追記する。
