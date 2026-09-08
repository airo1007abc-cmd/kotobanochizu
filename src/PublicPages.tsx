import {
  Database,
  Ear,
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
            文献確認、地域話者による確認、確認途中の候補、資料未確認の旧使用例を区別して表示します。未確認情報を監修済みの事実として扱いません。
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
          <span>資料・話者の確認記録あり</span>
        </div>
        <div>
          <strong>{repository.prefectures().length}</strong>
          <span>収録する都道府県</span>
        </div>
      </div>
      <div className="policy-copy">
        <h2>記録を確かめる手順</h2>
        <ol>
          <li>
            <b>受け取る</b>
            <span>収集した情報を一つの記憶・使用例として扱います。</span>
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
        <h2>確認状態の読み方</h2><p>「資料による確認あり」は文献などに確認の記録があること、「話者による確認あり」は地域話者の確認があることを表します。「資料を確認中」は裏付けの確認が完了していません。読みなどが未確認の場合は、推測で補いません。</p><h2>収録状況</h2>
        <p>
          現在{repository.dialects().length}語を収録し、{reviewed}語に参照・地域確認の状態を記録しています。確認済みの項目は各語の出典欄で示します。読み・例文・世代差など未確認の情報を補完せず、県や閲覧地域の全域へ使用範囲を広げません。
        </p>
        <div className="notice">
          確認済みという表示は、すべての項目や現在の使用範囲を保証するものではありません。各語の出典欄で「この資料で確認」の項目と注記をご覧ください。
        </div>
        <p><Link to="/corrections">訂正・問い合わせについて</Link></p><details className="archive-links"><summary>以前の使用例と機能について</summary><p><Link to="/conversations">会話例の掲載終了と発話資料</Link> · <Link to="/quiz">クイズの掲載終了</Link></p><p>初期の画面検証に使った記録です。根拠資料として扱わず、検索エンジンの対象外にしています。</p><ul>{repository.archivedDialects().filter(d=>!['d1','d2'].includes(d.id)).map(d=><li key={d.id}><Link to={`/dialects/${d.id}`}>{d.phrase} — {d.standardJapanese}（資料未確認）</Link></li>)}</ul></details>
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
      <div className="partnership-cta">
        <div>
          <small>資料の利用について</small>
          <h2>授業や地域の調べものに</h2>
          <p>
            出典リンクから発行元の資料をご確認ください。教材や展示などで資料を再利用する際は、発行元の利用条件に従ってください。現在、共同制作やデータ提供の申込受付は行っていません。
          </p>
        </div>
        <Link className="button secondary" to="/editorial-policy">
          編集方針を見る
        </Link>
      </div>
    </section>
  );
}
