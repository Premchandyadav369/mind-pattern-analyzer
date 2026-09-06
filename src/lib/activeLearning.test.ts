import { describe, it, expect } from "vitest";
import {
  entropy,
  margin,
  leastConfidence,
  hashEmbedding,
  cosine,
  selectBatch,
  uncertaintyOf,
  expectedLabelSavings,
  type Candidate,
} from "./activeLearning";

const pool: Candidate[] = [
  { id: "1", text: "everyone always fails at everything", probs: [0.5, 0.5] },
  { id: "2", text: "the quarterly report is due tomorrow", probs: [0.95, 0.05] },
  { id: "3", text: "everyone always fails at everything too", probs: [0.52, 0.48] },
  { id: "4", text: "a completely different topic about gardening plants", probs: [0.6, 0.4] },
];

describe("uncertainty measures", () => {
  it("entropy is maximal for a uniform distribution", () => {
    expect(entropy([0.5, 0.5])).toBeCloseTo(1, 6);
    expect(entropy([1, 0])).toBeCloseTo(0, 6);
  });

  it("margin and least-confidence behave as expected", () => {
    expect(margin([0.9, 0.1])).toBeCloseTo(0.8, 6);
    expect(leastConfidence([0.9, 0.1])).toBeCloseTo(0.1, 6);
  });

  it("dispatches strategies", () => {
    expect(uncertaintyOf([0.9, 0.1], "margin")).toBeCloseTo(0.2, 6);
    expect(uncertaintyOf([0.9, 0.1], "least-confidence")).toBeCloseTo(0.1, 6);
    expect(uncertaintyOf([0.5, 0.5])).toBeCloseTo(1, 6);
  });
});

describe("embeddings", () => {
  it("is deterministic and unit-normalised", () => {
    const a = hashEmbedding("hello world");
    expect(a).toEqual(hashEmbedding("hello world"));
    expect(Math.sqrt(a.reduce((s, x) => s + x * x, 0))).toBeCloseTo(1, 6);
  });

  it("scores similar texts higher than dissimilar ones", () => {
    const a = hashEmbedding("bias detection research");
    const b = hashEmbedding("bias detection study");
    const c = hashEmbedding("banana bread recipe");
    expect(cosine(a, b)).toBeGreaterThan(cosine(a, c));
  });
});

describe("selectBatch", () => {
  it("returns a ranked batch of the requested size", () => {
    const batch = selectBatch(pool, { batchSize: 3 });
    expect(batch).toHaveLength(3);
    expect(batch.map((b) => b.rank)).toEqual([1, 2, 3]);
  });

  it("picks the most uncertain item first", () => {
    expect(selectBatch(pool, { batchSize: 1 })[0].id).toBe("1");
  });

  it("prefers diverse items when lambda is low", () => {
    const ids = selectBatch(pool, { batchSize: 2, lambda: 0.1 }).map((b) => b.id);
    expect(ids).not.toEqual(["1", "3"]);
  });

  it("never exceeds the pool size", () => {
    expect(selectBatch(pool, { batchSize: 99 })).toHaveLength(pool.length);
  });

  it("is deterministic", () => {
    expect(selectBatch(pool, { batchSize: 3 }).map((b) => b.id)).toEqual(
      selectBatch(pool, { batchSize: 3 }).map((b) => b.id),
    );
  });
});

describe("expectedLabelSavings", () => {
  it("is bounded and zero for an empty batch", () => {
    expect(expectedLabelSavings([], 10)).toBe(0);
    const s = expectedLabelSavings(selectBatch(pool, { batchSize: 2 }), 100);
    expect(s).toBeGreaterThan(0);
    expect(s).toBeLessThanOrEqual(0.9);
  });
});
