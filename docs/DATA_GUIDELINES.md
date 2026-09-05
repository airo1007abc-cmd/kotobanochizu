# 方言データ整備ガイド

## 追加方法

`src/data/dialects/{prefecture}.json` に1レコードずつ追加し、`npm run validate:data` と `npm run data:stats` を実行します。IDは `jp-{都道府県番号}-{英字県名}-{連番}` とし、一度公開したIDは表現を直しても変更しません。slugは人が読める値にします。

## 断定と出典

県全域の「正しい方言」と断定せず、確認できる地域・市町村・世代を記録します。出典が未確認なら `verificationStatus: needs_review`、`sourceType: source_pending`、`confidence: low` とします。資料名・組織・URL・確認日は実際に確認した場合だけ書き、外部資料の説明や例文を転載せず要約します。

状態は `verified`（複数の十分な確認）、`reference_confirmed`（参照資料で確認）、`community_confirmed`（複数地域話者で確認）、`needs_review`（候補・要確認）、`demo_candidate`（UI専用候補）です。未確認状態を確認済みの外観にしません。

年代が不明なら `unknown`。頻度は `common / occasional / rare / historical / unknown` を使い、根拠なく若者・高齢者・commonを付けません。市町村不明は `null`。沖縄・奄美・アイヌ語由来は `languageVariety` と説明で区別します。

同じ表記、かな正規化後の一致、同一県・地域・読み・標準語訳の一致は重複候補として確認します。表記ゆれや語尾だけで水増ししません。架空URL、監修の捏造、資料例文の大量転載、ステレオタイプな会話は禁止です。
