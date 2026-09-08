import { describe, it, expect, beforeEach } from "vitest";
import { favorites, memoStore } from "./storage";
const memory = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (k: string) => memory.get(k) ?? null,
    setItem: (k: string, v: string) => memory.set(k, v),
  },
});
describe("local memos", () => {
  beforeEach(() => memory.clear());
  it("persists and removes notes without creating a submission", () => {
    const notes = [{ id: "one", phrase: "覚えておきたいことば", detail: "祖母から聞いた記憶" }];
    expect(memoStore.save(notes)).toBe(true);
    expect(memoStore.all()).toEqual(notes);
    expect(memory.has("kotoba:submissions:v1")).toBe(false);
    expect(memoStore.save([])).toBe(true);
    expect(memoStore.all()).toEqual([]);
  });
  it("handles malformed browser data", () => {
    memory.set("kotoba:memos:v1", '{"unexpected":true}');
    expect(memoStore.all()).toEqual([]);
  });
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
