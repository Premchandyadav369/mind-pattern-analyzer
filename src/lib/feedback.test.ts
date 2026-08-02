import { describe, it, expect, beforeEach } from "vitest";
import {
  recordFeedback,
  loadFeedback,
  clearFeedback,
  removeFeedback,
  computeFeedbackStats,
  feedbackToCsv,
  feedbackToJsonl,
  makeFeedbackId,
  type FeedbackRecord,
} from "./feedback";

const base = (over: Partial<FeedbackRecord> = {}): Omit<FeedbackRecord, "id" | "createdAt"> => ({
  biasType: "Catastrophizing",
  verdict: "correct",
  confidence: 0.9,
  excerpt: "Everything is ruined",
  ...over,
});

describe("feedback store", () => {
  beforeEach(() => clearFeedback());

  it("persists a record", () => {
    recordFeedback(base());
    expect(loadFeedback()).toHaveLength(1);
  });

  it("de-duplicates by bias + excerpt", () => {
    recordFeedback(base());
    recordFeedback(base({ verdict: "incorrect" }));
    const all = loadFeedback();
    expect(all).toHaveLength(1);
    expect(all[0].verdict).toBe("incorrect");
  });

  it("removes a record by id", () => {
    recordFeedback(base());
    const id = makeFeedbackId("Catastrophizing", "Everything is ruined");
    expect(removeFeedback(id)).toHaveLength(0);
  });
});

describe("feedback stats", () => {
  const records: FeedbackRecord[] = [
    { ...base(), id: "a", createdAt: "2026-01-01" },
    { ...base({ excerpt: "b", verdict: "partial" }), id: "b", createdAt: "2026-01-02" },
    {
      ...base({ excerpt: "c", verdict: "incorrect", correctedLabel: "Overgeneralization" }),
      id: "c",
      createdAt: "2026-01-03",
    },
  ];

  it("computes agreement and kappa", () => {
    const s = computeFeedbackStats(records);
    expect(s.total).toBe(3);
    expect(s.agreement).toBeCloseTo(0.5, 6);
    expect(s.kappa).toBeCloseTo(0, 6);
  });

  it("aggregates per class", () => {
    const s = computeFeedbackStats(records);
    expect(s.perClass[0].biasType).toBe("Catastrophizing");
    expect(s.perClass[0].total).toBe(3);
  });

  it("tracks label corrections", () => {
    const s = computeFeedbackStats(records);
    expect(s.corrections).toEqual([{ from: "Catastrophizing", to: "Overgeneralization", count: 1 }]);
  });

  it("handles an empty set", () => {
    const s = computeFeedbackStats([]);
    expect(s.agreement).toBe(0);
    expect(s.kappa).toBe(0);
  });

  it("exports CSV and JSONL", () => {
    expect(feedbackToCsv(records).split("\n")).toHaveLength(4);
    const jsonl = feedbackToJsonl(records).split("\n");
    expect(jsonl).toHaveLength(3);
    expect(JSON.parse(jsonl[2]).gold_label).toBe("Overgeneralization");
  });
});
