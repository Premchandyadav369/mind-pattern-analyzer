import { describe, it, expect } from "vitest";
import {
  reliabilityBins,
  expectedCalibrationError,
  maximumCalibrationError,
  brierScore,
  overconfidence,
  sweepThresholds,
  bestThreshold,
  analyzeDisagreements,
  toCalibrationSamples,
  verdictOutcome,
  type CalibrationSample,
} from "./calibration";
import type { FeedbackRecord } from "./feedback";

const rec = (p: Partial<FeedbackRecord>): FeedbackRecord => ({
  id: p.id ?? Math.random().toString(36),
  biasType: p.biasType ?? "Catastrophizing",
  verdict: p.verdict ?? "correct",
  confidence: p.confidence ?? 0.8,
  correctedLabel: p.correctedLabel,
  note: p.note,
  excerpt: p.excerpt ?? "sample text",
  createdAt: p.createdAt ?? new Date().toISOString(),
});

describe("verdict mapping", () => {
  it("grades verdicts", () => {
    expect(verdictOutcome("correct")).toBe(1);
    expect(verdictOutcome("partial")).toBe(0.5);
    expect(verdictOutcome("incorrect")).toBe(0);
  });

  it("converts records to samples", () => {
    const s = toCalibrationSamples([rec({ confidence: 0.9, verdict: "incorrect" })]);
    expect(s[0]).toMatchObject({ confidence: 0.9, outcome: 0 });
  });
});

describe("reliability bins", () => {
  it("creates the requested number of bins", () => {
    expect(reliabilityBins([], 10)).toHaveLength(10);
    expect(reliabilityBins([], 5)).toHaveLength(5);
  });

  it("places samples in the right bin and averages them", () => {
    const samples: CalibrationSample[] = [
      { confidence: 0.05, outcome: 0 },
      { confidence: 0.95, outcome: 1 },
      { confidence: 0.91, outcome: 0 },
    ];
    const bins = reliabilityBins(samples, 10);
    expect(bins[0].count).toBe(1);
    expect(bins[9].count).toBe(2);
    expect(bins[9].accuracy).toBeCloseTo(0.5, 5);
    expect(bins[9].avgConfidence).toBeCloseTo(0.93, 5);
    expect(bins[9].gap).toBeCloseTo(0.5 - 0.93, 5);
  });

  it("puts confidence of exactly 1 in the last bin", () => {
    const bins = reliabilityBins([{ confidence: 1, outcome: 1 }], 10);
    expect(bins[9].count).toBe(1);
  });
});

describe("calibration metrics", () => {
  it("is zero for a perfectly calibrated set", () => {
    const samples: CalibrationSample[] = [
      { confidence: 0.95, outcome: 1 },
      { confidence: 0.05, outcome: 0 },
    ];
    expect(expectedCalibrationError(samples)).toBeCloseTo(0.05, 5);
  });

  it("detects overconfidence", () => {
    const samples: CalibrationSample[] = [
      { confidence: 0.9, outcome: 0 },
      { confidence: 0.9, outcome: 0 },
    ];
    expect(overconfidence(samples)).toBeCloseTo(0.9, 5);
    expect(maximumCalibrationError(samples)).toBeCloseTo(0.9, 5);
  });

  it("computes the Brier score", () => {
    expect(brierScore([{ confidence: 0.8, outcome: 1 }])).toBeCloseTo(0.04, 5);
    expect(brierScore([])).toBe(0);
  });

  it("returns 0 metrics for empty input", () => {
    expect(expectedCalibrationError([])).toBe(0);
    expect(maximumCalibrationError([])).toBe(0);
    expect(overconfidence([])).toBe(0);
  });
});

describe("threshold sweep", () => {
  const samples: CalibrationSample[] = [
    { confidence: 0.9, outcome: 1 },
    { confidence: 0.8, outcome: 1 },
    { confidence: 0.3, outcome: 0 },
    { confidence: 0.2, outcome: 0 },
  ];

  it("keeps everything at threshold 0 and nothing above max confidence", () => {
    const pts = sweepThresholds(samples, 0.1);
    expect(pts[0].kept).toBe(4);
    expect(pts[pts.length - 1].kept).toBe(0);
  });

  it("coverage decreases monotonically", () => {
    const pts = sweepThresholds(samples, 0.1);
    for (let i = 1; i < pts.length; i++) {
      expect(pts[i].coverage).toBeLessThanOrEqual(pts[i - 1].coverage);
    }
  });

  it("finds the F1-optimal threshold that filters the noise", () => {
    const best = bestThreshold(sweepThresholds(samples, 0.05));
    expect(best).not.toBeNull();
    expect(best!.precision).toBe(1);
    expect(best!.recall).toBe(1);
    expect(best!.threshold).toBeGreaterThan(0.3);
    expect(best!.threshold).toBeLessThanOrEqual(0.8);
  });

  it("returns null for no points", () => {
    expect(bestThreshold([])).toBeNull();
  });
});

describe("disagreement deep dive", () => {
  const records = [
    rec({ verdict: "correct", confidence: 0.9 }),
    rec({ verdict: "incorrect", confidence: 0.85, correctedLabel: "Overgeneralization" }),
    rec({ verdict: "incorrect", confidence: 0.75, correctedLabel: "Overgeneralization" }),
    rec({ biasType: "Anchoring", verdict: "partial", confidence: 0.4 }),
  ];

  it("counts disagreements and rate", () => {
    const r = analyzeDisagreements(records);
    expect(r.totalDisagreements).toBe(3);
    expect(r.disagreementRate).toBeCloseTo(0.75, 5);
  });

  it("aggregates confusion pairs by severity", () => {
    const r = analyzeDisagreements(records);
    expect(r.pairs[0]).toMatchObject({ from: "Catastrophizing", to: "Overgeneralization", count: 2 });
    expect(r.pairs[0].avgConfidence).toBeCloseTo(0.8, 5);
  });

  it("flags high-confidence errors only", () => {
    const r = analyzeDisagreements(records, 0.7);
    expect(r.highConfidenceErrors).toHaveLength(2);
    expect(r.highConfidenceErrors[0].confidence).toBe(0.85);
  });

  it("ranks worst classes and compares confidence", () => {
    const r = analyzeDisagreements(records);
    expect(r.worstClasses[0].biasType).toBe("Anchoring");
    expect(r.worstClasses[0].errorRate).toBe(1);
    expect(r.avgConfidenceCorrect).toBeCloseTo(0.9, 5);
    expect(r.avgConfidenceWrong).toBeCloseTo((0.85 + 0.75 + 0.4) / 3, 5);
  });

  it("handles empty input", () => {
    const r = analyzeDisagreements([]);
    expect(r.totalDisagreements).toBe(0);
    expect(r.disagreementRate).toBe(0);
    expect(r.pairs).toEqual([]);
  });
});
