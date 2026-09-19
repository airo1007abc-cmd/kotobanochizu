# 青森県 方言拡張調査サマリー

調査基準日: 2026-09-19

## 結果

- canonical before: 0件（`src/data/dialects/aomori.json` の再集計）
- accepted: 55件
- rejected: 10候補（無回答7件、翻訳用例の主語欄が空欄の3件）
- HOLD: 1資料群（津軽・南部の本文未検証候補）
- canonical after: 55件

## 調査source

### 国立国語研究所「青森県むつ方言調査報告書」

- organization: 国立国語研究所
- URL: https://repository.ninjal.ac.jp/record/3008/files/Research_Report_on_Mutsu.pdf
- 対象地域: 青森県むつ市曙町（調査会場: 曙町集会所）
- 調査時期: 2018年8月30日・31日
- 確認箇所: 概要pp.1-5、文法項目データ集pp.105-111（PDF pp.8-12、112-118）
- accepted: 55件
- rejected: 10候補（方言回答が「無回答」の7件、完全な標準語文を確定できない3件）
- evidence: 方言文、標準語の翻訳用例、調査地点を同一報告書で確認した。用例は主語標示・目的語標示の翻訳調査用例であり、自然談話や現在頻度とは扱わない。

### 国立国語研究所「津軽・南部境界地域方言地図」ほか

- organization: 国立国語研究所ほか
- URL: https://www2.ninjal.ac.jp/hogen/dp/ladp/417/417_index.html
- 対象地域: 津軽・南部境界地域
- decision: HOLD
- reason: 公開目録・概要・地図項目は確認できたが、今回の調査時間内に個別語の語形・意味・地点を同時に検証できる本文へ到達できなかった。推測や範囲拡張を避け、canonical化していない。

## 閲覧地域別件数

- 津軽: 0件
- 南部: 0件
- 下北: 55件

55件すべての `evidenceRegion` は「むつ市曙町」、`locality` は「曙町集会所」とした。`regionName: 下北` は閲覧用navigation区分であり、下北全域での分布を主張しない。

## Claim-level evidence監査

- phrase: 文法項目データ集の方言文を転記
- meaning: 同じ行に併記された翻訳用例を転記
- region: 概要の調査地点・会場記述を使用
- example: 方言文と翻訳用例の対を保持
- reading: 独立した読みとしては付与しない
- usage: 自然使用・頻度を支える資料ではないためscopeを付与しない
- history: scopeを付与しない
- ageGroups: 個別用例の話者を特定できないため `unknown`
- usageFrequency: 資料から頻度を判断できないため `unknown`

## Duplicate / identity監査

候補は全文の方言文と翻訳用例、調査項目、地点を単位にidentityを判定した。対象県canonical、Repository全体、legacy data（`src/data.ts`、`src/extendedData.ts`）とのID・slug・route identityを検査し、同一identityは追加しない。

## Language classification上の注意

報告書自体が「青森県むつ方言」を対象とする日本語の方言調査として作成されているため、`languageVariety` は既存schemaの `japanese_dialect` とした。津軽・南部・下北を一括せず、語形の分布を県全域へ一般化していない。

## Source access上の注意

公式PDFは画像中心で通常のテキスト抽出ができなかったため、対象ページをレンダリングして目視照合した。外部書誌だけで本文を確認できなかった津軽・南部候補はHOLDとした。表記中の記号を含め、判読が確実な行だけを採用した。
