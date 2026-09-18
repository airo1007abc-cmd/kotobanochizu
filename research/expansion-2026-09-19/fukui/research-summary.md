# 福井県 方言拡張調査サマリー

調査日: 2026-09-19

## 調査source一覧

1. **方言辞典『まんでもん～若者と方言のズシ～』**
   組織: 福井県交流文化部文化・スポーツ局文化課
   URL: https://www.pref.fukui.lg.jp/doc/bunshin/hougen_d/fil/mandemon.pdf
   対象地域: 福井、奥越、越前海岸、南越前、敦賀、美浜、高浜の各エリア。今回の採用は福井・奥越・越前海岸・敦賀・美浜のカードに限定した。各カードの語形、意味、県内エリア表示を claim-level で確認した。
2. **福井の方言に関する取組みについて**
   組織: 福井県 文化・スポーツ局文化課
   URL: https://www.pref.fukui.lg.jp/doc/bunshin/hougen.html
   対象地域: 福井県。上記公式辞典の掲載元と制作主体の確認に使用した。
3. **しあわせを呼ぶ福井の方言**
   組織: 福井県（監修: 加藤和夫・金沢大学名誉教授）
   URL: https://fupo.jp/lp/fukuiben/
   対象地域: 福井県。木ノ芽峠を境とする嶺北・嶺南の説明と、公式辞典への導線を確認した。個別レコードの語義根拠には使用していない。

## 判断集計

- accepted: 54
- rejected: 1（既存レコードとの実質重複）
- HOLD: 3（判読が一意でない候補、または今回の採用セット外で追加監査待ち）
- canonical total: 1 → 55
- 新規 core evidence: 54
- 新規 indexable route: 54

## target地域別件数

canonical全体:

- 嶺北: 27（既存1、新規26）
- 嶺南: 28（新規28）

source内の evidence geography は navigation region へ置き換えず、`evidenceRegion` に「福井エリア」「奥越エリア」「越前海岸エリア」「敦賀エリア」「美浜エリア」を原表記で保持した。

## Evidence safety

- 新規レコードはすべて公式辞典カードで `phrase`、`meaning`、`region` を直接確認した。
- reading は設定していない。
- 例文は canonical に転記していない。
- usage、age group、frequency、現在性、語源は推測していない。
- `verificationStatus` は新規54件すべて `reference_confirmed`。
- 既存 `jp-18-fukui-001` は今回の source で上書きせず、従来の `needs_review` のまま保持した。

## language classification上の注意

資料自身が収録語を「福井の方言」と位置づけているため、新規レコードは既存schemaの `japanese_dialect` とした。語源や他言語由来は資料カードにないため付与していない。

## source access上の注意

公式辞典は77ページの画像主体PDFで、テキスト抽出できなかった。全ページを画像レンダリングし、採用カードの語形・意味・エリア表示を目視確認した。ページ番号と上下段を `sourcePage` に保存した。灰色の矩形はPDF内の一部画像表示であり、語形・意味・地域表示の判読には影響しない。
