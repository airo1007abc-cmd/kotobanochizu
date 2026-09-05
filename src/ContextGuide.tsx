import { ArrowRight, MessageCircle } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import contextData from "./data/context-guides.json";
import { repository } from "./repository";
import type { Dialect } from "./domain";

type ContextRecord = {
  id: string; slug: string; format: string; title: string; description: string;
  searchIntent: string; introduction: string; dialectIds: string[];
  sourceTitle: string; sourceOrganization: string; sourceUrl: string;
  sourceCheckedAt: string; indexStatus: "indexable" | "review_required" | "noindex";
};
const records = contextData as ContextRecord[];

export function ContextGuide() {
  const { slug } = useParams();
  const record = records.find((item) => item.slug === slug);
  if (!record) return <Navigate to="/conversations" replace />;
  const dialects = record.dialectIds.map((id) => repository.dialect(id)).filter((item): item is Dialect => Boolean(item));
  return <article className="region-guide-page context-guide-page">
    <nav className="breadcrumbs" aria-label="パンくず"><Link to="/">ホーム</Link><span>/</span><Link to="/conversations">地域の会話</Link><span>/</span><span>{record.format}</span></nav>
    <header className="page-head region-guide-head"><span className="eyebrow">DOCUMENTED UTTERANCES</span><h1>{record.title.replace(/｜.+$/, "")}</h1><p>{record.description}</p><div className="guide-facts"><span><MessageCircle />{record.format}</span><span>出典確認済み {dialects.length}例</span></div></header>
    <section className="guide-introduction"><h2>創作会話ではありません</h2><p>{record.introduction}</p></section>
    <section><h2>発話と標準語訳</h2><div className="utterance-list">{dialects.map((item, index) => <article key={item.id}><small>{String(index + 1).padStart(2,"0")} / {item.usageContexts.join("・")}</small><blockquote>{item.exampleDialect}</blockquote><p>{item.exampleStandard}</p><Link to={`/dialects/${item.id}`}><strong>{item.phrase}</strong>の意味・地域・出典を確認する<ArrowRight /></Link></article>)}</div></section>
    <aside className="guide-source"><h2>根拠資料</h2><p>{record.sourceOrganization}「{record.sourceTitle}」</p><a href={record.sourceUrl} target="_blank" rel="noreferrer">資料を確認する</a><small>最終確認日：{record.sourceCheckedAt}</small></aside>
  </article>;
}
