import { describe, it, expect } from "vitest";
import {
  INSIGHTS,
  emptyState,
  epochDay,
  insightForDay,
  recordVisit,
  toggleBookmark,
  loadState,
  saveState,
  STORAGE_KEY,
} from "@/lib/dailyInsight";

class MemStorage implements Storage {
  private map = new Map<string, string>();
  get length() { return this.map.size; }
  clear() { this.map.clear(); }
  key(i: number) { return Array.from(this.map.keys())[i] ?? null; }
  getItem(k: string) { return this.map.has(k) ? this.map.get(k)! : null; }
  setItem(k: string, v: string) { this.map.set(k, v); }
  removeItem(k: string) { this.map.delete(k); }
}

describe("dailyInsight: insightForDay", () => {
  it("is deterministic for a given day", () => {
    expect(insightForDay(0)).toEqual(insightForDay(0));
    expect(insightForDay(42)).toEqual(insightForDay(42));
  });

  it("cycles through all insights via modulo", () => {
    expect(insightForDay(0)).toEqual(INSIGHTS[0]);
    expect(insightForDay(INSIGHTS.length)).toEqual(INSIGHTS[0]);
    expect(insightForDay(INSIGHTS.length + 3)).toEqual(INSIGHTS[3]);
  });

  it("handles negative day values", () => {
    expect(insightForDay(-1)).toEqual(INSIGHTS[INSIGHTS.length - 1]);
    expect(insightForDay(-INSIGHTS.length)).toEqual(INSIGHTS[0]);
  });
});

describe("dailyInsight: epochDay", () => {
  it("returns an integer", () => {
    const d = epochDay();
    expect(Number.isInteger(d)).toBe(true);
    expect(d).toBeGreaterThan(19000); // > year 2022
  });
  it("respects custom timestamp", () => {
    expect(epochDay(0)).toBe(0);
    expect(epochDay(86_400_000)).toBe(1);
  });
});

describe("dailyInsight: recordVisit", () => {
  it("increments totalViews and adds the day's insight title", () => {
    const next = recordVisit(emptyState(), 100);
    expect(next.totalViews).toBe(1);
    expect(next.seenTitles).toContain(insightForDay(100).title);
    expect(next.streak).toBe(1);
    expect(next.lastSeenDay).toBe(100);
  });

  it("is idempotent for the same day", () => {
    const a = recordVisit(emptyState(), 100);
    const b = recordVisit(a, 100);
    expect(b).toBe(a); // same reference
    expect(b.totalViews).toBe(1);
  });

  it("increments streak when visiting consecutive days", () => {
    let s = recordVisit(emptyState(), 100);
    s = recordVisit(s, 101);
    s = recordVisit(s, 102);
    expect(s.streak).toBe(3);
    expect(s.totalViews).toBe(3);
  });

  it("resets streak when a day is skipped", () => {
    let s = recordVisit(emptyState(), 100);
    s = recordVisit(s, 105);
    expect(s.streak).toBe(1);
  });

  it("does not duplicate already-seen titles", () => {
    let s = recordVisit(emptyState(), 100);
    s = recordVisit(s, 100 + INSIGHTS.length); // same insight via modulo
    expect(s.seenTitles.length).toBe(1);
  });
});

describe("dailyInsight: toggleBookmark", () => {
  it("adds and removes a title", () => {
    const s0 = emptyState();
    const s1 = toggleBookmark(s0, "X");
    expect(s1.bookmarks).toEqual(["X"]);
    const s2 = toggleBookmark(s1, "X");
    expect(s2.bookmarks).toEqual([]);
  });
});

describe("dailyInsight: persistence", () => {
  it("round-trips state via storage", () => {
    const store = new MemStorage();
    const s = recordVisit(emptyState(), 200);
    saveState(s, store);
    const loaded = loadState(store);
    expect(loaded).toEqual(s);
    expect(store.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it("returns empty state for missing or corrupt data", () => {
    const store = new MemStorage();
    expect(loadState(store)).toEqual(emptyState());
    store.setItem(STORAGE_KEY, "{not json");
    expect(loadState(store)).toEqual(emptyState());
  });

  it("merges partial saved state with defaults", () => {
    const store = new MemStorage();
    store.setItem(STORAGE_KEY, JSON.stringify({ streak: 9 }));
    const loaded = loadState(store);
    expect(loaded.streak).toBe(9);
    expect(loaded.bookmarks).toEqual([]);
    expect(loaded.seenTitles).toEqual([]);
  });
});
