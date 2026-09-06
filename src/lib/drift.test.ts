import { describe, it, expect } from "vitest";
import { bucketHistory, psi, interpretPsi, mannKendall, cusum, driftReport, type DriftEntry } from "./drift";

const day = (n: number) => new Date(Date.UTC(2026, 0, n)).toISOString();

const history: DriftEntry[] = Array.from({ length: 12 }, (_, i) => ({
  analyzedAt: day(i + 1),
  biases: Array.from({ length: Math.min(4, 1 + Math.floor(i / 3)) }, () => ({
    biasType: i < 6 ? "Overgeneralization" : "Catastrophizing",
    confidence: 0.5 + i * 0.02,
  })),
}));

describe("bucketHistory", () => {
  it("buckets by day in chronological order", () => {
    const b = bucketHistory(history, 1);
    expect(b).toHaveLength(12);
    expect(b[0].start).toBeLessThan(b[11].start);
  });

  it("computes prevalence per bucket", () => {
    const b = bucketHistory(history, 1);
    expect(b[0].prevalence.Overgeneralization).toBeGreaterThan(0);
  });

  it("ignores unparseable dates", () => {
    expect(bucketHistory([{ analyzedAt: "not-a-date", biases: [] }])).toHaveLength(0);
  });
});

describe("psi", () => {
  it("is ~0 for identical distributions", () => {
    expect(psi({ a: 0.5, b: 0.5 }, { a: 0.5, b: 0.5 })).toBeCloseTo(0, 6);
  });

  it("grows when distributions diverge", () => {
    expect(psi({ a: 0.9, b: 0.1 }, { a: 0.1, b: 0.9 })).toBeGreaterThan(0.25);
  });

  it("labels drift bands", () => {
    expect(interpretPsi(0.05)).toBe("stable");
    expect(interpretPsi(0.15)).toBe("moderate drift");
    expect(interpretPsi(0.4)).toBe("significant drift");
  });
});

describe("mannKendall", () => {
  it("detects a monotone increase", () => {
    const r = mannKendall([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(r.trend).toBe("increasing");
    expect(r.tau).toBeCloseTo(1, 5);
  });

  it("detects a monotone decrease", () => {
    expect(mannKendall([10, 9, 8, 7, 6, 5, 4, 3, 2, 1]).trend).toBe("decreasing");
  });

  it("returns no trend for short series", () => {
    expect(mannKendall([1, 2]).trend).toBe("no trend");
  });
});

describe("cusum", () => {
  it("returns one point per observation", () => {
    expect(cusum([1, 1, 1, 5, 5, 5])).toHaveLength(6);
  });

  it("accumulates a positive statistic after a level shift", () => {
    const pts = cusum([0, 0, 0, 0, 3, 3, 3, 3]);
    expect(pts[pts.length - 1].high).toBeGreaterThan(0);
  });
});

describe("driftReport", () => {
  const report = driftReport(history, 1);

  it("summarises drift over the full history", () => {
    expect(report.buckets.length).toBe(12);
    expect(report.psi).toBeGreaterThan(0);
    expect(["stable", "moderate drift", "significant drift"]).toContain(report.psiLabel);
  });

  it("ranks rising and falling bias types", () => {
    expect(report.rising[0].biasType).toBe("Catastrophizing");
    expect(report.falling[0].biasType).toBe("Overgeneralization");
  });

  it("handles an empty history", () => {
    const empty = driftReport([]);
    expect(empty.buckets).toHaveLength(0);
    expect(empty.volumeTrend.trend).toBe("no trend");
  });
});
