import { describe, it, expect } from "vitest";
import { generateCounterfactual, levenshteinTokens, tokenize, EDIT_RULES } from "./counterfactual";

describe("tokenize / levenshteinTokens", () => {
  it("tokenizes on whitespace", () => {
    expect(tokenize(" a b  c ")).toEqual(["a", "b", "c"]);
    expect(tokenize("   ")).toEqual([]);
  });

  it("computes token edit distance", () => {
    expect(levenshteinTokens(["a", "b"], ["a", "b"])).toBe(0);
    expect(levenshteinTokens(["a", "b"], ["a", "c"])).toBe(1);
    expect(levenshteinTokens([], ["a", "b"])).toBe(2);
  });
});

describe("generateCounterfactual", () => {
  it("rewrites absolutist language minimally", () => {
    const r = generateCounterfactual("I always fail and everyone thinks I am a failure");
    expect(r.rewritten).not.toContain("always");
    expect(r.rewritten).toContain("often");
    expect(r.minimality).toBeGreaterThan(0.3);
  });

  it("records each applied edit with a rationale", () => {
    const r = generateCounterfactual("This is obviously a disaster");
    expect(r.edits.length).toBeGreaterThanOrEqual(2);
    r.edits.forEach((e) => expect(e.rationale.length).toBeGreaterThan(5));
  });

  it("lists distinct bias types addressed", () => {
    const r = generateCounterfactual("You should never say that, it is terrible");
    expect(r.biasTypesAddressed).toContain("Should Statements");
    expect(r.biasTypesAddressed).toContain("Catastrophizing");
  });

  it("leaves neutral text untouched", () => {
    const text = "The meeting starts at four.";
    const r = generateCounterfactual(text);
    expect(r.rewritten).toBe(text);
    expect(r.editDistance).toBe(0);
    expect(r.minimality).toBe(1);
  });

  it("is idempotent on its own output", () => {
    const once = generateCounterfactual("Everyone always fails");
    const twice = generateCounterfactual(once.rewritten);
    expect(twice.rewritten).toBe(once.rewritten);
  });

  it("exposes rules with unique ids", () => {
    expect(new Set(EDIT_RULES.map((r) => r.id)).size).toBe(EDIT_RULES.length);
  });
});
