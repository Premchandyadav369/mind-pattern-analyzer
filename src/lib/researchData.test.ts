import { describe, expect, it } from "vitest";
import {
  BASELINES,
  CLASS_METRICS,
  ABLATIONS,
  CROSS_LINGUAL,
  DATASET_CARD,
  ERROR_ANALYSIS,
  BIBTEX,
  macroF1,
  weightedF1,
} from "./researchData";

describe("researchData integrity", () => {
  it("per-class metrics are valid probabilities with positive support", () => {
    for (const m of CLASS_METRICS) {
      expect(m.precision).toBeGreaterThan(0);
      expect(m.precision).toBeLessThanOrEqual(1);
      expect(m.recall).toBeGreaterThan(0);
      expect(m.recall).toBeLessThanOrEqual(1);
      expect(m.support).toBeGreaterThan(0);
    }
  });

  it("reported F1 matches the harmonic mean of precision and recall", () => {
    for (const m of CLASS_METRICS) {
      const h = (2 * m.precision * m.recall) / (m.precision + m.recall);
      expect(Math.abs(h - m.f1)).toBeLessThan(0.005);
    }
  });

  it("macro and weighted F1 are consistent and in range", () => {
    expect(macroF1()).toBeGreaterThan(0.7);
    expect(macroF1()).toBeLessThan(0.95);
    expect(weightedF1()).toBeGreaterThan(0.7);
    expect(Math.abs(macroF1() - weightedF1())).toBeLessThan(0.1);
  });

  it("macroF1 handles a custom metric list", () => {
    expect(macroF1([{ bias: "x", support: 1, precision: 1, recall: 1, f1: 0.8 }])).toBeCloseTo(0.8);
  });

  it("our model is the strongest baseline", () => {
    const ours = BASELINES.find((b) => b.ours);
    expect(ours).toBeDefined();
    const best = Math.max(...BASELINES.map((b) => b.macroF1));
    expect(ours!.macroF1).toBe(best);
  });

  it("full ablation is the ceiling and matches the headline model", () => {
    const full = ABLATIONS[0];
    expect(full.variant).toBe("Full model");
    for (const a of ABLATIONS.slice(1)) expect(a.macroF1).toBeLessThan(full.macroF1);
    expect(full.macroF1).toBe(BASELINES.find((b) => b.ours)!.macroF1);
  });

  it("cross-lingual English row matches the headline score", () => {
    const en = CROSS_LINGUAL.find((c) => c.code === "en");
    expect(en!.macroF1).toBe(ABLATIONS[0].macroF1);
    expect(new Set(CROSS_LINGUAL.map((c) => c.code)).size).toBe(CROSS_LINGUAL.length);
  });

  it("dataset splits sum to the reported corpus size", () => {
    const { train, val, test } = DATASET_CARD.splits;
    expect(train + val + test).toBe(10712);
    expect(DATASET_CARD.agreement.kappa).toBeGreaterThan(0.7);
  });

  it("error analysis shares sum to 1", () => {
    const total = ERROR_ANALYSIS.reduce((a, e) => a + e.share, 0);
    expect(total).toBeCloseTo(1, 2);
  });

  it("bibtex entry is well formed", () => {
    expect(BIBTEX.trim().startsWith("@software{")).toBe(true);
    expect(BIBTEX.trim().endsWith("}")).toBe(true);
    expect(BIBTEX).toContain("Yadav, V C Premchand");
    expect((BIBTEX.match(/\{/g) || []).length).toBe((BIBTEX.match(/\}/g) || []).length);
  });
});
