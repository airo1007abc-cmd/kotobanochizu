import { Link } from "react-router-dom";
import { repository } from "./repository";
import guides from "./data/region-guides.json";
import cultures from "./data/culture-guides.json";
import stories from "./data/context-guides.json";

export function ArchiveLinks({
  prefectureId,
  regionId,
}: {
  prefectureId: string;
  regionId?: string;
}) {
  const words = repository.dialects({ prefectureId, regionId });
  const name = repository
    .prefectures()
    .find((p) => p.id === prefectureId)?.name;
  const ids = new Set(words.map((d) => d.id));
  const links = regionId
    ? []
    : [
        ...guides
          .filter((g) => g.prefectureName === name)
          .map((g) => ({ path: `/guides/regions/${g.slug}`, title: g.title })),
        ...cultures
          .filter((g) => g.dialectIds.some((id) => ids.has(id)))
          .map((g) => ({ path: `/guides/culture/${g.slug}`, title: g.title })),
        ...stories
          .filter((g) => g.dialectIds.some((id) => ids.has(id)))
          .map((g) => ({ path: `/stories/${g.slug}`, title: g.title })),
      ];
  return (
    <section className="archive-links">
      <h2>収録記録と資料からたどる</h2>
      {regionId && words.length > 0 && (
        <details>
          <summary>この閲覧地域に収録した{words.length}語</summary>
          <ul>
            {words.map((d) => (
              <li key={d.id}>
                <Link to={`/dialects/${d.id}`}>
                  {d.phrase} — {d.standardJapanese}
                </Link>
                {d.municipality && <small>（{d.municipality}）</small>}
              </li>
            ))}
          </ul>
        </details>
      )}
      {links.length > 0 && (
        <details>
          <summary>関連する資料別・テーマ別記事（{links.length}件）</summary>
          <ul>
            {links.map((l) => (
              <li key={l.path}>
                <Link to={l.path}>{l.title}</Link>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
