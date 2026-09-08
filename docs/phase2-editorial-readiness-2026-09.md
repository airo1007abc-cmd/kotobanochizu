# ことばの地図 Phase 2 — 2026-09-08

## Git・本番

Phase 1の57f33f681e8c4d7be66b16e96847a6d8950c7641をorigin/codex/site-audit-2026-09へ保存し、mainへfast-forward、origin/mainへpushした。Phase 2はcodex/editorial-readiness-phase2で実装。force push・reset・既存変更破棄はしていない。
初回のpushは自動承認レビューで送信先の帰属確認を求められた。認証アカウントとGitHub公開リポジトリ所有者の一致を読み取り確認し、変更に秘密情報がないことを検査後、再レビューでpush承認・実行済み。認証情報の抽出・環境変数のダウンロードはしていない。
実装コミットcf8710aと地図補足文のコントラスト修正04979b7をmain・作業ブランチ双方へpush済み。本番ソースは04979b7582ea5a4090ca12f606acc43bcba990c5。検証報告の追記は別コミットで保存。

## 公開画面の改善

- 本番ブラウザで「今日のことば」のデモ、音声・字幕デモ、公開準備チームの表記を確認。トップの紹介は既存indexable記録、比較は既存indexableの意味ページへ接続。
- 未確認の会話本文・クイズ問題・架空の比較例・未接続音声アップロードを撤去。旧URLはnoindexの掲載終了案内として維持し、資料のある発話紹介へリンク。
- 運営者の氏名や団体名は推測していない。名称未設定時のfooterを編集方針への中立的案内へ変更。
- 送信されない投稿機能を「ことばのメモ」へ変更。公開同意を求めず、端末内の最新50件を保存・再表示・削除できる。保存失敗も明示。以前の投稿保存領域は変更・削除していない。
- 送信されない訂正受付フォームを除去。実際の連絡先が設定されている場合だけmailtoを表示し、未設定時は送信非対応を説明。運営窓口の提供自体は未解決の運用課題。
- 提供していない共同制作・研究API・有料プランなどの構想を公開ページから外し、資料利用と継続の方針へ整理。将来構想はgit履歴に残る。
- 「資料による確認あり」「資料を確認中」等へ整理し、項目ごとの確認範囲を説明。検索の内部場面コードは日本語ラベルへ変更。
- 公開前の定型説明は表示層で追加確認が必要な記録と説明。二重の「周辺」を整理。例文欄に混入していた確認作業メモは実例として表示しない。元の言語データ・証拠範囲・SEO判定は変更していない。
- 「音声未収録」、欠損情報、旧使用例の注意、資料注記は正確な未確認表示として残す。資料名の「（案）」や、実際の方言例文中の「デモ」は削除対象ではない。元資料の転記確認注記も、確認不足を隠さないため資料注記内に保持。

## 13資料・42記録の判断

現行発行元で修復2 URL / 21記録、同じURLのWeb Archive本文で回復9 URL / 19記録、HOLD 2 URL / 2記録。保存版回復は現行URLの復旧とは区別する。9件は元URL・発行者・確認範囲を保持し、保存版と取得確認日を補助表示する。別資料への置換やindex昇格は行っていない。

