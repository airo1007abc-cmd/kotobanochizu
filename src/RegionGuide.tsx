import { ArrowRight, BookOpen, MapPin } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import guideData from "./data/region-guides.json";
import { repository } from "./repository";

type RegionGuideRecord = {
  id: string;
  slug: string;
  prefectureName: string;
  regionLabel: string;
  title: string;
  description: string;
  searchIntent: string;
  introduction: string;
  selector:
    | { municipalityPrefix: string }
    | { prefectureWide: true }
    | { dialectIds: string[]; requireMultipleMunicipalities?: boolean };
  sourceTitle: string;
  sourceOrganization: string;
  sourceUrl: string;
  sourceCheckedAt: string;
  indexStatus: "indexable" | "review_required" | "noindex";
};

const guides = guideData as RegionGuideRecord[];
const confirmedStatuses = new Set(["verified", "reference_confirmed", "community_confirmed"]);

export function RegionGuide() {
  const { slug } = useParams();
  const guide = guides.find((item) => item.slug === slug);
  if (!guide) return <Navigate to="/prefectures" replace />;
  const prefectureId = repository
    .prefectures()
    .find((item) => item.name === guide.prefectureName)?.id;
  const dialects = repository
    .dialects()
    .filter(
      (item) =>
        item.prefectureId === prefectureId &&
        (("dialectIds" in guide.selector && guide.selector.dialectIds.includes(item.id)) ||
          "prefectureWide" in guide.selector ||
          ("municipalityPrefix" in guide.selector &&
            item.municipality?.startsWith(guide.selector.municipalityPrefix))) &&
        confirmedStatuses.has(item.verificationStatus),
    );

  return (
    <article className="region-guide-page">
      <nav className="breadcrumbs" aria-label="パンくず">
        <Link to="/">ホーム</Link><span>/</span>
        <Link to="/prefectures">地域から探す</Link><span>/</span>
        <span>{guide.regionLabel}</span>
      </nav>
      <header className="page-head region-guide-head">
        <span className="eyebrow">REGIONAL LANGUAGE ARCHIVE</span>
        <h1>{guide.title.replace(/｜.+$/, "")}</h1>
        <p>{guide.description}</p>
        <div className="guide-facts">
          <span><MapPin />{guide.prefectureName}・{guide.regionLabel}</span>
          <span><BookOpen />根拠確認済み {dialects.length}語</span>
        </div>
      </header>
      <section className="guide-introduction">
        <h2>この地域のことばを読む前に</h2>
        <p>{guide.introduction}</p>
      </section>
      <section>
        <h2>確認済みのことば</h2>
        <div className="guide-dialect-grid">
          {dialects.map((item) => (
            <Link to={`/dialects/${item.id}`} key={item.id}>
              <small>{item.usageContexts.slice(0, 2).join("・")}</small>
              <strong>{item.phrase}</strong>
              <span>{item.standardJapanese}</span>
              <p>{item.description}</p>
              <ArrowRight />
            </Link>
          ))}
        </div>
      </section>
      <aside className="guide-source">
        <h2>主な資料</h2>
        <p>{guide.sourceOrganization}「{guide.sourceTitle}」</p>
        <a href={guide.sourceUrl} target="_blank" rel="noreferrer">資料を確認する</a>
        <small>最終確認日：{guide.sourceCheckedAt}</small>
      </aside>
    </article>
  );
}
