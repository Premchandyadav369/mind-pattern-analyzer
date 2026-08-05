import { describe, it, expect } from "vitest";
import { compareAnalyses, comparisonToMarkdown } from "./compareAnalyses";

const b = (biasType: string, confidence: number) => ({ biasType, confidence });

describe("compareAnalyses", () => {
  it("handles two empty passages", () => {
    const s = compareAnalyses([], []);
    expect(s.rows).toEqual([]);
    expect(s.overlap).toBe(1);
    expect(s.winner).toBe("tie");
  });

  it("marks labels unique to each side", () => {
    const s = compareAnalyses([b("Anchoring", 0.8)], [b("Labeling", 0.6)]);
    expect(s.rows.find((r) => r.biasType === "Anchoring")?.status).toBe("only-a");
    expect(s.rows.find((r) => r.biasType === "Labeling")?.status).toBe("only-b");
    expect(s.overlap).toBe(0);
  });

  it("computes shared rows and delta", () => {
    const s = compareAnalyses([b("Anchoring", 0.9)], [b("Anchoring", 0.4)]);
    const row = s.rows[0];
    expect(row.status).toBe("shared");
    expect(row.delta).toBeCloseTo(-0.5, 5);
    expect(s.overlap).toBe(1);
  });

  it("picks the cleaner passage as winner", () => {
    const s = compareAnalyses([b("A", 0.9), b("B", 0.8)], [b("A", 0.3)]);
    expect(s.winner).toBe("b");
    expect(s.loadDelta).toBeLessThan(0);
    expect(s.headline).toContain("cleaner");
  });

  it("returns a tie for near-equal loads", () => {
    const s = compareAnalyses([b("A", 0.5)], [b("A", 0.55)]);
    expect(s.winner).toBe("tie");
  });

  it("dedupes repeated labels by max confidence", () => {
    const s = compareAnalyses([b("A", 0.3), b("A", 0.7)], []);
    expect(s.countA).toBe(1);
    expect(s.loadA).toBe(0.7);
  });

  it("exports a markdown table", () => {
    const md = comparisonToMarkdown(compareAnalyses([b("A", 0.5)], [b("A", 0.2)]), "Original", "Revised");
    expect(md).toContain("| Bias | Original | Revised | Δ |");
    expect(md).toContain("A");
  });
});
