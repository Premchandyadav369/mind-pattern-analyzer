/**
 * Active-learning sample selection: uncertainty + diversity hybrid scoring
 * with greedy batch construction (a lightweight BADGE/coreset analogue).
 */

export interface Candidate {
  id: string;
  text: string;
  /** Class probability distribution from the classifier. */
  probs: number[];
  /** Optional dense representation; falls back to a hashed bag-of-words vector. */
  embedding?: number[];
}

export function entropy(probs: number[]): number {
  const s = probs.reduce((a, b) => a + b, 0) || 1;
  const p = probs.map((v) => v / s);
  const h = -p.reduce((acc, v) => acc + (v > 0 ? v * Math.log(v) : 0), 0);
  const max = Math.log(Math.max(2, probs.length));
  return h / max;
}

export function margin(probs: number[]): number {
  const sorted = [...probs].sort((a, b) => b - a);
  return (sorted[0] ?? 0) - (sorted[1] ?? 0);
}

export function leastConfidence(probs: number[]): number {
  return 1 - Math.max(0, ...probs);
}

/** Deterministic hashed bag-of-words embedding. */
export function hashEmbedding(text: string, dim = 64): number[] {
  const v = new Array(dim).fill(0);
  text
    .toLowerCase()
    .split(/[^a-z0-9']+/)
    .filter(Boolean)
    .forEach((tok) => {
      let h = 2166136261;
      for (let i = 0; i < tok.length; i++) {
        h ^= tok.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      v[Math.abs(h) % dim] += 1;
    });
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map((x) => x / norm);
}

export function cosine(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

export interface ScoredCandidate extends Candidate {
  entropy: number;
  margin: number;
  leastConfidence: number;
  uncertainty: number;
  diversity: number;
  acquisition: number;
  rank: number;
}

export interface SelectionOptions {
  batchSize?: number;
  /** 0 = pure diversity, 1 = pure uncertainty. */
  lambda?: number;
  strategy?: "entropy" | "margin" | "least-confidence";
}

export function uncertaintyOf(probs: number[], strategy: SelectionOptions["strategy"] = "entropy"): number {
  if (strategy === "margin") return 1 - margin(probs);
  if (strategy === "least-confidence") return leastConfidence(probs);
  return entropy(probs);
}

/** Greedy max-marginal-relevance batch selection. */
export function selectBatch(candidates: Candidate[], options: SelectionOptions = {}): ScoredCandidate[] {
  const { batchSize = 5, lambda = 0.7, strategy = "entropy" } = options;
  const embeds = new Map(candidates.map((c) => [c.id, c.embedding ?? hashEmbedding(c.text)]));
  const pool = [...candidates];
  const chosen: ScoredCandidate[] = [];

  while (chosen.length < Math.min(batchSize, candidates.length) && pool.length) {
    let best: { cand: Candidate; score: number; unc: number; div: number } | null = null;
    pool.forEach((c) => {
      const unc = uncertaintyOf(c.probs, strategy);
      const emb = embeds.get(c.id)!;
      const maxSim = chosen.length
        ? Math.max(...chosen.map((s) => cosine(emb, embeds.get(s.id)!)))
        : 0;
      const div = 1 - maxSim;
      const score = lambda * unc + (1 - lambda) * div;
      if (!best || score > best.score) best = { cand: c, score, unc, div };
    });
    if (!best) break;
    const { cand, score, unc, div } = best as { cand: Candidate; score: number; unc: number; div: number };
    chosen.push({
      ...cand,
      entropy: entropy(cand.probs),
      margin: margin(cand.probs),
      leastConfidence: leastConfidence(cand.probs),
      uncertainty: unc,
      diversity: div,
      acquisition: score,
      rank: chosen.length + 1,
    });
    pool.splice(pool.indexOf(cand), 1);
  }

  return chosen;
}

/** Expected labelling effort saved vs. random sampling, as a rough planning aid. */
export function expectedLabelSavings(selected: ScoredCandidate[], poolSize: number): number {
  if (!selected.length || poolSize === 0) return 0;
  const avgUnc = selected.reduce((s, c) => s + c.uncertainty, 0) / selected.length;
  return Math.max(0, Math.min(0.9, avgUnc * (1 - selected.length / poolSize)));
}
