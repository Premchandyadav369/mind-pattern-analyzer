import { describe, it, expect } from "vitest";
import {
  synonymSwap,
  entityMask,
  hedgeInject,
  typoNoise,
  lexicalPredict,
  jaccard,
  runRobustness,
  PERTURBATIONS,
} from "./robustness";

describe("perturbations", () => {
  it("swaps known synonyms and preserves casing", () => {
    expect(synonymSwap("Always late")).toBe("Invariably late");
  });

  it("masks capitalised mid-sentence entities", () => {
    expect(entityMask("Ravi met Priya today")).toContain("[ENTITY]");
  });

  it("prepends a hedge and lowercases the first character", () => {
    expect(hedgeInject("Everyone fails")).toBe("perhaps, everyone fails");
  });

  it("perturbs long words deterministically", () => {
    const a = typoNoise("catastrophe happened");
    expect(a).toBe(typoNoise("catastrophe happened"));
    expect(a).not.toBe("catastrophe happened");
  });

  it("is deterministic for every registered perturbation", () => {
    PERTURBATIONS.forEach((p) => expect(p.apply("Everyone is always terrible")).toBe(p.apply("Everyone is always terrible")));
  });
});

describe("lexicalPredict", () => {
  it("flags overgeneralization cues", () => {
    const pred = lexicalPredict("Everyone always lets me down");
    expect(pred.labels).toContain("Overgeneralization");
    expect(pred.confidence).toBeGreaterThan(0.5);
  });

  it("returns no labels for neutral text", () => {
    expect(lexicalPredict("The report is due on Tuesday.").labels).toHaveLength(0);
  });
});

describe("jaccard", () => {
  it("is 1 for identical sets and 0 for disjoint ones", () => {
    expect(jaccard(["a"], ["a"])).toBe(1);
    expect(jaccard(["a"], ["b"])).toBe(0);
    expect(jaccard([], [])).toBe(1);
  });
});

describe("runRobustness", () => {
  const report = runRobustness("Everyone always thinks I am a failure and it is terrible");

  it("evaluates every perturbation", () => {
    expect(report.rows).toHaveLength(PERTURBATIONS.length);
  });

  it("bounds all summary statistics", () => {
    expect(report.flipRate).toBeGreaterThanOrEqual(0);
    expect(report.flipRate).toBeLessThanOrEqual(1);
    expect(report.robustnessScore).toBeGreaterThanOrEqual(0);
    expect(report.robustnessScore).toBeLessThanOrEqual(1);
  });

  it("identifies a worst-case perturbation", () => {
    expect(report.worst).toBeDefined();
  });

  it("is fully reproducible", () => {
    const again = runRobustness("Everyone always thinks I am a failure and it is terrible");
    expect(again.robustnessScore).toBe(report.robustnessScore);
  });
});
