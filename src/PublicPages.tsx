import {
  BookOpenCheck,
  Building2,
  Database,
  Ear,
  Globe2,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { repository } from "./repository";

const reviewed = repository
  .dialects()
  .filter((item) =>
    [
      "verified",
      "reference_confirmed",
      "community_confirmed",
      "reviewed",
    ].includes(item.verificationStatus),
  ).length;

export function EditorialPolicy() {
  return (
    <section className="prose-page">
      <div className="page-head">
        <span className="eyebrow">TRUST &amp; EDITORIAL</span>
        <h1>ことばを断定せず、確かめながら残す。</h1>
        <p>
          「ことばの地図」は、方言を県の正解として並べる辞典ではありません。土地、世代、家庭、話す相手によって変わる使用例を、根拠と確認状態とともに記録する文化アーカイブです。
        </p>
      </div>
      <div className="principle-grid">
        <article>
          <ShieldCheck />
          <h2>確認状態を隠さない</h2>
          <p>
            文献確認、地域話者による確認、投稿候補、デモを区別して表示します。未確認情報を監修済みの事実として扱いません。
          </p>
        </article>
        <article>
          <Database />
          <h2>出典と履歴を残す</h2>
          <p>
            資料名、機関、URL、確認日、収録年、更新履歴を保存できるデータ設計を採用しています。
          </p>
        </article>
        <article>
          <Ear />
          <h2>話者の権利を優先する</h2>
          <p>
            声や映像は、収録と公開、二次利用の範囲を本人が理解し同意した素材だけを掲載します。
          </p>
        </article>
      </div>
      <div className="editorial-status">
        <div>
          <strong>{repository.dialects().length}</strong>
          <span>掲載中の使用例</span>
        </div>
        <div>
          <strong>{reviewed}</strong>
          <span>確認済みとして公開可能</span>
        </div>
        <div>
          <strong>{repository.prefectures().length}</strong>
          <span>都道府県カバレッジ</span>
        </div>
      </div>
      <div className="policy-copy">
        <h2>公開までの流れ</h2>
        <ol>
          <li>
            <b>受け取る</b>
            <span>投稿を一つの記憶・使用例として受け取ります。</span>
          </li>
          <li>
            <b>確かめる</b>
            <span>
              地域、世代、意味、用例、権利、重複を編集者が確認します。
            </span>
          </li>
          <li>
            <b>照らし合わせる</b>
            <span>
              可能な限り文献または複数の地域話者による確認を行います。
            </span>
          </li>
          <li>
            <b>状態つきで公開する</b>
            <span>確度と根拠を表示し、訂正可能な記録として公開します。</span>
          </li>
        </ol>
        <h2>現在地について</h2>
        <p>
          現在の収録内容は体験設計を検証するデモおよび確認待ち候補です。確認済み件数が0件であることも含め、現状を公開しています。件数のために出典や話者を作ることはありません。
        </p>
        <div className="notice">
          誤り、地域差、表現への懸念を見つけた場合の訂正・削除窓口は、本番運営者情報の確定後に常設します。
        </div>
      </div>
    </section>
  );
}

export function ForOrganizations() {
  return (
    <section className="prose-page">
      <div className="page-head partnership-head">
        <span className="eyebrow">FOR CULTURE, EDUCATION &amp; RESEARCH</span>
        <h1>地域の声を、次の世代へ。</h1>
        <p>
          自治体、学校、大学、博物館、図書館、地域団体とともに、記録・教育・展示に耐える地域言語アーカイブを育てます。
        </p>
      </div>
      <div className="principle-grid">
        <article>
          <Building2 />
          <h2>自治体・文化施設</h2>
          <p>
            住民参加型の収録、地域特集、展示用コンテンツ、観光音声ガイドの企画基盤を提供します。
          </p>
        </article>
        <article>
          <BookOpenCheck />
          <h2>学校・大学</h2>
          <p>
            授業教材、地域探究、聞き取り調査、研究用エクスポートを、権利条件に合わせて設計します。
          </p>
        </article>
        <article>
          <Globe2 />
          <h2>世界への発信</h2>
          <p>
            日本語学習者向けの音声、ローマ字、直訳、文化的ニュアンスを段階的に多言語化します。
          </p>
        </article>
      </div>
      <div className="partnership-cta">
        <div>
          <small>準備中の連携メニュー</small>
          <h2>共同収録・教材・展示・データ提供</h2>
          <p>
            公開前のため申込受付はまだ行いません。運営主体と連絡窓口の確定後、条件と費用を透明に掲載します。
          </p>
        </div>
        <Link className="button secondary" to="/editorial-policy">
          編集方針を見る
        </Link>
      </div>
    </section>
  );
}
