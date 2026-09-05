# 地域文化レイヤー基盤

## 方針

文化資料は都道府県だけにまとめず、`prefectureId`を必須、`regionId`・`municipality`・`languageVariety`を任意の関連軸として保持する。地域境界や言語分類をUI都合で推測しない。既存データに対応先がない資料は公開せず、編集キューで解決する。

## 推奨データモデル

```ts
type RegionalCultureItem = {
  id: string;
  type: "audio" | "conversation" | "song" | "commercial" | "archive" | "book" | "video" | "other";
  title: string;
  prefectureId: string;
  regionId?: string;
  municipality?: string;
  languageVariety?: "japanese_dialect" | "ryukyuan_language" | "ainu_loanword" | "unknown";
  sourceTitle: string;
  sourceOrganization?: string;
  sourceUrl: string;
  rightsStatus: "official_link" | "permission_confirmed" | "public_domain" | "rights_review_required";
  rightsNote?: string;
  description?: string;
  verifiedAt: string;
};
```

## 紐付け順序

1. 資料が明示する市町村・地域IDへ紐付ける。
2. 地域が特定できず都道府県のみ確認できる場合は県単位に留める。
3. `languageVariety`は資料または既存分類で確認できる場合のみ設定する。
4. 同一資料が複数地域を扱う場合、資料レコードを複製せず関連テーブルまたは複数関連IDで管理する。

## 著作権・配信方針

- 初期実装は自治体・研究機関・図書館等の公式ページへの外部リンクを基本とする。
- 音声、歌、CM、映像を権利状態不明のままダウンロード、複製、再配布しない。
- 埋め込みは提供元の利用規約と埋め込み許可を確認できた場合のみ行う。
- 話者音声は同意範囲、匿名化、撤回窓口を記録できる場合のみサイト配信する。
- 書籍は書誌情報と出版社・図書館等への導線を扱い、本文や画像を無断転載しない。

## コンテンツ別の扱い

- 音声：公式音声へのリンクを優先。発音対象語、話者地域、収録年を分離して記録する。
- 会話：創作か記録資料かを明示し、原資料の長文転載を避ける。
- 童歌・歌：歌詞転載を避け、資料名・採録地・所蔵機関・権利情報を中心に扱う。
- CM：企業・放送局の公式アーカイブへのリンク型とし、映像ファイルを保持しない。
- 書籍：ISBN、書名、著者、出版社、刊行年、図書館書誌へのリンクを基本とする。

## 最初の実験候補

佐賀平野または宮古諸島を候補とする。ただし、プロジェクト内には現時点で公開権利まで確認された地域文化資料データがないため、今回はUIを表示しない。一次資料・権利・地域対応を確認できた地域から1地域だけpreviewする。
