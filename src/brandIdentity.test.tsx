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
  it("keeps the small icon vector clean and provides a separate maskable icon", () => {
    expect(icon).toContain('fill="#103965"');
    expect(icon).toContain('fill="#EA4436"');
    expect(icon).not.toMatch(/<image|<filter|<script/);
    const manifest = JSON.parse(manifestText);
    expect(manifest.icons).toEqual(expect.arrayContaining([
      expect.objectContaining({ src: "/icon.svg", purpose: "any" }),
      expect.objectContaining({ src: "/brand/kotobanochizu-maskable.svg", purpose: "maskable" }),
    ]));
  });
});
