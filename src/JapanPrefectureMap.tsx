import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import type { Prefecture, Region } from "./domain";

type MapPrefecture = Prefecture & { dialectCount: number; regionCount: number };

// Shared with the V2 archive map so both views target the same SVG labels.
// eslint-disable-next-line react-refresh/only-export-components
export const prefectureMapLabels: Record<string, string> = {
  hokkaido: "北海道", aomori: "青森県", iwate: "岩手県", miyagi: "宮城県", akita: "秋田県", yamagata: "山形県", fukushima: "福島県",
  ibaraki: "茨城県", tochigi: "栃木県", gunma: "群馬県", saitama: "埼玉県", chiba: "千葉県", tokyo: "東京都", kanagawa: "神奈川県",
  nigata: "新潟県", toyama: "富山県", ishikawa: "石川県", fukui: "福井県", yamanashi: "山梨県", nagano: "長野県", gifu: "岐阜県", shizuoka: "静岡県", aichi: "愛知県",
  mie: "三重県", shiga: "滋賀県", kyoto: "京都府", osaka: "大阪府", hyogo: "兵庫県", nara: "奈良県", wakayama: "和歌山県",
  tottori: "鳥取県", shimane: "島根県", okayama: "岡山県", hiroshima: "広島県", yamaguchi: "山口県",
  tokushima: "徳島県", kagawa: "香川県", ehime: "愛媛県", kochi: "高知県",
  fukuoka: "福岡県", saga: "佐賀県", nagasaki: "長崎県", kumamoto: "熊本県", oita: "大分県", miyazaki: "宮崎県", kagoshima: "鹿児島県", okinawa: "沖縄県",
};

export function JapanPrefectureMap({ prefectures, regions }: { prefectures: MapPrefecture[]; regions: Region[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string>();
  const [mapReady, setMapReady] = useState(false);
  const selected = prefectures.find((item) => item.id === selectedId);
  const selectedRegions = regions.filter((item) => item.prefectureId === selectedId);

  useEffect(() => {
    let disposed = false;
    const cleanups: Array<() => void> = [];
    fetch("/japan-prefectures.svg").then((response) => response.text()).then((markup) => {
      if (disposed || !mapRef.current) return;
      mapRef.current.innerHTML = markup;
      const svg = mapRef.current.querySelector("svg");
      if (!svg) return;
      svg.removeAttribute("width");
      svg.removeAttribute("height");
      svg.setAttribute("aria-label", "都道府県境を示した日本地図");
      Object.entries(prefectureMapLabels).forEach(([label, prefectureName]) => {
        const group = svg.querySelector(`[inkscape\\:label="${label}"]`);
        const prefecture = prefectures.find((item) => item.name === prefectureName);
        if (!group || !prefecture) return;
        (group as SVGGraphicsElement).style.display = "inline";
        group.classList.add("interactive-prefecture");
        group.setAttribute("role", "button");
        group.setAttribute("tabindex", "0");
        group.setAttribute("aria-label", `${prefectureName}を選択`);
        group.setAttribute("data-prefecture-id", prefecture.id);
        const choose = () => setSelectedId(prefecture.id);
        const keydown = (event: Event) => {
          const key = (event as KeyboardEvent).key;
          if (key === "Enter" || key === " ") { event.preventDefault(); choose(); }
        };
        group.addEventListener("click", choose);
        group.addEventListener("keydown", keydown);
        cleanups.push(() => { group.removeEventListener("click", choose); group.removeEventListener("keydown", keydown); });
      });
      setMapReady(true);
    });
    return () => { disposed = true; cleanups.forEach((cleanup) => cleanup()); };
  }, [prefectures]);

  useEffect(() => {
    mapRef.current?.querySelectorAll(".interactive-prefecture").forEach((item) => {
      const isSelected = item.getAttribute("data-prefecture-id") === selectedId;
      item.classList.toggle("is-selected", isSelected);
      item.setAttribute("aria-pressed", String(isSelected));
      if (isSelected) item.parentNode?.appendChild(item);
    });
  }, [selectedId, mapReady]);

  return (
    <section className="real-map-section" aria-labelledby="map-title">
      <div className="real-map-intro">
        <span className="eyebrow">都道府県境から選ぶ</span>
        <h2 id="map-title">日本地図から地域を探す</h2>
        <p>都道府県を選ぶと、その土地の地域区分を表示します。</p>
      </div>
      <div className="real-map-layout">
        <div className={`real-japan-map ${mapReady ? "is-ready" : ""}`} ref={mapRef} aria-busy={!mapReady} />
        <aside className="map-region-panel" aria-live="polite">
          {selected ? <>
            <div className="map-region-panel-head"><span>{selected.area}</span><h3>{selected.name}</h3><p>{selected.dialectCount}件のことば・{selected.regionCount}地域</p></div>
            <div className="map-region-links">
              {selectedRegions.map((region) => <Link key={region.id} to={`/regions/${region.id}`}><MapPin /><span><b>{region.name}</b><small>{region.description}</small></span><ArrowRight /></Link>)}
            </div>
            <Link className="map-prefecture-all" to={`/prefectures/${selected.id}`}>{selected.name}のすべてを見る <ArrowRight /></Link>
          </> : <div className="map-empty-state"><MapPin /><h3>地図から都道府県を選択</h3><p>県内の文化圏や地域区分がここに表示されます。</p><small>例：長崎県 → 県南・県央・県北・五島・壱岐・対馬</small></div>}
        </aside>
      </div>
      <small className="map-credit">地図データ: PA4KEV / japan-vector-map（MIT License）</small>
    </section>
  );
}
