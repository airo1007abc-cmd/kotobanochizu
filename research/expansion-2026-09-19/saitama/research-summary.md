# 埼玉県 方言候補調査サマリー

調査基準日: 2026-09-19

## 調査source一覧

| source | organization | 対象地域 | 採用 |
| --- | --- | --- | ---: |
| [埼玉県東部地方の方言分布と世代差（1）―語彙の分布―](https://bunkyo.repo.nii.ac.jp/record/583/files/BKK0000652.pdf) | 文教大学 | 埼玉県東部75地点（高年層）、64地点（中年層） | 55 |
| [二木蒼生さん編 埼玉クラス](https://www.pref.saitama.lg.jp/documents/6130/nikiaoidtxt.pdf) | 埼玉県 | 埼玉県南部（「かたす」） | 0（1 HOLD） |
| [ちちぶ“おもてなし”だより 其の伍](https://www.city.chichibu.lg.jp/secure/1942/201000.pdf) | 秩父市 | 秩父 | 0（3 HOLD） |

## 判断件数

- accepted: 55（すべて新規）
- rejected: 3
- HOLD: 4

## target地域別canonical件数

| 閲覧地域 | 件数 |
| --- | ---: |
| 東部 | 56（既存needs_review 1件を含む） |
| 中央 | 0 |
| 西部 | 0 |
| 北部 | 0 |
| 秩父 | 0 |

東部資料は、2001-2004年（5地点は2009年追加）の面接調査に基づき、高年層80人・中年層67人の語彙分布を本文と地図で報告する。今回のcanonical化では、本文が語形・意味・分布を明記する語形のみを採用した。地図記号だけから個別地点を推測していない。

## language classification上の注意

採用資料は対象を埼玉県方言・関東方言の語彙として扱っているため、現行schemaの `japanese_dialect` を使用した。語源や隣県からの伝播は本文に考察があってもcanonical claimへ追加していない。

## source access上の注意

文教大学リポジトリのlanding pageはアクセス時にrate limitを返す場合があったが、リポジトリが公開するPDF本体は取得・全59ページ確認できた。秩父市資料は大容量の広報PDFであり、検索結果に表の一部は確認できたものの、今回の採用枠では表全行の再監査を終えていないため候補をHOLDした。

## 品質方針

- readingは資料が独立して示さないため空欄。
- exampleは追加していない。
- usage・現在性・世代一般化・語源を追加していない。
- navigation regionは資料の調査範囲が明示する「東部」を使用し、本文のより狭い分布は `evidenceRegion` に保持した。
