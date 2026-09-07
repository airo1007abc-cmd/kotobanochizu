import { Link } from "react-router-dom";
export function NotFound() {
  return (
    <section className="page-head">
      <h1>ページが見つかりません</h1>
      <p>URLをご確認いただくか、地図や検索からことばを探してください。</p>
      <div className="actions">
        <Link className="button" to="/prefectures">
          地図から探す
        </Link>
        <Link className="button secondary" to="/search">
          ことばを検索する
        </Link>
      </div>
    </section>
  );
}
