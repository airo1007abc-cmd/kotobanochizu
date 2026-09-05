import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Feather,
  Heart,
  Home,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Volume2,
} from "lucide-react";
import type { Dialect } from "./domain";
import { hasPublishableAudio } from "./domain";
import { createDialectDetailViewModel } from "./dialectDetailViewModel";
import { prefectureMapLabels } from "./JapanPrefectureMap";
import { repository } from "./repository";
import { favorites, reactionStore } from "./storage";

const prefectureName = (id: string) => repository.prefectures().find((item) => item.id === id)?.name ?? "地域確認中";
const regionName = (id: string) => repository.regions().find((item) => item.id === id)?.name ?? "地域確認中";

function ArchiveRegionMap({ prefecture }: { prefecture: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let active = true;
    let frame = 0;
    fetch("/japan-prefectures.svg").then((response) => response.text()).then((markup) => {
      if (!active || !ref.current) return;
      ref.current.innerHTML = markup;
      const svg = ref.current.querySelector("svg");
      if (!svg) return;
      svg.removeAttribute("width");
      svg.removeAttribute("height");
      svg.setAttribute("aria-label", `日本地図上の${prefecture}の位置`);
      svg.querySelectorAll("g[inkscape\\:label] path").forEach((path) => path.classList.add("v2-map-prefecture"));
      const mapLabel = Object.entries(prefectureMapLabels).find(([, name]) => name === prefecture)?.[0];
      svg.setAttribute("viewBox", "0 0 1536.8191 1750.5018");
      const focus = mapLabel ? svg.querySelector<SVGGraphicsElement>(`[inkscape\\:label="${mapLabel}"]`) : null;
      if (focus) {
        focus.style.display = "inline";
        focus.classList.add("v2-map-focus");
        frame = requestAnimationFrame(() => {
          if (!active) return;
          const svgRect = svg.getBoundingClientRect();
          const focusRect = focus.getBoundingClientRect();
          const scale = Math.min(svgRect.width / 1536.8191, svgRect.height / 1750.5018);
          if (!scale || !focusRect.width || !focusRect.height) return;
          const offsetX = (svgRect.width - 1536.8191 * scale) / 2;
          const offsetY = (svgRect.height - 1750.5018 * scale) / 2;
          const x = (focusRect.left - svgRect.left - offsetX) / scale;
          const y = (focusRect.top - svgRect.top - offsetY) / scale;
          const width = focusRect.width / scale;
          const height = focusRect.height / scale;
          const padding = Math.max(width, height, 55) * 1.15;
          svg.setAttribute("viewBox", `${x - padding} ${y - padding} ${width + padding * 2} ${height + padding * 2}`);
        });
      }
    });
    return () => { active = false; cancelAnimationFrame(frame); };
  }, [prefecture]);
  return <div className="v2-region-map" ref={ref} aria-label={`${prefecture}の位置を示す地図`} />;
}

function RelatedCard({ item, reason }: { item: Dialect; reason: string }) {
  return (
    <Link className="v2-related-card" to={`/dialects/${item.id}`}>
      <span>{reason}</span>
      <h3>{item.phrase}</h3>
      <strong>{item.standardJapanese}</strong>
      <p>{item.description}</p>
      <small><MapPin /> {prefectureName(item.prefectureId)}・{regionName(item.regionId)}</small>
    </Link>
  );
}

