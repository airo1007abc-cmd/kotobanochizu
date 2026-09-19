# 福島県 方言拡張調査サマリー

調査基準日: 2026-09-19

## 調査source一覧

| Source | Organization | 対象地域 | 採用 |
| --- | --- | --- | ---: |
| [只見町 定住ガイドブック2021 方言編](https://www.town.tadami.lg.jp/2021/05/07/c88428e52a0fc753bacde3762b450807.pdf) | 只見町 | 只見町（navigation: 会津） | 10 |
| [海産魚類 方言から標準和名](https://www.pref.fukushima.lg.jp/uploaded/attachment/36930.pdf) | 福島県水産試験場（編）・福島県水産海洋研究センター（公開） | 福島県沿岸全域、いわき、相馬、双葉・相馬（navigation: 浜通り） | 44 |
| [福島県立図書館「福島の方言」資料案内](https://www.library.fcs.ed.jp/assets/pdf/guidepost-fukushima-dialect-rev.pdf) | 福島県立図書館 | 県内資料の所在案内 | 0（所在確認のみ） |
| [福島県福島市方言 活用体系記述](https://hougen.sakura.ne.jp/shuppan/2018/4-05.pdf) | 全国方言文法辞典資料集・半沢康 | 福島市（navigation: 中通り） | 0（活用体系資料で、今回の語彙recordとして安全に切り出さず） |

## Candidate decisions

- accepted: 54
- rejected: 0
- HOLD: 0
- canonical total: 1 → 55

全候補の個別判断、source、evidence geography、canonical ID は `candidate-decisions.json` に記録した。

## Target地域別件数

| 閲覧地域 | 既存 | 追加 | 合計 |
| --- | ---: | ---: | ---: |
| 会津 | 1 | 10 | 11 |
| 中通り | 0 | 0 | 0 |
| 浜通り | 0 | 44 | 44 |

地域バランスよりclaim-level evidenceを優先した。沿岸資料の「全域」は資料の文脈上の福島県沿岸全域として保持し、福島県全域や浜通りの内陸部へ拡張していない。

## Claim-level evidence監査

- 全追加recordで `phrase`、`meaning`、`region` を同一source上で確認。
- verificationStatus は全追加recordで `reference_confirmed`。
- 読みは資料が独立して示さないため追加していない。
- 例文は只見町資料に実例がある6 recordだけに付与し、それ以外は空欄のまま。
- usage、世代、頻度、語源、現在性は資料が直接支えないため追加していない。
- 海産魚類の「小型魚」は標準和名欄と備考欄を区別できるよう意味表示に残したが、usage evidenceにはしていない。

## Duplicate / identity監査

- 対象県の既存最大IDは `jp-07-fukushima-001`。新規IDは002–055を連続採番。
- repository全体、`src/data.ts`、`src/extendedData.ts`、県別canonical JSON群でID・slug・route identityを確認。
- 同じ標準和名に複数の地方名称があるものは、資料上の別語形として別recordにした。
- 同一語形が複数魚種を指す曖昧な行は今回の採用集合から除外した。

## Language classification上の注意

只見町資料は方言編、福島県水産試験場資料は「方言」欄として日本語の地域語形を提示しているため、追加recordは `japanese_dialect` とした。魚種の学名・分類群や語源はlanguage classificationの根拠にしていない。

## Source access上の注意

- 只見町・福島県のPDFは公開URLで本文表を確認できた。
- 福島市の活用体系PDFは抽出テキストの文字化けがあり、表の視覚確認を伴わず語彙recordへ転記するのは不適切と判断し、今回のcanonical inputには使用していない。
- 福島県立図書館資料は所在案内であり、個々の語形・意味の根拠としては使用していない。