| # | 資料 | 原因 | 記録数 | 判断 | URL | 根拠 |
|---|---|---|---:|---|---|---|
| 1 | 株式会社みなみ丸 森光社長 | SSL証明書期限切れ | 1 | HOLD | [元URL](https://kochike-fish.pref.kochi.lg.jp/news/%E6%A0%AA%E5%BC%8F%E4%BC%9A%E7%A4%BE%E3%81%BF%E3%81%AA%E3%81%BF%E4%B8%B8%E3%80%80%E6%A3%AE%E5%85%89%E7%A4%BE%E9%95%B7/) | 県の既存記事を検索で確認。通常TLSで証明書期限切れ。検証を無効化せずHOLD。Archive APIにも保存版なし。 |
| 2 | 日本的な言葉遣いを大切に（案）～方言（筑後弁）の校内掲示をお願いします～／残したい方言50選 | PDF移転 | 20 | RECOVERED | [元URL](https://www.city.chikugo.lg.jp/var/rev0/0054/1841/1191179333.pdf) / [移転先](https://www.city.chikugo.lg.jp/var/rev0/0056/6602/1191179333.pdf) | 筑後市の現行資料一覧から同名PDFを取得。表題・発行主体・残したい方言50選の20語を照合（PDF 3〜4頁）。 |
| 3 | 全国方言辞典（佐藤亮一編・三省堂／goo辞書掲載）「つか（香川の方言）」 | DNS解決失敗 | 2 | RECOVERED_ARCHIVE | [元URL](https://dictionary.goo.ne.jp/leaf/dialect/2928/m0u/) / [保存版](https://web.archive.org/web/20250620210444/https://dictionary.goo.ne.jp/leaf/dialect/2928/m0u/) | 保存版の「つか」本文に意味「下さい」、東讃では「いた」と明記。辞書の資料格付けは変更しない。 |
| 4 | 宮崎市文化財関係公開資料（地域の地名伝承） | HTTP 404 | 1 | RECOVERED_ARCHIVE | [元URL](https://www.city.miyazaki.miyazaki.jp/fs/5/3/1/9/2/4/_/531924.pdf) / [保存版](https://web.archive.org/web/20241215072559/https://www.city.miyazaki.miyazaki.jp/fs/5/3/1/9/2/4/_/531924.pdf) | 保存PDF 28頁（本文25頁）ヅンブリ島伝説に語形・水を被る意味・田吉の地域を確認。 |
| 5 | 延岡市立図書館公開資料（「延岡のことば」紹介） | HTTP 404 | 2 | RECOVERED_ARCHIVE | [元URL](https://www.city.nobeoka.miyazaki.jp/uploaded/attachment/16087.pdf) / [保存版](https://web.archive.org/web/20240507075423/https://www.city.nobeoka.miyazaki.jp/uploaded/attachment/16087.pdf) | 保存PDF 1頁、Vol.152の延岡のことば紹介で2語の意味を確認。現行図書館のバックナンバーは2024年以降のみ。 |
| 6 | 県政広報資料（おじゃったもんせ解説） | HTTP 404 | 1 | RECOVERED_ARCHIVE | [元URL](https://www.pref.kagoshima.jp/kohokocho/kouhoushi/kohosi/gurakago/h30/documents/68694_20181210094057-1.pdf) / [保存版](https://web.archive.org/web/20220812235614/http://www.pref.kagoshima.jp/kohokocho/kouhoushi/kohosi/gurakago/h30/documents/68694_20181210094057-1.pdf) | 保存PDF 1頁（誌面31頁）の鹿児島の方言講座で語形・意味・薩摩大隅・例文を確認。 |
| 7 | Let’s speak SASEBO-BEN! 佐世保弁動画 | DNS解決失敗 | 5 | RECOVERED_ARCHIVE | [元URL](https://saseboechan.com/2020/05/04/sasebobenrecapep202005/) / [保存版](https://web.archive.org/web/20260315013020/http://saseboechan.com/2020/05/04/sasebobenrecapep202005/) | 同じURLの保存本文（総集編1）で5語の説明を確認。動画の発音は再確認していない。 |
| 8 | Let’s speak SASEBO-BEN! 佐世保弁動画 | DNS解決失敗 | 5 | RECOVERED_ARCHIVE | [元URL](https://saseboechan.com/2020/05/15/sasebobenrecapep202005-2/) / [保存版](https://web.archive.org/web/20260508114025/https://saseboechan.com/2020/05/15/sasebobenrecapep202005-2/) | 同じURLの保存本文（総集編2）で5語の説明を確認。動画の発音は再確認していない。 |
| 9 | しまくとぅば教室 | DNS解決失敗 | 1 | HOLD | [元URL](https://www2.pref.okinawa.jp/oki/Gikairep1.nsf/481e05e7edaca1db49256f540004c033/424a296377bce4ab4925719200247dae?Click=&OpenDocument=) | 旧議会URLはDNS失敗。Archive APIに当該URLの保存版なし。主出典の確認を取り消す根拠ではなく、追加資料の来歴のみHOLD。 |
| 10 | 広報させぼ『カンカン山んにき』 | HTTP 404 | 1 | RECOVERED_ARCHIVE | [元URL](https://www.city.sasebo.lg.jp/soumu/kouhou/kohosasebo/documents/201508p4-9.pdf) / [保存版](https://web.archive.org/web/20230731215736/https://www.city.sasebo.lg.jp/soumu/kouhou/kohosasebo/documents/201508p4-9.pdf) | 保存PDF 1頁（誌面4〜5頁）、脚注にカンカン山んにき＝カンカン山の辺りと明記。 |
| 11 | いっそDEフェスタ2015実施概要 | HTTP 404 | 1 | RECOVERED_ARCHIVE | [元URL](https://www.city.yatsushiro.lg.jp/kiji0031915/3_1915_2059_up_s83vsuhq.pdf) / [保存版](https://web.archive.org/web/20240518111553/https://www.city.yatsushiro.lg.jp/kiji0031915/3_1915_2059_up_s83vsuhq.pdf) | 保存PDF 9頁、いっそDEフェスタ2015実施概要に八代地域・みんな一緒にの意味を確認。 |
| 12 | 道の駅「ごいせ仁摩」施設案内（「ごいせ」の説明） | HTTP 404 | 1 | RECOVERED_ARCHIVE | [元URL](https://www.city.oda.lg.jp/files/original/20220125205507342338ecbbe.pdf) / [保存版](https://web.archive.org/web/20220308022058/https://www.city.oda.lg.jp/files/original/20220125205507342338ecbbe.pdf) | 保存PDF 1頁を描画確認。「ごいせのはなし1」に仁摩地域・いらっしゃいませを明記。 |
| 13 | 行ってみてひったまがった | PDF移転 | 1 | RECOVERED | [元URL](https://www.city.chitose.lg.jp/fs/6/3/1/4/1/8/_/________________________.pdf) / [移転先](https://www.city.chitose.lg.jp/_res/projects/default_project/_page_/001/003/883/_________________________2.pdf) | 千歳市移転PDF 4頁に佐賀のがばい＝すごい・とても。学校交流報告の範囲に留めnoindex維持。 |

全対象IDと従来のindex状態は[機械可読台帳](../reports/phase2/source-decisions.json)に記載。
通常TLSによるGET、発行元の現行目次、検索、Archive API、保存本文を使用。検索エンジンに残るPDF本文だけでは復旧扱いにしていない。失敗は消失・誤記の証拠とみなさず、SSL検証を無効化していない。
筑後市は[現行の教育委員会資料一覧](https://www.city.chikugo.lg.jp/kosodate/_8478/_17849/_18416.html?media=pc)から同資料を取得。千歳市の学校交流資料は語形・意味の記述のみを裏付け、専門的方言資料への格上げはしていない。延岡市の[現行バックナンバー](https://www.city.nobeoka.miyazaki.jp/site/library/3574.html)は2024年以降の掲載。

## Accessibility・Performance

Lighthouse 13.4.1（axeによる自動検査を含む）、Chrome headless、モバイルの標準シミュレーション。実機・読み上げソフトの包括試験ではない。
- supporting textのコントラスト、ホーム補助見出しのopacity、検索結果h2を修正。
- keyboard only：スキップリンクEnterでmainへフォーカス、地図Enter/Space選択、Tab順、47個の操作ラベルとaria-pressed、選択結果へのリンクを確認。地図のfocus-visibleは濃色10px strokeで表示。
- 地図クリックの構造と地域リンクを維持。県境は方言境界ではないとの説明を保持。小さい県形状はモバイルで十分な大きさを確保できないため、既存の県名リンクでも操作可能。
- フォームラベル、メモ保存・再読み込み・削除、検索0件と条件解除、main/nav/footerランドマークを確認。モーダル・ダイアログは現在の公開UIに存在せず該当なし。
- 例文や音声・地図・大型一覧をスコア目的で削除していない。既存の24件ページ分割を維持。
- 初回地図表示はJS取得後にSVG fetchする直列構造だったため、対象ページのHTMLで地図SVGをpreload。デモ削除で不要UIコードも削減。createRootによる再描画は継続。SSRと端末内状態・検索パラメータの一致を保証せずhydrateRootへ変更することは避けた。
- CrUX fieldデータと実利用INPは取得していない。Lighthouse TBTをINPと読み替えない。公開直後のfield不足を不具合として扱わない。GA4を維持し、計測停止でスコアを上げる変更はしていない。
- localhost検査は非圧縮配信のためPerformance比較には用いない。本番前後は同じCLI設定で比較する。単回のlab値には変動がある。

## 回帰とQA

生成URL 2,316：index 1,044、noindex 1,270、redirect 2。audit:siteのnoindex=1,272は転送HTML2件を含む表示。
H1欠落0、パンくず不存在0、broken internal links 0、orphan 0、canonical不整合0、構造化データ不正0、sitemap 1,044・不整合0。
Phase 1の51 testsを維持し、端末内メモの分離保存・破損データ、未確認表示・作業メモ除外を追加。lint/typecheck/test/buildと全URLの軽量静的監査を実施。全国JSON 1,628件validationはerrors=0、既存未確認例文など809warningsを保持。

## 本番反映後の結果

Vercel公式CLIのリモートビルド・生成検査が成功。2026-09-08にdeployment dpl_D4Zip1prRmzb6ebEJAy7MbudemHF（https://kotobanochizu-26vksy339-catholic-web.vercel.app）をproductionへpromote成功。
[kotobanochizu.jp](https://kotobanochizu.jp/)で最終CSS index-Cnay0zAh.css、ホーム紹介、footer、地図、検索、福岡県、福岡市周辺、筑後の修復語、大田の保存版、編集方針、404を実ブラウザ確認。代表9ページはH1各1、canonical・robots正当、不要デモなし、モバイル横はみ出しなし。編集方針の遅延読込後もH1・本文の表示を確認した。
県・地域補足文を再修正し、最終のローカル自動Accessibilityはhome/map/search/word/prefecture/region/memo/policyの8ページすべて100。本番4ページも100。スコアは包括的アクセシビリティ適合の証明ではない。

### 本番Lighthouse（モバイル、同じシミュレーション設定）

| ページ | Performance 前→後 | LCP 前→後 | TBT 前→後 | CLS 後 | Accessibility 前→後 |
|---|---|---|---|---|---|
| home | 76→60 | 3.43s→5.93s | 517→252ms | 0 | 95→100 |
| map | 58→72 | 5.67s→3.93s | 346→330ms | 0 | 95→100 |
| search | 62→63 | 5.14s→5.00s | 426→416ms | 0 | 94→100 |
| word | 65→62 | 4.98s→5.73s | 357→366ms | 0 | 96→100 |

ホーム再測定：64点、LCP 5.43s、TBT339ms。単語再測定：65点、LCP5.30s、TBT330ms。初回計測の不利な結果も保持した。地図の改善とホームのJSブロッキング減少は確認できたが、全ページのLCP改善は達成していない。ホームのLCPは改修前より遅く、残課題として扱う。実利用INP・CrUXは未取得で、Core Web Vitals合格を宣言しない。
初期アプリJSは198,048→134,562 bytes（非圧縮、約32%減）。フォント/画像追加なし。残る主なコストは全カタログの初期ロード、React再描画、GA4。GA4の描画後ロードもローカル実験したが、Performance47点のままで改善根拠がなく採用していない。元のGA4設定・読込を保持。本番のLighthouseでGA4スクリプトの読込も確認。
[Googleの第三者スクリプト最適化資料](https://web.dev/articles/efficiently-load-third-party-javascript)を参考に検討したが、計測データを犠牲にする変更や根拠のない大規模hydration改修は採用しなかった。閲覧不能や大きなレイアウト移動は検出されていないが、低速モバイル条件のLCPには継続改善が必要。

最終採用コードのテストは55件（既存51+追加4）。実験時のみ追加した2件は不採用コードとともに取り除いた。lint/typecheck/test/build成功。最終本番の軽量crawl結果はreports/site-audit/phase2-production.jsonに保存。

本番軽量crawlの最終結果：2,316 URL、index1,044 / noindex1,270 / redirect2。HTTP失敗・H1欠落・パンくず不存在・内部リンク切れ・孤立・canonical不整合はすべて0。本番検索入力後の0件案内と、本番地図のキーボード選択も確認済み。
