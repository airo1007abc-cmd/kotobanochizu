import html from "../index.html?raw";
import app from "./App.tsx?raw";
import icon from "../public/icon.svg?raw";
import manifestText from "../public/manifest.webmanifest?raw";
import { describe, expect, it } from "vitest";


describe("selected C identity", () => {
  it("uses the approved wordmark with accessible text in header and footer", () => {
    expect(app.match(/className="brand-wordmark"/g)).toHaveLength(2);
    expect(app.match(/alt="ことばの地図" width="2172" height="724"/g)).toHaveLength(2);
    expect(app).not.toContain("<span>こ</span>");
  });
  it("keeps editorial policy in the footer rather than the main menu", () => {
    const header = app.slice(app.indexOf("<header"), app.indexOf("</header>"));
    const footer = app.slice(app.indexOf("<footer"), app.indexOf("</footer>"));
    expect(header).not.toContain('/editorial-policy');
    expect(footer).toContain('<Link to="/editorial-policy">編集方針と信頼性</Link>');
  });
  it("keeps the small icon vector clean and provides a separate maskable icon", () => {
    expect(icon).toContain('fill="#103965"');
    expect(icon).toContain('fill="#EA4436"');
    expect(icon).toContain('viewBox="0 0 64 64"');
    expect(icon).toContain('fill="#fcfaf5"');
    expect(html).toContain('href="/favicon.ico" sizes="16x16 32x32 48x48"');
    expect(html).toContain('href="/icon.svg?v=2"');
    expect(html).toContain('href="/apple-touch-icon.png" sizes="180x180"');
    expect(icon).not.toMatch(/<image|<filter|<script/);
    const manifest = JSON.parse(manifestText);
    expect(manifest.icons).toEqual(expect.arrayContaining([
      expect.objectContaining({ src: "/icon.svg", purpose: "any" }),
      expect.objectContaining({ src: "/brand/kotobanochizu-maskable.svg", purpose: "maskable" }),
    ]));
  });
});