export function DialectDetailV2({ dialect: d }: { dialect: Dialect }) {
  const [, refresh] = useState(0);
  const vm = useMemo(() => createDialectDetailViewModel(d, { prefectureName, regionName }), [d]);
  const favorite = favorites.has(vm.id);
  const reaction = reactionStore.get(vm.id);
  const pref = vm.prefecture.name;
  const region = vm.primaryRegion.name;
  const related = useMemo(() => {
    const all = repository.dialects().filter((item) => item.id !== d.id);
    const sameRegion = all.filter((item) => item.regionId === d.regionId).slice(0, 3).map((item) => ({ item, reason: "同じ地域" }));
    const picked = new Set(sameRegion.map(({ item }) => item.id));
    const sameMeaning = all.filter((item) => !picked.has(item.id) && item.standardJapanese === d.standardJapanese).slice(0, 4 - sameRegion.length).map((item) => ({ item, reason: "意味が近い" }));
    return [...sameRegion, ...sameMeaning];
  }, [d]);

  return (
    <article
      className="dialect-v2"
      data-dialect-detail-version={import.meta.env.DEV ? "v2" : undefined}
    >
      <nav className="v2-breadcrumb" aria-label="パンくず">
        <Link to="/"><Home />ホーム</Link><span>›</span><Link to="/search">ことばを探す</Link><span>›</span>
        <Link to={`/prefectures/${vm.prefecture.id}`}>{pref}</Link><span>›</span><span>{vm.word}</span>
      </nav>

      <header className="v2-hero">
        <div className="v2-word">
          <span className="v2-pref-label">{pref}のことば</span>
          <div className="v2-word-title">
            <h1 className={vm.word.length >= 14 ? "is-very-long" : vm.word.length >= 8 ? "is-long" : ""}>{vm.word}</h1>
            {hasPublishableAudio(d) ? <audio controls preload="none" src={d.audioUrl} /> : <span className="v2-audio-pending" title="音声は準備中です"><Volume2 />音声準備中</span>}
          </div>
          <p className="v2-reading">［{vm.reading ?? "読み確認中"}］</p>
          <p className="v2-translation">{vm.meanings[0] ?? "意味確認中"}</p>
          <div className="v2-chips">
            <Link to={`/prefectures/${vm.prefecture.id}`}><MapPin />{pref}</Link>
            <Link to={`/regions/${vm.primaryRegion.id}`}>{region}</Link>
            {vm.locationBadges.slice(0, 4).map((location) => <span key={location}>{location}</span>)}
            {vm.locationBadges.length > 4 && <span>ほか{vm.locationBadges.length - 4}地点</span>}
            <span className="is-review"><ShieldCheck />{vm.verificationLabel}</span>
          </div>
        </div>
        <aside className="v2-summary-card">
          <dl>
            <div><dt>使用地域</dt><dd>{vm.locationSummary}</dd></div>
            <div><dt>意味</dt><dd>{vm.meanings[0] ?? "確認中"}</dd></div>
            <div><dt>確認状況</dt><dd>{vm.verificationLabel}</dd></div>
            {vm.updatedAt && <div><dt>最終更新</dt><dd>{vm.updatedAt}</dd></div>}
          </dl>
          <button className="v2-favorite" onClick={() => { favorites.toggle(vm.id); refresh((value) => value + 1); }}>
            <Heart fill={favorite ? "currentColor" : "none"} />{favorite ? "お気に入りに保存済み" : "お気に入りに保存"}
          </button>
        </aside>
      </header>

      <div className="v2-content-grid">
        <div className="v2-primary-column">
          <section className="v2-content-card">
            <h2><BookOpen />意味</h2>
            <p className="v2-lead">標準語では「{vm.meanings[0] ?? "確認中"}」に当たる表現です。</p>
            {vm.description && <p>{vm.description}</p>}

            <div className="v2-section-block">
              <h2><MessageCircle />使い方・例文</h2>
              {vm.examples.length ? (
                <div className="v2-examples">{vm.examples.slice(0, 3).map((example, index) => <blockquote className="v2-example" key={`${example.dialect}-${index}`}><b>{example.dialect}</b><span>— {example.standard}</span></blockquote>)}{vm.examples.length > 3 && <small>ほか{vm.examples.length - 3}件の用例があります。</small>}</div>
              ) : (
                <div className="v2-empty"><b>用例は確認中です</b><span>出典で確認できる自然な会話例を収集中です。</span></div>
              )}
            </div>

            {vm.nuance && <div className="v2-section-block">
              <h2><Feather />ニュアンス</h2>
              <p>{vm.nuance}</p>
            </div>}

            <div className="v2-section-block v2-region-section">
              <div>
                <h2><MapPin />使われる地域</h2>
                <p>{vm.locationSummary}での記録です。県内全域への分布や地域差は資料確認中です。</p>
                <Link className="v2-outline-link" to={`/regions/${vm.primaryRegion.id}`}>地域のことば一覧を見る<ArrowRight /></Link>
              </div>
              <ArchiveRegionMap prefecture={pref} />
            </div>

            <section className="v2-section-block v2-source-card">
              <div className="v2-source-heading">
                <h2><BookOpen />出典・確認状況</h2>
                <span>{vm.isResearchPending ? "資料確認中" : vm.verificationLabel}</span>
              </div>
              <div className="v2-source-record">
                <span>出典{vm.sources.length > 1 ? `（${vm.sources.length}件）` : ""}</span>
                {vm.sources.length ? <div className="v2-source-list">{vm.sources.slice(0, 3).map((source, index) => <p key={`${source.url ?? source.title ?? "source"}-${index}`}>{source.url ? <a href={source.url} target="_blank" rel="noreferrer">{source.title ?? "出典資料"}<ArrowRight /></a> : source.title ?? "資料確認中"}{source.organization && <small>{source.organization}</small>}{source.recordingYear && <small>記録年：{source.recordingYear}年</small>}</p>)}</div> : <p>資料確認中</p>}
              </div>
              <div className="v2-verification-groups">
                <div><strong><ShieldCheck />確認済み</strong><p>{vm.verifiedItems.length ? vm.verifiedItems.join("・") : "確認範囲を整理中"}</p></div>
                {vm.pendingItems.length > 0 && <div><strong><Feather />調査中</strong><p>{vm.pendingItems.join("・")}</p></div>}
              </div>
              <Link className="v2-source-more" to="/editorial-policy">確認状態と編集方針を見る<ArrowRight /></Link>
            </section>

            <aside className="v2-source-cta">
              <div><strong>このことばについて情報をお持ちですか？</strong><span>地域での使い方や資料情報を募集しています。</span></div>
              <Link to={`/corrections?dialect=${encodeURIComponent(vm.id)}`}>情報を送る<ArrowRight /></Link>
            </aside>

            <section className="v2-reactions" aria-label="このことばを知っていますか">
              <h2>このことば、知っていますか？</h2>
              <div className="v2-reaction-options">
                {[["use", "使う"], ["heard", "聞いたことがある"], ["new", "初めて知った"]].map(([value, label]) => (
                  <button className={reaction === value ? "is-selected" : ""} key={value} onClick={() => { reactionStore.set(vm.id, value); refresh((count) => count + 1); }}>{label}</button>
                ))}
              </div>
            </section>
          </section>
        </div>
      </div>

      {related.length > 0 && (
        <section className="v2-related">
          <div className="v2-related-heading"><h2>関連することば</h2><Link to={`/prefectures/${d.prefectureId}`}>{pref}のことばをもっと見る<ArrowRight /></Link></div>
          <div className="v2-related-grid">{related.map(({ item, reason }) => <RelatedCard key={item.id} item={item} reason={reason} />)}</div>
        </section>
      )}

      <section className="v2-contribute">
        <span><Feather /></span><div><h2>方言の記録をみんなでつくる</h2><p>あなたの地域のことば、使い方、思い出をぜひ教えてください。</p></div>
        <Link className="button" to="/submit">ことばの情報を投稿する<ArrowRight /></Link>
      </section>
    </article>
  );
}
