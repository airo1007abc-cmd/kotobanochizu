import { useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, Home, MapPin, Search, Send } from "lucide-react";
import { Link } from "react-router-dom";
import type { PrefectureDetailViewModel } from "./prefectureDetailViewModel";
import { prefectureMapLabels } from "./JapanPrefectureMap";
import { RegionalCultureSection } from "./RegionalCultureSection";

export function PrefectureLocatorMap({ prefectureName }: { prefectureName: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let disposed = false;
    fetch("/japan-prefectures.svg").then((response) => response.text()).then((markup) => {
      if (disposed || !mapRef.current) return;
      mapRef.current.innerHTML = markup;
      const svg = mapRef.current.querySelector("svg");
      if (!svg) return;
      svg.removeAttribute("width");
      svg.removeAttribute("height");
      svg.setAttribute("aria-label", `日本地図における${prefectureName}の位置`);
      const label = Object.entries(prefectureMapLabels).find(([, name]) => name === prefectureName)?.[0];
      const selected = label ? svg.querySelector(`[inkscape\\:label="${label}"]`) : null;
      selected?.classList.add("is-current-prefecture");
      setReady(true);
    });
    return () => { disposed = true; };
  }, [prefectureName]);
  return <div className={`prefecture-v2-map ${ready ? "is-ready" : ""}`} ref={mapRef} aria-busy={!ready} />;
}

export function PrefectureDetailV2({ vm }: { vm: PrefectureDetailViewModel }) {
  return (
    <article className="prefecture-v2" data-prefecture-detail-version={import.meta.env.DEV ? "v2" : undefined}>
      <nav className="prefecture-v2-breadcrumb" aria-label="パンくず">
        <Link to="/"><Home aria-hidden="true" />ホーム</Link><span>/</span>
        <Link to="/prefectures">地域を探す</Link><span>/</span><span>{vm.name}</span>
      </nav>

      <header className="prefecture-v2-hero">
        <div>
          <span className="eyebrow">{vm.area}・地域言語アーカイブ</span>
          <h1>{vm.name}の方言</h1>
          <p>{vm.summary} 県内の地域と記録されたことばから、確認状態を見ながら探索できます。</p>
          <div className="prefecture-v2-stats" aria-label={`${vm.name}の収録状況`}>
            <div><strong>{vm.totalDialectCount}</strong><span>収録語</span></div>
            <div><strong>{vm.regionCount}</strong><span>地域区分</span></div>
            <div><strong>{vm.confirmedCount}</strong><span>参照確認</span></div>
            <div><strong>{vm.sourcedCount}</strong><span>出典あり</span></div>
          </div>
          {vm.languageVarieties.length > 0 && <p className="prefecture-v2-varieties">収録データの言語区分：{vm.languageVarieties.map((item) => item.label).join("、")}</p>}
        </div>
        <div className="prefecture-v2-locator">
          <PrefectureLocatorMap prefectureName={vm.name} />
          <p><MapPin aria-hidden="true" />日本地図で見る{vm.name}の位置</p>
          <small>県内の地域境界は、現在のデータから正確に描けないため表示していません。</small>
        </div>
      </header>

      {vm.hasRegions && <section className="prefecture-v2-regions" aria-labelledby="prefecture-regions-title">
        <div className="prefecture-v2-section-head">
          <div><span className="eyebrow">土地からたどる</span><h2 id="prefecture-regions-title">県内地域から探す</h2></div>
          <p>現在のアーカイブで使用している地域区分です。言語学的な境界を新しく設定するものではありません。</p>
        </div>
        <div className={`prefecture-v2-region-list ${vm.regions.length > 4 ? "is-many" : ""}`}>
          {vm.regions.map((region, index) => (
            <Link to={`/regions/${region.id}`} key={region.id}>
              <span className="prefecture-v2-region-number">{String(index + 1).padStart(2, "0")}</span>
              <span><small>{region.dialectCount}語を収録・{region.confirmedCount}語を参照確認</small><strong>{region.name}</strong><em>{region.description}</em></span>
              <ArrowRight aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>}

      {vm.hasFeaturedWords && <section className="prefecture-v2-featured" aria-labelledby="prefecture-featured-title">
        <div className="prefecture-v2-section-head compact">
          <div><span className="eyebrow">記録の入口</span><h2 id="prefecture-featured-title">{vm.name}のことばから一部を紹介</h2></div>
          <Link to={vm.searchTarget}>すべてのことばを見る <ArrowRight aria-hidden="true" /></Link>
        </div>
        <div className="prefecture-v2-word-grid">
          {vm.featuredDialects.map((dialect) => (
            <Link to={`/dialects/${dialect.id}`} key={dialect.id}>
              <div><span>{dialect.regionName}</span><small><CheckCircle2 aria-hidden="true" />{dialect.verificationLabel}</small></div>
              <h3>{dialect.word}</h3>
              {dialect.reading && dialect.reading !== dialect.word && <p className="prefecture-v2-reading">［{dialect.reading}］</p>}
              <p>{dialect.meaning}</p><ArrowRight aria-hidden="true" />
            </Link>
          ))}
        </div>
        <Link className="prefecture-v2-all-link" to={vm.searchTarget}><Search aria-hidden="true" /><span><strong>{vm.name}のことばをすべて見る</strong><small>{vm.totalDialectCount}語から、読み・意味・確認状態で絞り込めます</small></span><ArrowRight aria-hidden="true" /></Link>
      </section>}

      <RegionalCultureSection title={`${vm.name}のことばと文化`} items={vm.cultureItems} />

      <section className="prefecture-v2-archive" aria-labelledby="saga-archive-title">
        <BookOpen aria-hidden="true" />
        <div><span className="eyebrow">ARCHIVE STATUS</span><h2 id="saga-archive-title">この地域のことばを記録・確認しています</h2><p>{vm.hasSourceInformation ? `${vm.sourcedCount}語に出典情報があり、` : "現在、出典情報を確認中です。"}{vm.confirmedCount}語は参照資料を確認しています。残る{vm.needsReviewCount}語も、確認状態を明示して継続調査します。</p></div>
        <Link to="/submit">情報を送る <Send aria-hidden="true" /></Link>
      </section>
    </article>
  );
}
