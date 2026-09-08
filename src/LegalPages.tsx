import { Link } from "react-router-dom";
import { siteConfig } from "./siteConfig";

export function Privacy() {
  return (
    <section className="prose-page legal-page">
      <div className="page-head">
        <span className="eyebrow">PRIVACY</span>
        <h1>プライバシーについて</h1>
        <p>
          このサイトで現在扱う情報と、端末への保存について説明します。
        </p>
      </div>
      <div className="policy-copy">
        <div className="review-notice">
          <b>メモは端末内にのみ保存します</b>
          <p>
            メモはサーバーへ送信されず、このブラウザの端末内ストレージだけに保存されます。
          </p>
        </div>
        <h2>現在、端末内に保存する情報</h2>
        <p>
          お気に入り、リアクション、最近見たことば、ことばのメモをブラウザの保存領域へ保存します。メモ機能を通じて、アカウント、氏名、メールアドレス、位置情報を当サイトのサーバーへ送信することはありません。
        </p>
        <h2>アクセス解析</h2>
        <p>
          サイトの利用状況を把握し、内容と使いやすさを改善するためGoogle Analytics 4を利用しています。Google AnalyticsはCookie等を使用し、閲覧したページ、利用環境、参照元、おおよその地域などの利用情報を収集することがあります。当サイトでは氏名やメールアドレスをGoogle Analyticsへ送信しません。
        </p>
        <p>
          収集情報の取り扱いは
          <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">
            Googleプライバシーポリシー
          </a>
          および
          <a href="https://support.google.com/analytics/answer/6004245" target="_blank" rel="noreferrer">
            Google Analyticsのデータ保護に関する案内
          </a>
          をご確認ください。計測を望まない場合は、ブラウザのCookie設定または
          <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noreferrer">
            Google Analyticsオプトアウトアドオン
          </a>
          を利用できます。
        </p>
        <h2>音声・映像について</h2>
        <p>
          音声・映像を掲載する場合は、収録への同意と公開への同意を分け、公開範囲、二次利用、撤回方法を記録します。未成年者の記録は保護者同意を含む別の手続きを設けます。
        </p>
        <h2>機能を追加する場合</h2>
        <p>
          サーバーへの投稿受付や音声・映像の収集を始める際は、利用目的・保存期間・連絡方法をこのページで案内します。
        </p>
        <h2>現在の表示情報</h2>
        <p>
          運営主体：{siteConfig.operatorName ?? "現在は名称を掲載していません"}
          <br />
          問い合わせ先：
          {siteConfig.supportEmail ? (
            <a href={`mailto:${siteConfig.supportEmail}`}>
              {siteConfig.supportEmail}
            </a>
          ) : (
            "現在はサイトから運営者への送信に対応していません"
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
        <h1>利用と権利について</h1>
        <p>掲載記録の扱いと、利用にあたっての案内です。</p>
      </div>
      <div className="policy-copy">
        <h2>掲載内容の性質</h2>
        <p>
          方言は地域、世代、家庭、関係性によって変わります。掲載例は、その地域の全員が使用することや唯一の正解を示すものではありません。
        </p>
        <h2>投稿</h2>
        <p>
          現在のメモ機能は端末内にのみ保存し、サイトへの投稿受付は行いません。第三者の音声、顔、文章、個人情報を、本人の許可なく投稿することはできません。メモが自動的に公開されることはありません。
        </p>
        <h2>訂正と削除</h2>
        <p>
          連絡方法と現在の受付状況は
          <Link to="/corrections">訂正・問い合わせについて</Link>
          をご覧ください。端末にメモを保存しても運営者には届きません。
        </p>
        <h2>二次利用</h2>
        <p>
          サイトの文章・音声・画像・データを一括して自由利用できるものとはしません。素材ごとの権利者、同意範囲、ライセンスを表示できる仕組みを整えた上で正式条件を定めます。
        </p>
        <div className="notice">
          資料の利用条件は、出典となる各機関の案内も確認してください。
        </div>
      </div>
    </section>
  );
}
