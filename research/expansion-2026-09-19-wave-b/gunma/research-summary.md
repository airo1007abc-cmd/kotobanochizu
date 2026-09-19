# 群馬県 Wave B 調査概要（2026-09-19）

## 結果

- 起点: `origin/main` `82a1e392c35b03f031b32ab2a62a19d4036f60aa`、10件。
- 採用45件、rejected 0件、HOLD 0件。canonicalは55件。
- 新規採用の閲覧地域: 中毛43件（前橋市今井町）、北毛2件（中之条町六合地区）、西毛0件、東毛0件。既存を含む合計は中毛44件、北毛2件、西毛9件、東毛0件。
- 語形・意味・地点を各資料の同一箇所で確認した。読み、例文、頻度、現用性は補わなかった。

## 採用資料

1. 前橋市公開『城南地区の今昔調べ』「11 方言」、印刷p.46–47。前橋市今井町発行『荒砥川』第129号増刊号からの引用一覧。source organization: 前橋市。対象地点は前橋市今井町。URL: https://www.city.maebashi.gunma.jp/material/files/group/19/R0610jounan-nenpyou4-4.pdf 。43件採用。p.48以降には別号や旧荒砥村の一覧が続くため、この採用分の地点とは混同しなかった。
2. 中之条町公開『広報なかのじょう』六合えむプロジェクト記事、PDF p.3。source organization: 中之条町。対象地点は中之条町六合地区。URL: https://www.town.nakanojo.gunma.jp/uploaded/attachment/1467.pdf 。「えぶ」「えんでる」の2件を採用。

## 調査したが採用しなかった資料

- 中之条町誌Web版「言語伝承」のPDF: https://www.town.nakanojo.gunma.jp/uploaded/attachment/4217.pdf 。画像・多段組のOCR結果だけでは語形と意味の列対応を十分に確定できないため、候補を採用しなかった。
- 桐生地方の方言資料の書誌情報: https://ci.nii.ac.jp/ncid/BB09638496 。本文を確認できず、東毛への採用なし。

## 地域偏りと注意

新規45件のうち43件が前橋市今井町に集中する。北毛・中毛を補えたが、東毛の空白は残る。資料の地域は語の分布範囲ではなく、記録・収録された地点として扱った。`regionName` は閲覧区分であり、方言境界を意味しない。`languageVariety` は既存の群馬県レコードと同じ `japanese_dialect` を使用し、県内下位分類は推測しなかった。歴史的な一覧には現在の使用状況を示す証拠がない。

## 監査

新規45件はphrase、meaning、regionの証拠scopeとsource metadataを持つ。新規ID・slugは重複なし。`npm run validate:data` の新規エラーは0。build後のroute decisionsで新規45件がindexable。全体のindexability auditにある既存のidentity collisionは群馬県外であり、新規群馬県のroute collisionは0。

統合時に引用ページを画像照合し、六合2件はPDF p.3へ訂正。前橋43件にもcandidateの位置をsourcePageとして明記した。
