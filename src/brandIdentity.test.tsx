import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

describe("selected C identity", () => {
  it("uses the approved wordmark with accessible text in header and footer", () => {
    const app = source("src/App.tsx");
    expect(app.match(/className="brand-wordmark"/g)).toHaveLength(2);
    expect(app.match(/alt="ことばの地図" width="2172" height="724"/g)).toHaveLength(2);
    expect(app).not.toContain("<span>こ</span>");
  });
  it("keeps the small icon vector clean and provides a separate maskable icon", () => {
    const icon = source("public/icon.svg");
    expect(icon).toContain('fill="#103965"');
    expect(icon).toContain('fill="#EA4436"');
    expect(icon).not.toMatch(/<image|<filter|<script/);
    const manifest = JSON.parse(source("public/manifest.webmanifest"));
    expect(manifest.icons).toEqual(expect.arrayContaining([
      expect.objectContaining({ src: "/icon.svg", purpose: "any" }),
      expect.objectContaining({ src: "/brand/kotobanochizu-maskable.svg", purpose: "maskable" }),
    ]));
  });
});
