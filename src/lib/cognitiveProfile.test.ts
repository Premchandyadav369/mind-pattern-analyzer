import { describe, it, expect } from "vitest";
import { buildCognitiveProfile, profileToMarkdown, type ProfileEntry } from "./cognitiveProfile";

const entry = (n: number, type = "Catastrophizing", severity = "medium"): ProfileEntry => ({
  analyzedAt: new Date().toISOString(),
  biases: Array.from({ length: n }, () => ({ biasType: type, confidence: 0.8, severity })),
});

describe("buildCognitiveProfile", () => {
  it("handles empty history", () => {
    const p = buildCognitiveProfile([]);
    expect(p.totalAnalyses).toBe(0);
    expect(p.dominant).toEqual([]);
    expect(p.recommendations.length).toBeGreaterThan(0);
  });

  it("aggregates counts, shares and confidence", () => {
    const p = buildCognitiveProfile([entry(2), entry(1, "Labeling")]);
    expect(p.totalDetections).toBe(3);
    expect(p.avgBiasesPerAnalysis).toBe(1.5);
    expect(p.dominant[0].biasType).toBe("Catastrophizing");
    expect(p.dominant[0].share).toBeCloseTo(0.67, 1);
    expect(p.avgConfidence).toBeCloseTo(0.8, 5);
  });

  it("tracks severity mix", () => {
    const p = buildCognitiveProfile([entry(1, "A", "high"), entry(2, "B", "low")]);
    expect(p.severityMix).toEqual({ low: 2, medium: 0, high: 1 });
  });

  it("detects improving trend (newest-first history)", () => {
    const p = buildCognitiveProfile([entry(0), entry(0), entry(3), entry(3)]);
    expect(p.trendLabel).toBe("improving");
    expect(p.trend).toBeLessThan(0);
  });

  it("detects worsening trend", () => {
    const p = buildCognitiveProfile([entry(4), entry(4), entry(1), entry(1)]);
    expect(p.trendLabel).toBe("worsening");
  });

  it("computes clean rate", () => {
    const p = buildCognitiveProfile([entry(0), entry(2)]);
    expect(p.cleanRate).toBe(0.5);
  });

  it("keeps volatility within 0..1", () => {
    const p = buildCognitiveProfile([entry(0), entry(9), entry(1)]);
    expect(p.volatility).toBeGreaterThanOrEqual(0);
    expect(p.volatility).toBeLessThanOrEqual(1);
  });

  it("exports markdown with dominant patterns", () => {
    const md = profileToMarkdown(buildCognitiveProfile([entry(2)]));
    expect(md).toContain("Cognitive Profile");
    expect(md).toContain("Catastrophizing");
  });
});
