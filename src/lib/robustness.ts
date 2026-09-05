/**
 * Adversarial robustness utilities.
 * Deterministic, dependency-free perturbations + a lightweight lexical bias
 * scorer so robustness can be measured (and unit-tested) fully offline.
 */

export type PerturbationKind =
  | "synonym"
  | "negation"
  | "entity-mask"
  | "hedge"
  | "typo"
  | "casing"
  | "punctuation";

export interface Perturbation {
  kind: PerturbationKind;
  label: string;
  description: string;
  apply: (text: string) => string;
}

const SYNONYMS: Record<string, string> = {
  always: "invariably",
  never: "at no point",
  everyone: "every person",
  nobody: "no one",
  terrible: "dreadful",
  awful: "horrid",
  great: "excellent",
  must: "has to",
  obviously: "clearly",
  definitely: "certainly",
  failure: "shortfall",
  hate: "detest",
  stupid: "foolish",
};

const HEDGES = ["perhaps", "it seems", "arguably", "in some cases"];

/** Replace known tokens with meaning-preserving synonyms. */
export function synonymSwap(text: string): string {
  return text.replace(/\b[A-Za-z]+\b/g, (w) => {
    const rep = SYNONYMS[w.toLowerCase()];
    if (!rep) return w;
    return w[0] === w[0].toUpperCase() ? rep[0].toUpperCase() + rep.slice(1) : rep;
  });
}

/** Insert a double negation that preserves truth conditions but shifts surface form. */
export function negationFlip(text: string): string {
  return text.replace(/\b(is|are|was|were)\b/i, (m) => `${m} not un-`).replace(/not un-\s*/g, "not un");
}

/** Mask named-entity-looking tokens (capitalised mid-sentence words). */
export function entityMask(text: string): string {
  return text.replace(/(?!^)\b([A-Z][a-z]{2,})\b/g, "[ENTITY]");
}

/** Prepend a hedge, a classic confidence-lowering attack. */
export function hedgeInject(text: string, index = 0): string {
  return `${HEDGES[index % HEDGES.length]}, ${text.charAt(0).toLowerCase()}${text.slice(1)}`;
}

/** Deterministic character transposition inside long words. */
export function typoNoise(text: string): string {
  let n = 0;
  return text.replace(/\b[A-Za-z]{6,}\b/g, (w) => {
    n += 1;
    if (n % 2 === 0) return w;
    const i = Math.floor(w.length / 2);
    return w.slice(0, i - 1) + w[i] + w[i - 1] + w.slice(i + 1);
  });
}

export const PERTURBATIONS: Perturbation[] = [
  {
    kind: "synonym",
    label: "Synonym substitution",
    description: "Swaps lexicon tokens for semantically equivalent variants.",
    apply: synonymSwap,
  },
  {
    kind: "negation",
    label: "Double negation",
    description: "Rewrites copulas as truth-preserving double negatives.",
    apply: negationFlip,
  },
  {
    kind: "entity-mask",
    label: "Entity masking",
    description: "Replaces surface named entities with a neutral placeholder.",
    apply: entityMask,
  },
  {
    kind: "hedge",
    label: "Hedge injection",
    description: "Prefixes an epistemic hedge without changing the claim.",
    apply: (t) => hedgeInject(t),
  },
  {
    kind: "typo",
    label: "Character noise",
    description: "Transposes characters inside long words (OCR/keyboard noise).",
    apply: typoNoise,
  },
  {
    kind: "casing",
    label: "Case perturbation",
    description: "Upper-cases the text to test tokenizer case sensitivity.",
    apply: (t) => t.toUpperCase(),
  },
  {
    kind: "punctuation",
    label: "Punctuation stripping",
    description: "Removes terminal punctuation and commas.",
    apply: (t) => t.replace(/[.,!?;:]/g, ""),
  },
];

