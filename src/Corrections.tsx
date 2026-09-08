import { Link, useSearchParams } from "react-router-dom";
import { repository } from "./repository";
import { siteConfig } from "./siteConfig";

export function Corrections() {
  const [params] = useSearchParams();
  const dialect = repository.dialect(params.get("dialect") ?? "");
  const conversation = repository.conversation(params.get("conversation") ?? "");
  const title = dialect?.phrase ?? conversation?.title;
  return <section className="prose-page">
    <div className="page-head"><h1>訂正・問い合わせについて</h1><p>掲載内容の誤りや地域差、権利についての連絡方法をご案内します。</p></div>
    {title && <p>対象の記録：<strong>{title}</strong></p>}
    {siteConfig.supportEmail ? <><p>対象ページのURLと、確認してほしい箇所・根拠資料を添えて、次の連絡先へお知らせください。</p><a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a></> : <div className="notice"><p>現在、サイトから運営者への送信には対応していません。送信されない申請を受付済みと表示することを避けるため、申請フォームは設けていません。</p><p>記録の確認には、各ことばの出典と参照箇所をご利用ください。端末内のメモは運営者には届きません。</p></div>}
    <p><Link to="/editorial-policy">編集方針と確認状態を見る</Link></p><Link className="button" to="/search">ことばの記録を探す</Link>
  </section>;
}
