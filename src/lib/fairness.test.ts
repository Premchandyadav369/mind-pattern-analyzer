import { describe, it, expect } from "vitest";
import { groupStats, fairnessReport, type FairnessSample } from "./fairness";

const balanced: FairnessSample[] = [
  { group: "A", yTrue: 1, yPred: 1 },
  { group: "A", yTrue: 0, yPred: 0 },
  { group: "B", yTrue: 1, yPred: 1 },
  { group: "B", yTrue: 0, yPred: 0 },
];

const skewed: FairnessSample[] = [
  { group: "A", yTrue: 1, yPred: 1 },
  { group: "A", yTrue: 1, yPred: 1 },
  { group: "B", yTrue: 1, yPred: 0 },
  { group: "B", yTrue: 1, yPred: 0 },
];

describe("groupStats", () => {
  it("computes a confusion matrix per group", () => {
    const g = groupStats(balanced);
    expect(g).toHaveLength(2);
    expect(g[0].tp).toBe(1);
    expect(g[0].tn).toBe(1);
    expect(g[0].accuracy).toBe(1);
  });

  it("accepts boolean labels", () => {
    const g = groupStats([{ group: "A", yTrue: true, yPred: true }]);
    expect(g[0].tp).toBe(1);
  });
});

describe("fairnessReport", () => {
  it("reports parity for a balanced audit", () => {
    const r = fairnessReport(balanced);
    expect(r.demographicParityDifference).toBe(0);
    expect(r.disparateImpactRatio).toBe(1);
    expect(r.equalizedOddsDifference).toBe(0);
    expect(r.fourFifthsPass).toBe(true);
  });

  it("detects disparate impact", () => {
    const r = fairnessReport(skewed);
    expect(r.demographicParityDifference).toBe(1);
    expect(r.disparateImpactRatio).toBe(0);
    expect(r.fourFifthsPass).toBe(false);
    expect(r.equalOpportunityDifference).toBe(1);
  });

  it("names the worst and best performing groups", () => {
    const r = fairnessReport(skewed);
    expect(r.worstGroup).toBe("B");
    expect(r.bestGroup).toBe("A");
  });

  it("handles an empty audit safely", () => {
    const r = fairnessReport([]);
    expect(r.groups).toHaveLength(0);
    expect(r.disparateImpactRatio).toBe(1);
  });
});
