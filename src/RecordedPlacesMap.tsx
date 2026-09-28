import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { hasEvidenceScope } from "./evidencePolicy.mjs";
import { prefectureMapLabels } from "./JapanPrefectureMap";
import { repository } from "./repository";
import { createRecordedPlaceIndex } from "./recordedPlaces";

const index = createRecordedPlaceIndex(repository.dialects(), repository.prefectures());
const labelsByName = new Map(index.map((item) => [item.prefecture.name, item]));

function track(action: string, values: Record<string, string> = {}) {
  if (typeof window === "undefined") return;
  const analytics = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  analytics?.("event", action, values);
}

export function RecordedPlacesMap() {
  const [params, setParams] = useSearchParams();
  const selected = index.find((item) => item.prefecture.id === params.get("prefecture"));
  const place = selected?.places.find((item) => item.name === params.get("place"));
  const unspecified = selected && params.get("place") === "_unspecified" && selected.unspecified.length > 0;
  const records = place?.records ?? (unspecified ? selected!.unspecified : []);
  const mapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const [mapFailed, setMapFailed] = useState(false);

  useEffect(() => { track("map_open"); }, []);
  useEffect(() => {
    let active = true;
    const cleanups: Array<() => void> = [];
    fetch("/japan-prefectures.svg").then((response) => {
      if (!response.ok) throw new Error("Map unavailable");
      return response.text();
    }).then((markup) => {
      if (!active || !mapRef.current) return;
      mapRef.current.innerHTML = markup;
      const svg = mapRef.current.querySelector("svg");
      if (!svg) throw new Error("Map unavailable");
      svg.removeAttribute("width");
      svg.removeAttribute("height");
      svg.setAttribute("role", "group");
      svg.setAttribute("aria-label", "都道府県を選べる日本地図");
      for (const [svgLabel, name] of Object.entries(prefectureMapLabels)) {
        const group = svg.querySelector<SVGGraphicsElement>(`[inkscape\\:label="${svgLabel}"]`);
        const entry = labelsByName.get(name);
        if (!group || !entry) continue;
        group.style.display = "inline";
        group.classList.add("interactive-prefecture");
        group.setAttribute("role", "button");
        group.setAttribute("tabindex", "0");
        group.setAttribute("aria-label", `${name}：記録地点の確認があることば${entry.count}件。選択`);
        group.setAttribute("aria-controls", "recorded-map-panel");
        group.setAttribute("data-prefecture-id", entry.prefecture.id);
        const current = entry.prefecture.id === selected?.prefecture.id;
        group.classList.toggle("is-selected", current);
        group.setAttribute("aria-pressed", String(current));
        const choose = () => {
          setParams({ prefecture: entry.prefecture.id });
          track("map_prefecture_select", { prefecture: entry.prefecture.id });
          requestAnimationFrame(() => panelRef.current?.focus());
        };
        const keydown = (event: Event) => {
          if (["Enter", " "].includes((event as KeyboardEvent).key)) { event.preventDefault(); choose(); }
        };
        group.addEventListener("click", choose);
        group.addEventListener("keydown", keydown);
        cleanups.push(() => { group.removeEventListener("click", choose); group.removeEventListener("keydown", keydown); });
      }
    }).catch(() => { if (active) setMapFailed(true); });
    return () => { active = false; cleanups.forEach((cleanup) => cleanup()); };
    // The SVG is loaded once. Selection is reflected in the separate effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    mapRef.current?.querySelectorAll(".interactive-prefecture").forEach((group) => {
      const current = group.getAttribute("data-prefecture-id") === selected?.prefecture.id;
      group.classList.toggle("is-selected", current);
      group.setAttribute("aria-pressed", String(current));
    });
  }, [selected]);

  function choosePrefecture(id: string) {
    setParams({ prefecture: id });
    track("map_prefecture_select", { prefecture: id });
    requestAnimationFrame(() => panelRef.current?.focus());
  }
  function choosePlace(name: string) {
    if (!selected) return;
    setParams({ prefecture: selected.prefecture.id, place: name });
    track("map_place_select", { prefecture: selected.prefecture.id });
    requestAnimationFrame(() => panelRef.current?.focus());
  }

  return (
    <section className="recorded-map-page" aria-labelledby="recorded-map-title">
      <header className="recorded-map-heading">
        <span className="eyebrow">記録された土地から、ことばへ</span>
        <h1 id="recorded-map-title">日本地図からことばを探す</h1>
        <p>都道府県を選び、地域情報に確認記録のある地点からことばをたどれます。県境と閲覧用の地図は、方言の分布範囲を示しません。地点名は既存レコードの表記をそのまま表示しています。</p>
      </header>
      <div className="recorded-map-layout">
        <div className="recorded-map-graphic">
          <p id="recorded-map-instructions">地図をタップするか、Tabキーで県を選びEnter・スペースで決定できます。下の都道府県一覧からも同じ情報に進めます。</p>
          <div className="recorded-map-svg" ref={mapRef} aria-describedby="recorded-map-instructions" />
          {mapFailed && <p role="status">地図を読み込めませんでした。下の都道府県一覧から選べます。</p>}
          <small>地図データ: PA4KEV / japan-vector-map（MIT License）。地図上に発話地点の座標は表示していません。</small>
        </div>
        <section className="recorded-map-panel" id="recorded-map-panel" ref={panelRef} tabIndex={-1} aria-label="選択した地域の記録">
          {!selected ? <div className="recorded-map-empty"><MapPin /><h2>まず都道府県を選ぶ</h2><p>記録地点と、そこで資料に記載されたことばを見られます。</p></div> : <>
            <div className="recorded-map-panel-top">
              <button type="button" onClick={() => setParams({})}>全国へ戻る</button>
              {place || unspecified ? <button type="button" onClick={() => choosePrefecture(selected.prefecture.id)}>{selected.prefecture.name}の地点へ戻る</button> : null}
            </div>
            <h2>{selected.prefecture.name}{place ? `・${place.name}` : unspecified ? "・地点未特定" : "の記録地点"}</h2>
            <p>{selected.count}件の記録を収録。資料が県内のどこで使われたかを示さないものは「地点未特定」に分けています。</p>
            {place || unspecified ? <>
              <ul className="recorded-map-words">
                {records.map((record) => <li key={record.id}>
                  <Link to={`/dialects/${record.id}`} onClick={() => track("map_dialect_open", { prefecture: selected.prefecture.id })}>
                    <span><strong>{record.phrase}</strong><small>{hasEvidenceScope(record, "reading") && record.reading ? `読み：${record.reading}` : "読み確認中"}</small></span>
                    <span>{hasEvidenceScope(record, "meaning") ? record.standardJapanese : "意味確認中"}</span>
                    {hasEvidenceScope(record, "example") && record.exampleDialect && <small>用例：{record.exampleDialect}</small>}
                    <small>{place ? `記録地点：${place.name}${record.locality && record.municipality ? `（${record.locality}）` : ""}` : "県内の詳細地点は未特定"}・{record.verificationStatus === "needs_review" ? "確認作業中" : "地域情報の確認記録あり"}</small>
                    <span className="recorded-map-open">記録と出典を見る <ArrowRight size={16} /></span>
                  </Link>
                </li>)}
              </ul>
            </> : <ul className="recorded-map-places">
              {selected.places.map((item) => <li key={item.name}><button type="button" onClick={() => choosePlace(item.name)}><span><strong>{item.name}</strong><small>記録された地名・地点</small></span><span>{item.records.length}件 <ArrowRight size={16} /></span></button></li>)}
              {selected.unspecified.length > 0 && <li><button type="button" onClick={() => choosePlace("_unspecified")}><span><strong>県内の地点未特定</strong><small>市町村や小地名を資料から特定できない記録</small></span><span>{selected.unspecified.length}件 <ArrowRight size={16} /></span></button></li>}
            </ul>}
            <Link className="recorded-map-pref-link" to={`/prefectures/${selected.prefecture.id}`}>{selected.prefecture.name}の地域別一覧へ <ArrowRight size={17} /></Link>
          </>}
        </section>
      </div>
      <nav className="recorded-map-directory" aria-label="都道府県一覧"><h2>都道府県一覧から選ぶ</h2><ul>
        {index.map((item) => <li key={item.prefecture.id}><button type="button" aria-pressed={selected?.prefecture.id === item.prefecture.id} onClick={() => choosePrefecture(item.prefecture.id)}>{item.prefecture.name}<small>{item.count}件</small></button></li>)}
      </ul></nav>
    </section>
  );
}
