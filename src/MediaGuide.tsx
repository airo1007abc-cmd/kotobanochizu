import { Breadcrumbs } from "./Breadcrumbs";
import { NotFound } from "./NotFound";
import { Link, useParams } from "react-router-dom";
import guideData from "./data/media-guides.json";
import { repository } from "./repository";

const guides = guideData;

export function MediaGuide() {
  const { slug } = useParams();
  const guide = guides.find((item) => item.slug === slug);
  if (!guide) return <NotFound />;
  const related = guide.relatedDialectIds
    .map((id) => repository.dialect(id))
    .filter((item) => item !== undefined);

  return (
    <article className="region-guide-page media-guide-page">
      <Breadcrumbs />
      <header className="page-head region-guide-head">
        <span className="eyebrow">WORKS &amp; REGIONAL WORDS</span>
        <h1>{guide.title.replace(/｜.+$/, "")}</h1>
        <p>{guide.description}</p>
      </header>
      <section className="guide-introduction">
        <h2>短い答え</h2>
        <p>{guide.answer}</p>
      </section>
      <section>
        <h2>作品で確認できること</h2>
        <p>{guide.workEvidence}</p>
      </section>
      <section>
        <h2>五島の資料で確認できること</h2>
        <p>{guide.regionEvidence}</p>
      </section>
      <section>
        <h2>混同しやすい点</h2>
        <p>{guide.caution}</p>
      </section>
      <section>
        <h2>五島列島の別のことば</h2>
        <p>{guide.relatedNote}</p>
        <ul>
          {related.map((item) => (
            <li key={item.id}>
              <Link to={`/dialects/${item.id}`}>
                {item.phrase} — {item.standardJapanese}（{item.municipality}）
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <aside className="guide-source">
        <h2>確認した資料</h2>
        <ul>
          {guide.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.label}
              </a>
              ：{source.scope}
            </li>
          ))}
        </ul>
        <small>最終確認日：{guide.sourceCheckedAt}</small>
      </aside>
    </article>
  );
}
