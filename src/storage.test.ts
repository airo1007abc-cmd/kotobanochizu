import { describe, it, expect, beforeEach } from "vitest";
import { favorites } from "./storage";
const memory = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (k: string) => memory.get(k) ?? null,
    setItem: (k: string, v: string) => memory.set(k, v),
  },
});
describe("favorites", () => {
  beforeEach(() => memory.clear());
  it("toggles without duplicates", () => {
    favorites.toggle("d1");
    favorites.toggle("d1");
    expect(favorites.all()).toEqual([]);
  });
  it("stores an id", () => {
    favorites.toggle("d2");
    expect(favorites.has("d2")).toBe(true);
  });
});
