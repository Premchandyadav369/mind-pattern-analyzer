import { describe, it, expect } from "vitest";
import {
  buildConfusionMatrix,
  normalizeRows,
  topConfusions,
  diagonalAccuracy,
  matrixToCsv,
  MISSED_LABEL,
} from "./confusionMatrix";
import { CLASS_METRICS } from "./researchData";

describe("confusion matrix", () => {
  const m = buildConfusionMatrix();

  it("is square over labels plus a missed column", () => {
    expect(m.labels.length).toBe(CLASS_METRICS.length);
    expect(m.columns.length).toBe(CLASS_METRICS.length + 1);
    expect(m.columns.at(-1)).toBe(MISSED_LABEL);
    m.rows.forEach((r) => expect(r.length).toBe(m.columns.length));
  });

  it("conserves support per gold row", () => {
    m.rows.forEach((row, i) => {
      expect(row.reduce((a, b) => a + b, 0)).toBe(CLASS_METRICS[i].support);
    });
  });

  it("keeps the diagonal consistent with reported recall", () => {
    m.rows.forEach((row, i) => {
      const expected = Math.round(CLASS_METRICS[i].recall * CLASS_METRICS[i].support);
      expect(row[i]).toBe(expected);
    });
  });

  it("has no negative counts", () => {
    m.rows.flat().forEach((v) => expect(v).toBeGreaterThanOrEqual(0));
  });

  it("row-normalises to 1", () => {
    normalizeRows(m).forEach((row) => {
      expect(row.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 6);
    });
  });

  it("reports the strongest off-diagonal confusions", () => {
    const top = topConfusions(m, 5);
    expect(top).toHaveLength(5);
    top.forEach((p) => expect(p.gold).not.toBe(p.predicted));
    for (let i = 1; i < top.length; i++) {
      expect(top[i - 1].rate).toBeGreaterThanOrEqual(top[i].rate);
    }
  });

  it("computes a plausible diagonal accuracy", () => {
    const acc = diagonalAccuracy(m);
    expect(acc).toBeGreaterThan(0.6);
    expect(acc).toBeLessThanOrEqual(1);
  });

  it("exports CSV with a header and one row per class", () => {
    const lines = matrixToCsv(m).split("\n");
    expect(lines).toHaveLength(CLASS_METRICS.length + 1);
    expect(lines[0].split(",").length).toBe(m.columns.length + 1);
  });
});
