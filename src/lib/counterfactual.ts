/**
 * Counterfactual bias rewriting: minimal, auditable edits that reduce
 * biased framing while preserving the author's claim.
 */

export interface EditRule {
  id: string;
  pattern: RegExp;
  replacement: string;
  biasType: string;
  rationale: string;
}

export const EDIT_RULES: EditRule[] = [
  { id: "always", pattern: /\balways\b/gi, replacement: "often", biasType: "Overgeneralization", rationale: "Universal quantifier softened to a frequency claim." },
  { id: "never", pattern: /\bnever\b/gi, replacement: "rarely", biasType: "Overgeneralization", rationale: "Absolute negation replaced with a graded term." },
  { id: "everyone", pattern: /\beveryone\b/gi, replacement: "some people", biasType: "Overgeneralization", rationale: "Population-wide claim scoped to a subset." },
  { id: "nobody", pattern: /\bnobody\b/gi, replacement: "few people", biasType: "Overgeneralization", rationale: "Absolute negation scoped." },
  { id: "should", pattern: /\bshould\b/gi, replacement: "could", biasType: "Should Statements", rationale: "Obligation reframed as an option." },
  { id: "must", pattern: /\bmust\b/gi, replacement: "may want to", biasType: "Should Statements", rationale: "Rigid demand relaxed." },
  { id: "disaster", pattern: /\b(disaster|catastrophe)\b/gi, replacement: "setback", biasType: "Catastrophizing", rationale: "Worst-case framing scaled to observed impact." },
  { id: "terrible", pattern: /\b(terrible|awful|horrible)\b/gi, replacement: "difficult", biasType: "Catastrophizing", rationale: "Extreme valence reduced." },
  { id: "failure", pattern: /\b(failure|loser)\b/gi, replacement: "person who had a setback", biasType: "Labeling", rationale: "Global label replaced with a behaviour description." },
  { id: "stupid", pattern: /\b(stupid|useless|worthless)\b/gi, replacement: "not effective here", biasType: "Labeling", rationale: "Trait label converted to a situated judgement." },
  { id: "obviously", pattern: /\b(obviously|clearly|undoubtedly)\b/gi, replacement: "arguably", biasType: "Confirmation Bias", rationale: "Unwarranted certainty hedged." },
  { id: "proves", pattern: /\bproves\b/gi, replacement: "suggests", biasType: "Confirmation Bias", rationale: "Evidence strength calibrated." },
  { id: "they-think", pattern: /\b(they|he|she)\s+(think|thinks)\b/gi, replacement: "$1 may think", biasType: "Mind Reading", rationale: "Attributed mental state marked as an inference." },
  { id: "i-feel-like", pattern: /\bi feel like\b/gi, replacement: "one interpretation is that", biasType: "Emotional Reasoning", rationale: "Feeling separated from fact claim." },
];

export interface AppliedEdit {
  id: string;
  biasType: string;
  from: string;
  to: string;
  rationale: string;
  count: number;
}

export interface CounterfactualResult {
  original: string;
  rewritten: string;
  edits: AppliedEdit[];
  /** Token-level Levenshtein distance between original and rewrite. */
  editDistance: number;
  /** 0..1 share of tokens left untouched (higher = more minimal edit). */
  minimality: number;
  biasTypesAddressed: string[];
}

export function tokenize(text: string): string[] {
  return text.trim().length ? text.trim().split(/\s+/) : [];
}

export function levenshteinTokens(a: string[], b: string[]): number {
  const m = a.length;
  const n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i, ...Array(n).fill(0)];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

export function generateCounterfactual(text: string, rules: EditRule[] = EDIT_RULES): CounterfactualResult {
  let rewritten = text;
  const edits: AppliedEdit[] = [];

  rules.forEach((rule) => {
    const matches = text.match(rule.pattern);
    if (!matches || matches.length === 0) return;
    rewritten = rewritten.replace(new RegExp(rule.pattern.source, rule.pattern.flags), rule.replacement);
    edits.push({
      id: rule.id,
      biasType: rule.biasType,
      from: matches[0],
      to: rule.replacement.replace("$1", ""),
      rationale: rule.rationale,
      count: matches.length,
    });
  });

  const a = tokenize(text);
  const b = tokenize(rewritten);
  const distance = levenshteinTokens(a, b);
  const minimality = a.length ? Math.max(0, 1 - distance / a.length) : 1;

  return {
    original: text,
    rewritten,
    edits,
    editDistance: distance,
    minimality,
    biasTypesAddressed: [...new Set(edits.map((e) => e.biasType))],
  };
}