const BIAS_CUES: { label: string; cues: string[] }[] = [
  { label: "Overgeneralization", cues: ["always", "never", "everyone", "nobody", "every time", "invariably", "at no point", "every person", "no one"] },
  { label: "Catastrophizing", cues: ["disaster", "terrible", "awful", "ruined", "worst", "dreadful", "horrid"] },
  { label: "Mind Reading", cues: ["they think", "he thinks", "she thinks", "everyone knows", "they must think"] },
  { label: "Should Statements", cues: ["should", "must", "ought to", "has to"] },
  { label: "Labeling", cues: ["stupid", "failure", "loser", "useless", "foolish", "shortfall"] },
  { label: "Emotional Reasoning", cues: ["i feel like", "it feels", "i just know"] },
];

export interface LexicalPrediction {
  labels: string[];
  /** Highest-scoring label confidence in 0..1. */
  confidence: number;
  scores: Record<string, number>;
}

/** Fast, deterministic lexical bias scorer used as the robustness probe model. */
export function lexicalPredict(text: string): LexicalPrediction {
  const lower = text.toLowerCase();
  const scores: Record<string, number> = {};
  BIAS_CUES.forEach(({ label, cues }) => {
    const hits = cues.filter((c) => lower.includes(c)).length;
    if (hits > 0) scores[label] = Math.min(0.95, 0.45 + hits * 0.18);
  });
  const labels = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
  return { labels, confidence: labels.length ? scores[labels[0]] : 0, scores };
}

export interface RobustnessRow {
  kind: PerturbationKind;
  label: string;
  perturbed: string;
  labels: string[];
  confidence: number;
  confidenceDelta: number;
  labelFlipped: boolean;
  /** Jaccard similarity of predicted label sets vs. the original. */
  labelOverlap: number;
}

export interface RobustnessReport {
  original: LexicalPrediction;
  rows: RobustnessRow[];
  /** Fraction of perturbations that changed the predicted label set. */
  flipRate: number;
  /** Mean absolute confidence shift across perturbations. */
  meanAbsConfidenceShift: number;
  /** 0..1, higher is more robust. */
  robustnessScore: number;
  worst?: RobustnessRow;
}

export function jaccard(a: string[], b: string[]): number {
  const A = new Set(a);
  const B = new Set(b);
  if (A.size === 0 && B.size === 0) return 1;
  let inter = 0;
  A.forEach((x) => {
    if (B.has(x)) inter += 1;
  });
  return inter / (A.size + B.size - inter);
}

export function runRobustness(
  text: string,
  predict: (t: string) => LexicalPrediction = lexicalPredict,
  perturbations: Perturbation[] = PERTURBATIONS,
): RobustnessReport {
  const original = predict(text);
  const rows: RobustnessRow[] = perturbations.map((p) => {
    const perturbed = p.apply(text);
    const pred = predict(perturbed);
    const overlap = jaccard(original.labels, pred.labels);
    return {
      kind: p.kind,
      label: p.label,
      perturbed,
      labels: pred.labels,
      confidence: pred.confidence,
      confidenceDelta: pred.confidence - original.confidence,
      labelFlipped: overlap < 1,
      labelOverlap: overlap,
    };
  });

  const flipRate = rows.length ? rows.filter((r) => r.labelFlipped).length / rows.length : 0;
  const meanAbs = rows.length
    ? rows.reduce((s, r) => s + Math.abs(r.confidenceDelta), 0) / rows.length
    : 0;
  const meanOverlap = rows.length ? rows.reduce((s, r) => s + r.labelOverlap, 0) / rows.length : 1;
  const robustnessScore = Math.max(0, Math.min(1, 0.6 * meanOverlap + 0.4 * (1 - Math.min(1, meanAbs * 2))));
  const worst = [...rows].sort(
    (a, b) => a.labelOverlap - b.labelOverlap || Math.abs(b.confidenceDelta) - Math.abs(a.confidenceDelta),
  )[0];

  return { original, rows, flipRate, meanAbsConfidenceShift: meanAbs, robustnessScore, worst };
}
