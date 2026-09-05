# 正式公開監査

監査日: 2026-08-31

## 判定

**プレビュー公開: 合格**  
**正式な文化アーカイブ公開: BLOCKED**

通常buildは、未確認・デモであることを明示したプレビューとして公開可能。正式公開は `npm run release:check` が終了code 1で停止する。

## 要件別証拠

| 要件             | 判定               | 証拠                                                                        |
| ---------------- | ------------------ | --------------------------------------------------------------------------- |
| 競合との差別化   | 実装済み           | 地域・世代・場面・確認状態の複合検索、意味地図、会話、透明な記録台帳        |
| UI・ブランド品質 | 実装済み           | 文化アーカイブ向けトップ、responsive UI、実ブラウザ視覚確認                 |
| データ透明性     | 実装済み           | `verificationStatus`、source、confidence、記録年、編集方針、確認済み0件表示 |
| 実データの信頼性 | 未達               | 67件中、文献または地域話者による確認済み0件                                 |
| 音声権利基盤     | 実装済み           | 同意日時・版・範囲・撤回窓口が揃わない音声を公開しないgateとDB追補          |
| 許諾済み音声体験 | 未達               | 実在話者の許諾済み音源0件                                                   |
| 投稿・審査       | プレビュー実装済み | 3同意、5審査項目、根拠、審査記録、承認gate。現在はLocalStorage              |
| 訂正・削除・撤回 | プレビュー実装済み | 各記録から申請、管理queue、DB/RLS設計。正式窓口は未接続                     |
| SEO              | 基盤実装済み       | metadata、OG、構造化data、robots、条件付きcanonical/sitemap、静的入口308件  |
| アクセシビリティ | 一部合格           | DOM監査とcontrast修正済み。実機・screen reader・axeは未実施                 |
| 性能             | 合格（現規模）     | initial main gzip 99.36KB + shared runtime 16.80KB、補助route遅延読込み     |
| マネタイズ基盤   | 実装済み           | 自治体・教育・個人支援・licenseモデルと倫理gate                             |
| 運営・法務       | 未達               | 運営主体、連絡先、正式規約、法務確認が未確定                                |
| 本番infra        | 未達               | Supabase、認証、Storage、backup、monitoring未接続                           |

## 検証コマンド

- `npm run lint`: 成功
- `npm run typecheck`: 成功
- `npm test`: 18/18成功
- `npm run validate:data`: errors 0 / warnings 0
- `npm run build`: 成功
- build artifact verifier: 308 static entries / required artifacts 13 / failures 0
- `npm run release:check`: BLOCKED / failures 12

## 外部入力が必要な12項目

1. 本番HTTPS URL
2. 運営主体
3. 問い合わせ・訂正・同意撤回窓口
4. Supabase本番URL
5. Supabase anon key
6. data sourceのSupabase切替
7. 正式規約・privacyの法務確認
8. 支援技術・実機アクセシビリティ監査
9. 障害・権利侵害の緊急連絡経路
10. 青森県の確認済みJSON記録20件
11. 大阪府の確認済みJSON記録20件
12. 福岡県の確認済みJSON記録20件

これらは運営判断、契約、本人同意、地域話者または資料による確認が必要であり、コードや生成データで代替しない。
