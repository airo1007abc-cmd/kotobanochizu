# Deployment checklist

## SEO origin

- [ ] 本番環境で `SITE_URL=https://kotobanochizu.jp`（実際の正規公開origin）を設定する
- [ ] 方言詳細ページの `canonical` が相対URLやlocalhostではなく正規公開URLになることを確認する
- [ ] `og:url` がcanonicalと一致することを確認する
- [ ] HTTP/HTTPS、www有無、末尾スラッシュの方針がcanonicalと一致することを確認する
- [ ] 代表ページとnoindexページのrobots/canonicalの組み合わせをproduction buildで確認する
- [ ] 全47県の `/prefectures/:id` でcanonical・`og:url`・BreadcrumbListが正規公開originを使うことを照合する
- [ ] sitemap生成後、全47県の県URLと公開対象の方言URLが欠落していないことをID側から照合する
- [ ] 全195地域の `/regions/:id` で既存robots方針を維持し、canonical・`og:url`・BreadcrumbListを正規公開originで照合する
- [ ] sitemap公開判定がRegion V2化の前後で変わっていないことを確認する

## 地域文化資料

- [ ] 文化資料の外部URLが本番環境からHTTPSで開けることを確認する
- [ ] 音声・映像・歌詞をサイト内へ複製せず、提供元の利用条件に従うことを確認する
- [ ] `rights_review_required` の資料が公開UIへ混入していないことを確認する
- [ ] 市町村だけ確認できた資料を、根拠なしに県内地域IDへ割り当てていないことを確認する

ローカルでは `SITE_URL` 未設定時にcanonicalを生成しない既存仕様です。コンテンツ編集の成否とは分離し、本番deployのblocking checkとして扱います。
