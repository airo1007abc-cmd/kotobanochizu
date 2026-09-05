# 方言 Resolution Batch

本番方言データ変更: **なし**

## きときと — APPROVE_REFINE

- confidence: high
- exactFormMatch: exact
- changeType: meaning_refinement

### standardJapanese
- before: 新鮮で生き生きしている
- after: 新鮮な・生きがいい／元気で活力がある
- reason: AND表現を避け、一次資料で確認できる鮮度用法と活力用法を分ける。

### description
- before: 「きときと」は、富山市が「新鮮な、ピチピチとした」という意味で紹介する富山のことばです。市場、空港などの名称にも採用され、魚介の新鮮さを伝える場面で地域に親しまれています。「輝かしい」という印象を重ねた地域のコピーにも使われています。
- after: 富山の「きときと」は、魚介などが新鮮で生きがいい状態を表します。富山県資料には、人や心身が元気で活力のある状態を表す用法もあります。行政の名称や企画では「輝かしい未来」などのイメージを重ねた例がありますが、これは基本語義と区別して扱います。
- reason: 食物、人・心身、名称・広告上の比喩を資料の強さに応じて区別する。

### Evidence
- [すしのまち とやま](https://www.city.toyama.lg.jp/bunka/kanko/1015608.html) — 富山市 / Tier 1 / exact / 新鮮な、ピチピチとした、魚介、コピー上のイメージ
- [みんなで参加しよう Q&A質問コーナー](https://www.pref.toyama.jp/1021/kensei/kenseiunei/kensei/naruhodo/qa.html) — 富山県 / Tier 1 / exact / 新鮮な、いきいきした
- [元気とやまマスコット きときと君](https://www.pref.toyama.jp/1021/kensei/kouhou/public/kitokitokun.html) — 富山県 / Tier 1 / exact / 新鮮、生きがいい、心と体
- [生涯スポーツ推進の手引き・スポレクとやま2010ハンドブック](https://www.sportsnet.pref.toyama.jp/contents/sporec_hand/2-1.html) — 富山県関係スポーツ機関 / Tier 1 / exact / 新鮮、元気、活力
- [中学校国語科における言語単元の開発研究](https://cerp.u-toyama.ac.jp/file/bulletin/bulletin2013.pdf) — 富山大学 / Tier 2 / exact / 新鮮な、ぴちぴち、活きがいい、元気な

### 未解決
- 呉東という現行地域区分の直接的な分布根拠
- 活力用法の現在頻度

## ささって — KEEP

- confidence: high
- exactFormMatch: exact
- changeType: verification

municipalityは『川越町（使用例）』と限定済みで、公的な川越町所在企業記事に当該用法がある。北勢は実用地域区分として整合するが、北勢全域の言語分布を断定しない現行方針を維持する。

### Evidence
- [みえの仕事さがしch. 県内企業インタビュー](https://www.shigotosagashi.pref.mie.lg.jp/interview_post/%E6%B8%85%E7%94%B0%E8%BB%8C%E9%81%93%E5%B7%A5%E6%A5%AD%E6%A0%AA%E5%BC%8F%E4%BC%9A%E7%A4%BE%EF%BC%88%E5%B7%9D%E8%B6%8A%E7%94%BA%EF%BC%89%E3%80%80%E3%80%80%E6%B5%A6%E6%A9%8B-%E5%88%A9%E5%85%B8/) — 三重県 / Tier 1 / exact / 川越町所在企業のインタビュー文脈、三重で3日後を指す用法
- [三重の方言関係資料](https://www.library.pref.mie.lg.jp/collection/folder/post-1.html) — 三重県立図書館 / Tier 1 / uncertain / 川越町史の方言章、川越町が北勢資料区分に属すること

### 未解決
- 川越町生育話者による用例ではない
- 北勢全域の使用率・別形分布

## めんそーれ — SPLIT_CONTEXT

- confidence: high
- exactFormMatch: exact
- changeType: region_refinement

### description
- before: 「めんそーれ」は、沖縄県の教材で「いらっしゃい」に対応する首里のことばとして紹介されています。人を迎える挨拶として使われ、県の教材には発音音声と、店を訪れた客を迎える会話例があります。宮古・八重山などでは別の表現があるため、沖縄県全域を一括りにはしません。
- after: 首里・中南部の地域語としての根拠と、海洋博以降に歓迎表現として広域的に認知・使用された経緯を別段落・別claimで説明する。region自体は沖縄本島中南部を維持する。
- reason: 伝統的地域語の分布と、観光・行政による現代の広域使用を混同しない。

### Evidence
- [しまくとぅば教室](https://www.pref.okinawa.lg.jp/kyoiku/kodomo/1002688/1002689/1002690.html) — 沖縄県 / Tier 1 / exact / 首里のことば、いらっしゃい、音声
- [しまくとぅば読本 小学生](https://www.pref.okinawa.lg.jp/_res/projects/default_project/_page_/001/011/776/tokuhonsyoup18-51.pdf) — 沖縄県 / Tier 1 / variant / 中南部の買い物会話、めんそーれー
- [沖縄県議会会議録](https://www2.pref.okinawa.jp/oki/Gikairep1.nsf/481e05e7edaca1db49256f540004c033/424a296377bce4ab4925719200247dae?Click=&OpenDocument=) — 沖縄県議会 / Tier 1 / variant / 海洋博時の県民の合い言葉、県広報・那覇市・空港での広域使用、表記差

### 未解決
- 中南部内の詳細な伝統分布
- 現代の日常会話頻度

## あーた — REFINE_REGION

- confidence: high
- exactFormMatch: exact
- changeType: correction

### regionName
- before: 県東部（岩国・柳井など）
- after: 周南地方
- reason: 主要資料は『山口弁（周南地方）辞典』の増補改訂版であり、現行municipalityとも一致する。県東部（岩国・柳井など）という範囲は当該見出しの直接根拠になっていない。

別義: **HOLD** — 資料自身が『あいた』項目へ記載した別語として相互参照しているため、現在の二人称ページへ詰め込まない。別レコード化には該当項目の語形・意味・例文・地域を追加確認する。

### Evidence
- [てれんこぽれんこ山口弁](https://hagilib.city.hagi.lg.jp/hagilib-archive/image/863.pdf) — 阿部啓治編・萩市立図書館公開 / Tier 3 / exact / あなた、周南地方辞典の増補改訂版、用例、同形別義への別項参照
- [山口弁（周南地方）辞典 書誌説明](https://hagilib.city.hagi.lg.jp/hagilib-archive/image/863.pdf) — 萩市立図書館公開資料内書誌 / Tier 3 / exact / 資料対象が周南地方、1950～60年代生まれのメンバーが使用した語彙

### 未解決
- 女性形『あぇーた』の独立分布
- 編者観察による世代差の外部追認
- 同形別義の別レコード要件

