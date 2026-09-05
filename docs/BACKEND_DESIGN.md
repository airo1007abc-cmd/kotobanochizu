# Supabase接続設計

`supabase/migrations/202608250001_initial_schema.sql` は将来接続用で、現環境には未適用です。公開読み取りは監修済み・デモのみ、投稿は本人だけが作成・参照、審査操作は別途 moderator ロールを持つ利用者だけにします。管理権限をクライアントが書き換え可能なmetadataだけで判定しません。

Storageは非公開の `submission-audio` / `submission-video` と、審査後公開する `published-media` を分離します。`user_id/submission_id/random-file-name` のパスへ署名付きアップロードし、MIME・容量・再生時間をサーバー側でも検査します。投稿時点では公開URLを作らず、審査承認時に変換済みファイルを公開領域へコピーします。原本の保持期間、削除依頼、同意撤回を運用規約で定めます。

`202608310001_publication_readiness.sql` は、公開可能な音声・映像metadataを `media_assets`、原本のpathとchecksumを `media_asset_private`、非公開の同意証跡を `media_consents` に分離します。公開には同意日時、同意文書版、利用範囲、話者表示、撤回窓口が必要で、撤回済み素材は公開metadataのRLS条件から外れます。同意証跡のファイルパスや連絡情報を公開テーブル・公開Storageへ置かないでください。

## 権限・訂正・監査

moderator/adminは `staff_roles` のサーバー管理行だけで判定し、編集可能なユーザーmetadataを信頼しません。`is_staff` はsearch_pathを固定したsecurity-definer関数です。`correction_requests` は事実誤認、地域差、権利侵害、同意撤回を受け付け、`moderation_events` は審査判断の追記専用監査ログとして扱います。管理画面からの状態変更と同時に監査イベントを同一トランザクションで記録してください。

未ログインのfavorites/reactionsは端末保存を続け、ログイン時に一度だけサーバーへマージします。reactionは `(user_id, dialect_id)` を主キーにして一人一票とし、集計値はviewまたは非同期集計で返します。投稿審査は `submitted → under_review → approved / rejected`。遷移、担当者、時刻、メモは本番では監査テーブルにも残します。

大量データでは `prefecture_id`、`region_id`、phrase、standard_japaneseに索引を置き、配列属性はGIN索引を使います。sourceは再利用・確認履歴を扱うため `sources` と `dialect_sources` に正規化します。日本語検索はNFKC・かな・空白を正規化した `search_text` をseed時に生成し、利用可能ならpg_bigm、そうでなければtrigramまたは外部検索基盤を評価します。seedは安定IDを使ったupsertとし、本番行の全削除は行いません。
