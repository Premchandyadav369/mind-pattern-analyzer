import { describe, it, expect } from "vitest";
import {
  seededRandom,
  bootstrapCI,
  mcNemarTest,
  chiSquarePValue1df,
  permutationTest,
  benjaminiHochberg,
  cohensD,
  syntheticScores,
} from "./significance";

describe("seededRandom", () => {
  it("is deterministic for a given seed", () => {
    const a = seededRandom(5);
    const b = seededRandom(5);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
  it("stays within [0,1)", () => {
    const r = seededRandom(9);
    for (let i = 0; i < 200; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("bootstrapCI", () => {
  it("brackets the sample mean", () => {
    const scores = syntheticScores(0.8, 200, 3);
    const res = bootstrapCI(scores, 500);
    expect(res.lower).toBeLessThanOrEqual(res.mean);
    expect(res.upper).toBeGreaterThanOrEqual(res.mean);
  });
  it("handles empty input", () => {
    expect(bootstrapCI([]).mean).toBe(0);
  });
  it("gives a zero-width interval for constant data", () => {
    const res = bootstrapCI([0.5, 0.5, 0.5, 0.5], 200);
    expect(res.upper - res.lower).toBeCloseTo(0, 6);
  });
});

describe("mcNemarTest", () => {
  it("is non-significant when discordant pairs are balanced", () => {
    const res = mcNemarTest(20, 20);
    expect(res.significant).toBe(false);
    expect(res.pValue).toBeGreaterThan(0.05);
  });
  it("is significant for a strong imbalance", () => {
    const res = mcNemarTest(45, 10);
    expect(res.significant).toBe(true);
    expect(res.pValue).toBeLessThan(0.05);
  });
  it("handles no discordant pairs", () => {
    expect(mcNemarTest(0, 0).pValue).toBe(1);
  });
});

describe("chiSquarePValue1df", () => {
  it("matches the known 3.841 critical value", () => {
    expect(chiSquarePValue1df(3.841)).toBeCloseTo(0.05, 2);
  });
  it("returns 1 at zero", () => {
    expect(chiSquarePValue1df(0)).toBe(1);
  });
});

describe("permutationTest", () => {
  it("detects a consistent shift", () => {
    const a = Array.from({ length: 60 }, (_, i) => 0.8 + i * 0.0001);
    const b = a.map((v) => v - 0.15);
    const res = permutationTest(a, b, 2000);
    expect(res.observedDiff).toBeGreaterThan(0);
    expect(res.significant).toBe(true);
  });
  it("finds no effect for identical vectors", () => {
    const a = syntheticScores(0.7, 50, 2);
    const res = permutationTest(a, a, 500);
    expect(res.observedDiff).toBeCloseTo(0, 10);
    expect(res.pValue).toBeGreaterThan(0.05);
  });
});

describe("benjaminiHochberg", () => {
  it("keeps adjusted values >= raw values", () => {
    const raw = [0.001, 0.01, 0.04, 0.2];
    const adj = benjaminiHochberg(raw);
    adj.forEach((v, i) => expect(v).toBeGreaterThanOrEqual(raw[i] - 1e-12));
  });
  it("is monotone in rank order", () => {
    const adj = benjaminiHochberg([0.001, 0.01, 0.04, 0.2]);
    expect(adj[0]).toBeLessThanOrEqual(adj[3]);
  });
  it("handles empty input", () => {
    expect(benjaminiHochberg([])).toEqual([]);
  });
});

describe("cohensD", () => {
  it("is positive when a beats b", () => {
    const a = syntheticScores(0.85, 80, 4);
    const b = a.map((v) => v - 0.2);
    expect(cohensD(a, b)).toBeGreaterThan(0);
  });
  it("is zero for identical vectors", () => {
    const a = [0.1, 0.2, 0.3];
    expect(cohensD(a, a)).toBe(0);
  });
});

describe("syntheticScores", () => {
  it("stays in range and is reproducible", () => {
    const a = syntheticScores(0.8, 100, 1);
    const b = syntheticScores(0.8, 100, 1);
    expect(a).toEqual(b);
    expect(Math.max(...a)).toBeLessThanOrEqual(1);
    expect(Math.min(...a)).toBeGreaterThanOrEqual(0);
  });
});
