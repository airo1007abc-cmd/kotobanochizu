import { Link } from "react-router-dom";
import { siteConfig } from "./siteConfig";

export function Privacy() {
  return (
    <section className="prose-page legal-page">
      <div className="page-head">
        <span className="eyebrow">PRIVACY</span>
        <h1>プライバシーについて</h1>
        <p>
          公開前のデモ版で扱う情報と、今後の本番運営で必要になる保護方針を明示します。
        </p>
      </div>
      <div className="policy-copy">
        <div className="review-notice">
          <b>現在は公開受付前です</b>
          <p>
            投稿はサーバーへ送信されず、このブラウザの端末内ストレージだけに保存されます。
          </p>
        </div>
        <h2>現在、端末内に保存する情報</h2>
        <p>
          お気に入り、リアクション、最近見たことば、デモ投稿内容をLocalStorageへ保存します。アカウント、氏名、メールアドレス、位置情報をサーバーで収集していません。
        </p>
        <h2>音声・映像について</h2>
        <p>
          本番公開では、収録への同意と公開への同意を分け、公開範囲、二次利用、撤回方法を記録します。未成年者の記録は保護者同意を含む別の手続きを設けます。
        </p>
        <h2>本番公開前に確定する事項</h2>
        <p>
          運営者情報、問い合わせ先、利用するホスティング・解析・認証事業者、保存期間、削除請求、国外移転、Cookie管理を確定し、このページを正式なプライバシーポリシーへ更新します。
        </p>
        <h2>現在の表示情報</h2>
        <p>
          運営主体：{siteConfig.operatorName ?? "未確定（環境変数で公開時に設定）"}
          <br />
          問い合わせ先：
          {siteConfig.supportEmail ? (
            <a href={`mailto:${siteConfig.supportEmail}`}>
              {siteConfig.supportEmail}
            </a>
          ) : (
            "未開設（このプレビューから運営者への送信はできません）"
          )}
        </p>
        <p>
          <Link to="/editorial-policy">編集方針と確認プロセスを見る →</Link>
        </p>
      </div>
    </section>
  );
}

export function Terms() {
  return (
    <section className="prose-page legal-page">
      <div className="page-head">
        <span className="eyebrow">TERMS &amp; RIGHTS</span>
        <h1>利用・投稿・権利について</h1>
        <p>地域文化を尊重し、話者と投稿者の権利を守るための公開前方針です。</p>
      </div>
      <div className="policy-copy">
        <h2>掲載内容の性質</h2>
        <p>
          方言は地域、世代、家庭、関係性によって変わります。掲載例は、その地域の全員が使用することや唯一の正解を示すものではありません。
        </p>
        <h2>投稿</h2>
        <p>
          投稿者自身が提供できる内容だけを受け付けます。第三者の音声、顔、文章、個人情報を、本人の許可なく投稿することはできません。投稿は審査後も必ず公開されるとは限りません。
        </p>
        <h2>訂正と削除</h2>
        <p>
          誤り、差別的な文脈、権利侵害、同意撤回の申出を優先して確認します。現在は
          <Link to="/corrections">端末内デモ受付</Link>
          を確認でき、本番公開時には運営者へ届く常設窓口と対応期限を掲載します。
        </p>
        <h2>二次利用</h2>
        <p>
          サイトの文章・音声・画像・データを一括して自由利用できるものとはしません。素材ごとの権利者、同意範囲、ライセンスを表示できる仕組みを整えた上で正式条件を定めます。
        </p>
        <div className="notice">
          正式な利用規約は、運営主体・準拠法・連絡先・サービス仕様の確定と法務確認後に発効します。
        </div>
      </div>
    </section>
  );
}
