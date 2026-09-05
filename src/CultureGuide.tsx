import { ArrowRight, BookOpen, Layers3 } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import cultureData from "./data/culture-guides.json";
import { repository } from "./repository";
import type { Dialect } from "./domain";

type CultureGuideRecord = {
  id: string; slug: string; category: string; title: string; description: string;
  searchIntent: string; introduction: string; dialectIds: string[];
  sourceTitle: string; sourceOrganization: string; sourceUrl: string;
  sourceCheckedAt: string; indexStatus: "indexable" | "review_required" | "noindex";
};
const guides = cultureData as CultureGuideRecord[];

export function CultureGuide() {
  const { slug } = useParams();
  const guide = guides.find((item) => item.slug === slug);
  if (!guide) return <Navigate to="/" replace />;
  const dialects = guide.dialectIds.map((id) => repository.dialect(id)).filter((item): item is Dialect => Boolean(item));
  return (
    <article className="region-guide-page culture-guide-page">
      <nav className="breadcrumbs" aria-label="パンくず"><Link to="/">ホーム</Link><span>/</span><span>文化・歴史</span><span>/</span><span>{guide.category}</span></nav>
      <header className="page-head region-guide-head">
        <span className="eyebrow">LANGUAGE &amp; CULTURE</span>
        <h1>{guide.title.replace(/｜.+$/, "")}</h1>
        <p>{guide.description}</p>
        <div className="guide-facts"><span><Layers3 />{guide.category}</span><span><BookOpen />確認済み {dialects.length}語</span></div>
      </header>
      <section className="guide-introduction"><h2>このテーマの見方</h2><p>{guide.introduction}</p></section>
      <section><h2>ことばから文化をたどる</h2><div className="guide-dialect-grid">
        {dialects.map((item) => <Link to={`/dialects/${item.id}`} key={item.id}><small>{item.usageContexts.join("・")}</small><strong>{item.phrase}</strong><span>{item.standardJapanese}</span><p>{item.description}</p><ArrowRight /></Link>)}
      </div></section>
      <aside className="guide-source"><h2>根拠資料</h2><p>{guide.sourceOrganization}「{guide.sourceTitle}」</p><a href={guide.sourceUrl} target="_blank" rel="noreferrer">資料を確認する</a><small>最終確認日：{guide.sourceCheckedAt}</small></aside>
    </article>
  );
}
