# 栃木県 Wave B 調査まとめ

- 調査日: 2026-09-19
- 起点: origin/main 82a1e392c35b03f031b32ab2a62a19d4036f60aa、既存31件（県南31件）
- 採用: 24件、拒否: 0件、HOLD: 3件。追加後55件。
- 地域別新規採用: 県北24件、県央0件、県南0件。既存込み県北24件、県央0件、県南31件。

## 調査資料

- 那須烏山市「[なすから方言講座](https://www.city.nasukarasuyama.lg.jp/nasukara-life/about-nasukara/nasukara-pride/page000917.html)」。対象地点は那須烏山市。あ行・か行・さ行・た行の語形と意味の対訳表を個別照合した。
- 栃木県「[令和５年度県政世論調査・地域区分](https://www.pref.tochigi.lg.jp/c05/pref/kouhou/iken/documents/20231020131233.pdf)」。３地域区分で那須烏山市を県北に置く根拠として参照。これは言語学的方言境界を意味しない。
- 栃木県「[とちぎの慣習・ことば集](https://www.pref.tochigi.lg.jp/m06/kansyuukotoba.html)」。PDFの語義を目視確認したが、個別地点不明の候補はHOLD。
- 茂木町「おめぇ知ってっか？に青い車が登場！」。検索結果で候補を確認したが本文へのアクセスに失敗しHOLD。
- 鹿沼市南摩地区広報第8号。別候補は今回HOLD。

## 監査

採用24件は全件、語形・意味・那須烏山市という地域を同一の市公式資料で確認。読み・例文・現用頻度・世代差・語源は付けなかった。既存31件と全県ファイルのID・slugを比較し、連番032–055を割り当てた。ルート衝突はvalidationで別途確認する。

県北の那須烏山市１地点に集中し、県央が空白。県央資料は検索で見つかったが本文を直接照合できないため採用しなかった。資料の「なすから」市域を市内各地区や県北全域へ広げていない。言語分類は既存の栃木県レコードに合わせた japanese_dialect であり、個別の分類研究を新たに主張しない。公式HTMLは表の列対応が明瞭。県PDFは画像でありOCR転記を採用していない。

## 対象限定監査とvalidation

- accepted 24 = canonical added 24 = core eligible 24 = route indexable 24。
- 新規24件のsource欠落、phrase/meaning/region scope欠落、ID・slug重複、route identity collision、noindex はすべて0。
- 生成された24件のcanonical URLと分割sitemap掲載を確認。`dist/sitemap.xml` はsitemap indexであり、個別URLは `sitemap-1.xml` 以降にある。
- `npm run lint`、`npm run typecheck`、`npm run test`（10 files / 63 tests）、`npm run validate:data`、`SITE_URL=https://kotobanochizu.jp npm run build`、`npm run seo:site-audit`、`npm run audit:indexability`、`npm run audit:content-priority` はPASS。
- `validate:data` は新規レコードの `reading` プロパティを省略すると既存の正規化処理で例外になるため、未確認を表す空文字列にした。reading evidence scopeは付けていない。
- 全体の既存identity collision（愛媛・島根）と例文未確認warningは今回の対象外。栃木県の新規24件に衝突はない。
