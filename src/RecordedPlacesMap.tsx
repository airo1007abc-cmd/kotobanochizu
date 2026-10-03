import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
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
  const focusedMapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const pendingFocus = useRef<"panel" | "map" | null>(null);
  const [mapFailed, setMapFailed] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

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
        group.setAttribute("aria-controls", "recorded-map-layout");
        group.setAttribute("data-prefecture-id", entry.prefecture.id);
        group.setAttribute("aria-pressed", "false");
        const choose = () => {
          if (group.getAttribute("aria-pressed") === "true") return;
          pendingFocus.current = "panel";
          setParams({ prefecture: entry.prefecture.id });
          track("map_prefecture_select", { prefecture: entry.prefecture.id });
        };
        const keydown = (event: Event) => {
          if (["Enter", " "].includes((event as KeyboardEvent).key)) { event.preventDefault(); choose(); }
        };
        group.addEventListener("click", choose);
        group.addEventListener("keydown", keydown);
        cleanups.push(() => { group.removeEventListener("click", choose); group.removeEventListener("keydown", keydown); });
      }
      setMapLoaded(true);
    }).catch(() => { if (active) setMapFailed(true); });
    return () => { active = false; cleanups.forEach((cleanup) => cleanup()); };
    // The SVG is loaded once. Selection is reflected in the separate effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const svg = mapRef.current?.querySelector("svg");
    const focusedMap = focusedMapRef.current;
    if (!svg || !focusedMap) return;
    svg.querySelectorAll<SVGGraphicsElement>(".interactive-prefecture").forEach((group) => {
      const current = group.getAttribute("data-prefecture-id") === selected?.prefecture.id;
      group.classList.toggle("is-selected", current);
      group.setAttribute("aria-pressed", String(current));
    });
    focusedMap.replaceChildren();
    const selectedShape = svg.querySelector<SVGGraphicsElement>(".is-selected");
    if (!selected || !selectedShape) return;

    // Keep the interactive national SVG intact. Zoom only a decorative copy,
    // so returning to the map preserves every prefecture's keyboard target.
    const preview = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    preview.setAttribute("role", "img");
    preview.setAttribute("aria-label", `${selected.prefecture.name}の拡大地図（概略）`);
    const shape = selectedShape.cloneNode(true) as SVGGraphicsElement;
    for (const element of [shape, ...shape.querySelectorAll("*")]) {
      for (const attribute of ["id", "role", "tabindex", "aria-label", "aria-controls", "aria-pressed", "data-prefecture-id"]) element.removeAttribute(attribute);
    }
    shape.setAttribute("class", "recorded-map-selected-shape");
    preview.append(shape);
    focusedMap.append(preview);
    const { x, y, width, height } = preview.getBBox();
    const padding = Math.max(width, height) * .12;
    preview.setAttribute("viewBox", `${x - padding} ${y - padding} ${width + padding * 2} ${height + padding * 2}`);
  }, [selected, mapLoaded]);

  useEffect(() => {
    if (!pendingFocus.current) return;
    const target = pendingFocus.current === "panel" ? panelRef.current : document.getElementById("recorded-map-instructions");
    pendingFocus.current = null;
    target?.focus();
  }, [params]);

  function returnToNationwide() {
    pendingFocus.current = "map";
    setParams({});
  }

  function choosePrefecture(id: string) {
    if (selected?.prefecture.id === id && !place && !unspecified) {
      panelRef.current?.focus();
      return;
    }
    pendingFocus.current = "panel";
    setParams({ prefecture: id });
    track("map_prefecture_select", { prefecture: id });
  }
  function choosePlace(name: string) {
    if (!selected) return;
    pendingFocus.current = "panel";
    setParams({ prefecture: selected.prefecture.id, place: name });
    track("map_place_select", { prefecture: selected.prefecture.id });
  }

  return (
    <section className="recorded-map-page" aria-labelledby="recorded-map-title">
      <header className="recorded-map-heading">
        <span className="eyebrow">記録された土地から、ことばへ</span>
        <h1 id="recorded-map-title">日本地図からことばを探す</h1>
        <p>都道府県から記録地点を選び、その土地のことばへ。</p>
        <details className="recorded-map-notes"><summary>地図と記録地点について</summary><p>県境と閲覧用の地図は、方言の分布範囲を示しません。地図は概略で、すべての離島を表示しているわけではありません。地点名は既存レコードの表記をそのまま表示しています。地図上に発話地点の座標は表示していません。県内の詳細地点を資料から特定できない記録は「地点未特定」に分けています。</p><p>地図はタップ、またはTabキーで県を選びEnter・スペースで決定できます。都道府県一覧からも同じ情報に進めます。</p></details>
      </header>
      <div id="recorded-map-layout" className={`recorded-map-layout${selected ? " is-selected" : ""}`}>
        <div className="recorded-map-graphic">
          <div className="recorded-map-graphic-heading"><h2 id="recorded-map-instructions" tabIndex={-1}>{selected ? selected.prefecture.name : "まず都道府県を選ぶ"}</h2>{selected && <button type="button" onClick={returnToNationwide}>全国の地図へ</button>}</div>
          {!selected && <p>地図をタップ、または下の一覧から選べます。</p>}
          <div className="recorded-map-svg" ref={mapRef} hidden={!!selected} aria-describedby="recorded-map-instructions" />
          <div className="recorded-map-svg recorded-map-focus" ref={focusedMapRef} hidden={!selected} />
          {mapFailed && <p role="status">地図を読み込めませんでした。下の都道府県一覧から選べます。</p>}
          <small>地図データ: PA4KEV / japan-vector-map（MIT License）</small>
        </div>
        {selected && <section className="recorded-map-panel" id="recorded-map-panel" ref={panelRef} tabIndex={-1} aria-label="選択した地域の記録">
          <>
            <div className="recorded-map-panel-top">
              <button type="button" onClick={returnToNationwide}>全国へ戻る</button>
              {place || unspecified ? <button type="button" onClick={() => choosePrefecture(selected.prefecture.id)}>{selected.prefecture.name}の地点へ戻る</button> : null}
            </div>
            <h2>{selected.prefecture.name}{place ? `・${place.name}` : unspecified ? "・地点未特定" : "の記録地点"}</h2>
            <p>{place || unspecified ? `${records.length}件のことば` : `${selected.places.length}地点・${selected.count}件の記録。地点を選んでことばを見る。`}</p>
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
          </>
        </section>}
      </div>
      <nav className="recorded-map-directory" aria-label="都道府県一覧"><h2>都道府県一覧から選ぶ</h2><ul>
        {index.map((item) => <li key={item.prefecture.id}><button type="button" aria-pressed={selected?.prefecture.id === item.prefecture.id} onClick={() => choosePrefecture(item.prefecture.id)}>{item.prefecture.name}<small>{item.count}件</small></button></li>)}
      </ul></nav>
    </section>
  );
}
