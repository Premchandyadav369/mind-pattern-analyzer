import { describe, it, expect } from "vitest";
import {
  observedAgreement,
  cohensKappa,
  fleissKappa,
  krippendorffAlpha,
  gwetAC1,
  interpretKappa,
  agreementReport,
  categoriesOf,
} from "./agreement";

describe("agreement metrics", () => {
  const perfect = [
    ["a", "a", "a"],
    ["b", "b", "b"],
    ["c", "c", "c"],
    ["a", "a", "a"],
  ];

  it("lists sorted categories", () => {
    expect(categoriesOf(perfect)).toEqual(["a", "b", "c"]);
  });

  it("observed agreement is 1 for identical raters", () => {
    expect(observedAgreement(perfect)).toBeCloseTo(1, 10);
  });

  it("cohens kappa is 1 for perfect agreement", () => {
    expect(cohensKappa(["a", "b", "a", "c"], ["a", "b", "a", "c"])).toBeCloseTo(1, 10);
  });

  it("cohens kappa is 0 for chance-level agreement", () => {
    const a = ["a", "a", "b", "b"];
    const b = ["a", "b", "a", "b"];
    expect(cohensKappa(a, b)).toBeCloseTo(0, 10);
  });

  it("cohens kappa is negative for systematic disagreement", () => {
    expect(cohensKappa(["a", "a", "b", "b"], ["b", "b", "a", "a"])).toBeLessThan(0);
  });

  it("cohens kappa ignores missing pairs", () => {
    expect(cohensKappa(["a", null, "b"], ["a", "b", "b"])).toBeCloseTo(1, 10);
  });

  it("fleiss kappa is 1 for unanimous ratings across classes", () => {
    expect(fleissKappa(perfect)).toBeCloseTo(1, 10);
  });

  it("fleiss kappa drops when raters disagree", () => {
    const noisy = [
      ["a", "a", "b"],
      ["b", "c", "b"],
      ["c", "a", "c"],
      ["a", "b", "c"],
    ];
    const k = fleissKappa(noisy);
    expect(k).toBeLessThan(1);
    expect(k).toBeGreaterThan(-1);
  });

  it("krippendorff alpha is 1 for perfect agreement", () => {
    expect(krippendorffAlpha(perfect)).toBeCloseTo(1, 6);
  });

  it("krippendorff alpha tolerates missing values", () => {
    const withGaps = [
      ["a", "a", null],
      ["b", null, "b"],
      ["c", "c", "c"],
    ];
    expect(krippendorffAlpha(withGaps)).toBeCloseTo(1, 6);
  });

  it("krippendorff alpha is low for random-looking data", () => {
    const random = [
      ["a", "b"],
      ["b", "a"],
      ["a", "b"],
      ["b", "a"],
    ];
    expect(krippendorffAlpha(random)).toBeLessThan(0);
  });

  it("gwet AC1 is 1 for perfect agreement", () => {
    expect(gwetAC1(perfect)).toBeCloseTo(1, 10);
  });

  it("gwet AC1 exceeds fleiss kappa under high prevalence skew", () => {
    const skewed = [
      ["a", "a"],
      ["a", "a"],
      ["a", "a"],
      ["a", "a"],
      ["a", "b"],
    ];
    expect(gwetAC1(skewed)).toBeGreaterThan(fleissKappa(skewed));
  });

  it("interprets kappa bands", () => {
    expect(interpretKappa(-0.1)).toMatch(/Poor/);
    expect(interpretKappa(0.1)).toBe("Slight");
    expect(interpretKappa(0.3)).toBe("Fair");
    expect(interpretKappa(0.5)).toBe("Moderate");
    expect(interpretKappa(0.7)).toBe("Substantial");
    expect(interpretKappa(0.9)).toBe("Almost perfect");
  });

  it("builds a full report with all rater pairs", () => {
    const r = agreementReport(perfect, ["A1", "A2", "A3"]);
    expect(r.items).toBe(4);
    expect(r.raters).toBe(3);
    expect(r.pairwise).toHaveLength(3);
    expect(r.pairwise.every((p) => p.kappa > 0.99)).toBe(true);
    expect(r.categories).toEqual(["a", "b", "c"]);
  });
});
