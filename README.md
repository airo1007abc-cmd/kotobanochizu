# ことばの地図

日本全国で実際に話されていることばと、その土地の空気を残す地域文化アーカイブのMVPです。方言を県単位で断定せず、地域・家庭・世代ごとの「使用例」として扱います。

## 技術スタックと起動

React 19 / TypeScript / Vite / React Router / Zod / Vitest。Node.js 20以上を推奨します。現在はCSRのためhydration処理はなく、LocalStorageはブラウザ外・破損値・書込み失敗時に安全な初期値へフォールバックします。

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
# 正式公開条件の監査（現在は外部条件未設定のため意図的に失敗します）
npm run release:check

# 未確認データを明示した公開プレビュー版の総合監査
npm run release:preview
```

公開時に `.env.production` またはCI環境変数で次を差し替えられます。

- `VITE_PUBLICATION_MODE=preview`: 未確認データの公開プレビュー表示（正式公開時のみ `production`）
- `VITE_OPERATOR_NAME`: 画面に表示する運営主体名
- `VITE_SUPPORT_EMAIL`: 画面に表示する問い合わせ先
- `SITE_URL`: canonicalとsitemapに使うHTTPS origin

SEOの品質判定、1,000ページ台帳、現在の課題は `SEO_READINESS.md` を参照してください。

`.env.example` を `.env.local` にコピーできますが、現在のモック構成では環境変数は不要です。

## 構成

- `src/domain.ts`: APIやDBにも引き継げるドメイン型
- `src/data.ts`: 47都道府県マスターと福岡・大阪・青森の明示的なデモデータ
- `src/repository.ts`: UIとデータソースの境界。Supabase移行時は同じ契約の実装へ交換
- `src/storage.ts`: 未ログイン時のお気に入り・リアクション保存
- `src/extendedData.ts`: 生活場面を厚くする追加デモデータ
- `src/data/dialects/*.json`: 人が県単位で編集できる全国候補データ
- `src/data/regions.json`: 47都道府県の実用的地域区分
- `src/nationalData.ts`: JSONをドメイン型へ変換する境界
- `src/submission.ts`: 投稿validationと審査待ちデータ生成
- `src/AdminPage.tsx`: 開発環境限定の投稿審査画面（`/admin`）
- `supabase/migrations`: 将来接続用schema/RLS案（未適用）
- `docs/BACKEND_DESIGN.md`: Storage・メディア・審査・同期方針
- `src/App.tsx`: ルートと画面コンポーネント
- `src/styles.css`: 共通デザインシステムとレスポンシブ表示

## データと権利

掲載データはサービス体験を確認するための「デモコンテンツ」「投稿例」で、研究機関の監修済み資料ではありません。実データ化では出典、確認状態、収録年、話者の同意を記録し、地域差・世代差を明示してください。第三者の声・顔・文章は本人または権利者の許可なく公開しないでください。

## バックエンド移行

`repository.ts` の同期APIを非同期Repository実装へ移し、Supabaseの prefectures / regions / dialect_expressions / conversations / submissions 等へ接続します。Storage、認証、RLS、モデレーションを整備してから投稿を公開してください。現在の投稿は「入力→確認→完了」の後にブラウザ内へ `submitted` として保存され、サーバー送信されません。開発中は `/admin` で `submitted → under_review → approved / rejected` を確認できます。

## 実装済みユーザーフロー

ホーム → 県 → 地域 → 方言詳細 → 会話 → お気に入り → URL復元可能な検索 → 全国比較 → 10問クイズ → 投稿確認・完了。データ0件の県も案内と投稿導線を表示します。主要ディープリンクはVite開発サーバーで直接アクセスを確認済みです。

## 全国データと検証

現在は67表現（既存デモ23、全国初期候補44）で47都道府県すべてに最低1件があります。候補44件は出典・地域分布を人が確認するまで `needs_review / source_pending / low confidence` で、UIでも確認済みデータと区別します。件数合わせの生成は行いません。詳細は `DATA_STATUS.md` と `docs/DATA_GUIDELINES.md` を参照してください。

```bash
npm run validate:data
npm run data:stats
```

validatorはID/slug、県・地域relation、必須文、status、年代、頻度、URL、正規化後の重複候補等を検査します。新規データは県別JSONへ追加し、両コマンドとテストを通してから状態を更新してください。

次の開発者は `DEVELOPMENT_STATUS.md` と `src/domain.ts` を先に確認してください。

正式公開の現在地は `RELEASE_AUDIT.md`、公開条件は `PUBLICATION_READINESS.md`、アクセシビリティ監査は `ACCESSIBILITY_AUDIT.md`、事業モデルは `SUSTAINABILITY_MODEL.md` を参照してください。
