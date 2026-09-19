# 山形県 方言拡張 research summary

## 調査条件

- 確認日: 2026-09-19
- canonical採用: 56件
- rejected: 0件
- HOLD: 4件
- 方針: 県公式の地域別ページで方言文・標準語対訳・対象地域を直接確認できる表現だけを採用。読み、現在性、世代差、使用頻度、語源は補っていない。

## Sources

| Source | Organization | Evidence geography | Accepted | Access note |
| --- | --- | --- | ---: | --- |
| [村山地方・村山弁](https://kosodate.pref.yamagata.jp/dialect/murayama) | 山形県しあわせ子育て応援部こども子育て政策課 | 村山地方 | 14 | HTML本文で方言文と標準語対訳を確認 |
| [庄内地方・庄内弁](https://kosodate.pref.yamagata.jp/dialect/shonai) | 同上 | 庄内地方 | 14 | HTML本文で方言文と標準語対訳を確認 |
| [置賜地方・置賜弁](https://kosodate.pref.yamagata.jp/dialect/okitama) | 同上 | 置賜地方 | 14 | HTML本文で方言文と標準語対訳を確認 |
| [最上地方・新庄弁](https://kosodate.pref.yamagata.jp/dialect/mogami) | 同上 | 最上地方 | 14 | HTML本文で方言文と標準語対訳を確認 |
| [方言辞典](https://kosodate.pref.yamagata.jp/dialect/dictionary) | 同上 | 「山形弁」のみ。4閲覧地域は未特定 | 0 | 語形・意味は確認できるが地域割当不能のため例示4件をHOLD |

## Regional coverage

| 閲覧地域 | 新規accepted | canonical total |
| --- | ---: | ---: |
| 庄内 | 14 | 14 |
| 最上 | 14 | 14 |
| 村山 | 14 | 14 |
| 置賜 | 14 | 15（既存「おしょうしな」を含む） |

## Claim-level audit

採用56件は全件、同一の地域別資料内で phrase、meaning、region、example を確認した。掲載形式が家族の対話例であることに限って usage scope を付与したが、一般的な使用場面・現在性・頻度へ拡張していない。reading evidenceはなく、readingは空欄とし、history scopeも付与していない。各表現は掲載された会話の綴りを保持し、標準語欄は同ページの直下対訳に合わせた。

## Duplicate audit

対象県JSON、repository全体のdialect JSON、legacy/demo data（src/data.ts、src/extendedData.ts）を照合対象とした。地域間で似た意味・形があるものも、各地域ページが別々に記録する表現としてregion入りslugを付け、同一route identityを作らない。既存ID・slugは変更していない。

## Language classification

資料自身が各ページを村山弁・庄内弁・置賜弁・最上弁として掲載しているため、現行schemaの japanese_dialect を使用した。語源その他の分類は推測していない。

## HOLD

県公式「方言辞典」は多数の語形と共通語を掲載するが、個別語を4閲覧地域へ割り当てる根拠がページ内にない。件数目的で地域を推測せず、candidate-decisions.jsonの例示4件をHOLDとした。
