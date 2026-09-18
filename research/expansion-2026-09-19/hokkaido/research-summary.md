# 北海道 方言データ拡充調査

調査日: 2026-09-19

## 調査資料

1. 池添博彦「北海道語について（Ⅱ）―十勝の方言を中心にして―」『帯広大谷短期大学紀要』第48号、2011年、pp.121-134、帯広大谷短期大学。
   - URL: https://www.jstage.jst.go.jp/article/oojc/48/0/48_KJ00007409499/_pdf/-char/ja
   - 対象地域: 十勝地方。論文は十勝出身作家の作品から語彙を抽出し、十勝で用いられる北海道方言として分析している。
   - 採用: 日本語の北海道方言として列挙された48項目。うち「ルイベ」は本文がアイヌ語からの借用語と明記するため `ainu_loanword` とした。
2. 余市町「広報よいち 2023年3月号『余市弁』」。
   - URL: https://www.town.yoichi.hokkaido.jp/kurashi/kouhou/2023/files/03/2303-1-12.pdf
   - 対象地域: 余市町。記事が余市町採録語として列挙した語、および余市周辺で聞かれた語に限定した。
   - 採用: 6項目。

## 判定集計

- accepted: 54
- rejected: 0
- hold: 2グループ
- canonical before: 1
- canonical after: 55

HOLDは、論文後半の「『十勝平野』のアイヌ語について」に列挙された22項目と、既存の「なまら」。前者は日本語方言recordとの混同を避け、各語の日本語への借用実態と言語分類を追加確認する必要がある。後者は今回の資料だけでは既存recordの道央限定・既存例文を十分に補強できないため変更しなかった。

## 地域別件数

- 道央: 7（既存1、追加6）
- 道南: 0
- 道北: 0
- 道東: 48（追加48）

確実なclaim-level evidenceを優先したため、道東の十勝地方に大きく偏った。道南・道北を件数合わせで補完せず、追加調査対象として残した。

## Evidence監査

accepted 54件は、資料本文でphrase、meaning、regionを直接確認した。論文項目には本文掲載例があるためexampleとusageも付与した。余市町資料は本文に例がある4件だけexample scopeを付与し、例がない2件には付与していない。readingは独立した読みの根拠がないため空欄とし、reading scopeを付与していない。現在性、年代別使用、age group、頻度、語源は個別に根拠がない限り追加していない。

## 重複・identity

北海道内の既存record、全県canonical JSON、`src/data.ts`、`src/extendedData.ts` を照合した。県をまたぐ同形語は地域identityが異なるため衝突とは扱わず、北海道内の同一identity重複は追加していない。IDとslugは `jp-01-hokkaido-002` から `-055` まで新規採番し、repository全体で重複がないことを確認した。

## Source accessとvalidation上の注意

J-STAGEのPDFと余市町公式PDFは2026-09-19に閲覧できた。`npm run validate:data` は最新mainに既存する `src/data/dialects/fukushima.json` の54件で `reading` が未定義のため、北海道recordへ到達する前にTypeErrorで停止する。北海道追加54件は全件 `reading: ""` を明示している。Goal外の福島県fileは変更していない。
