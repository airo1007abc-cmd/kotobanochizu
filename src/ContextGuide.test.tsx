import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ContextGuide } from "./ContextGuide";

describe("ContextGuide related comparison", () => {
  it("explains and links the Sano winter guide to the cold-expression comparison", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/stories/sano-winter-utterances"]}>
        <Routes>
          <Route path="/stories/:slug" element={<ContextGuide />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(html).toContain('id="context-related-comparison"');
    expect(html).toContain("別の地域と比べて読む");
    expect(html).toContain("身体の反応");
    expect(html).toContain("冷たさ");
    expect(html).toContain(
      'href="/meanings/cold-body-reactions-tochigi-yaizu"',
    );
    expect(html).toContain("佐野と焼津の寒さの表現を比較する");
  });
});
