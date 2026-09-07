import { Link, useLocation } from "react-router-dom";
import { getPageMetadata } from "./seo";

export function Breadcrumbs() {
  const { pathname } = useLocation();
  const crumbs = getPageMetadata(pathname).breadcrumbs;
  return (
    <nav className="breadcrumbs v2-breadcrumb" aria-label="パンくず">
      {crumbs.map((c, i) => (
        <span key={c.path}>
          {i > 0 && <span aria-hidden="true"> / </span>}
          {i === crumbs.length - 1 ? (
            <span aria-current="page">{c.name}</span>
          ) : (
            <Link to={c.path}>{c.name}</Link>
          )}
        </span>
      ))}
    </nav>
  );
}
