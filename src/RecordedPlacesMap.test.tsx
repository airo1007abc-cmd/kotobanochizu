import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { RecordedPlacesMap } from "./RecordedPlacesMap";

const render = (query = "") => renderToStaticMarkup(<MemoryRouter initialEntries={[`/map${query}`]}><RecordedPlacesMap /></MemoryRouter>);

describe("recorded map selection layout", () => {
  it("gives the unselected map the full layout and collapses detailed caveats", () => {
    const html = render();
    expect(html).toContain('class="recorded-map-layout"');
    expect(html).not.toContain('id="recorded-map-panel"');
    expect(html).toContain('<details class="recorded-map-notes">');
    expect(html).toContain("方言の分布範囲を示しません");
  });
  it("restores a prefecture from its URL with the selected layout and complete place list", () => {
    const html = render("?prefecture=p47");
    expect(html).toContain('class="recorded-map-layout is-selected"');
    expect(html).toContain("沖縄県の記録地点");
    expect(html).toContain("全国の地図へ");
    expect(html).toContain("宮古島市上野野原");
    expect(html).toContain('id="recorded-map-panel"');
  });
  it("restores a place and its record count from the URL", () => {
    const html = render(`?prefecture=p47&place=${encodeURIComponent("宮古島市上野野原")}`);
    expect(html).toContain("沖縄県・宮古島市上野野原");
    expect(html).toContain("56件のことば");
    expect(html).toContain("沖縄県の地点へ戻る");
  });
  it("falls back safely for invalid prefecture and place parameters", () => {
    expect(render("?prefecture=unknown")).not.toContain('id="recorded-map-panel"');
    expect(render("?prefecture=p47&place=unknown")).toContain("沖縄県の記録地点");
  });
});
