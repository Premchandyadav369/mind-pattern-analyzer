/**
 * Statistical significance utilities for research-grade model comparison.
 * Pure functions — deterministic given a seed — so they are unit-testable.
 */

/** Mulberry32 deterministic PRNG. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface BootstrapResult {
  mean: number;
  lower: number;
  upper: number;
  stdError: number;
}

/**
 * Non-parametric bootstrap confidence interval over a sample of per-item scores.
 * @param scores per-item metric values (e.g. per-passage F1)
 * @param iterations resample count
 * @param alpha two-sided significance level (0.05 -> 95% CI)
 */
export function bootstrapCI(
  scores: number[],
  iterations = 2000,
  alpha = 0.05,
  seed = 42,
): BootstrapResult {
  if (scores.length === 0) return { mean: 0, lower: 0, upper: 0, stdError: 0 };
  const rand = seededRandom(seed);
  const n = scores.length;
  const means: number[] = [];
  for (let i = 0; i < iterations; i++) {
    let sum = 0;
    for (let j = 0; j < n; j++) sum += scores[Math.floor(rand() * n)];
    means.push(sum / n);
  }
  means.sort((a, b) => a - b);
  const mean = scores.reduce((s, v) => s + v, 0) / n;
  const lo = means[Math.floor((alpha / 2) * iterations)];
  const hi = means[Math.min(iterations - 1, Math.floor((1 - alpha / 2) * iterations))];
  const variance =
    means.reduce((s, v) => s + (v - mean) ** 2, 0) / Math.max(1, means.length - 1);
  return { mean, lower: lo, upper: hi, stdError: Math.sqrt(variance) };
}

export interface McNemarResult {
  b: number;
  c: number;
  chiSquare: number;
  pValue: number;
  significant: boolean;
}

/**
 * McNemar's test with continuity correction for paired classifier comparison.
 * @param b items model A got right and model B got wrong
 * @param c items model B got right and model A got wrong
 */
export function mcNemarTest(b: number, c: number, alpha = 0.05): McNemarResult {
  const denom = b + c;
  const chiSquare = denom === 0 ? 0 : (Math.abs(b - c) - 1) ** 2 / denom;
  const pValue = chiSquarePValue1df(chiSquare);
  return { b, c, chiSquare, pValue, significant: pValue < alpha };
}

/** Survival function of chi-square with 1 df = erfc(sqrt(x/2)). */
export function chiSquarePValue1df(x: number): number {
  if (x <= 0) return 1;
  return erfc(Math.sqrt(x / 2));
}

/** Abramowitz & Stegun 7.1.26-style complementary error function. */
export function erfc(x: number): number {
  const z = Math.abs(x);
  const t = 1 / (1 + z / 2);
  const r =
    t *
    Math.exp(
      -z * z -
        1.26551223 +
        t *
          (1.00002368 +
            t *
              (0.37409196 +
                t *
                  (0.09678418 +
                    t *
                      (-0.18628806 +
                        t *
                          (0.27886807 +
                            t *
                              (-1.13520398 +
                                t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))),
    );
  return x >= 0 ? r : 2 - r;
}

/** Paired two-sided permutation (randomisation) test on mean difference. */
export function permutationTest(
  a: number[],
  b: number[],
  iterations = 5000,
  seed = 7,
): { observedDiff: number; pValue: number; significant: boolean } {
  const n = Math.min(a.length, b.length);
  if (n === 0) return { observedDiff: 0, pValue: 1, significant: false };
  const diffs = Array.from({ length: n }, (_, i) => a[i] - b[i]);
  const observedDiff = diffs.reduce((s, v) => s + v, 0) / n;
  const rand = seededRandom(seed);
  let extreme = 0;
  for (let it = 0; it < iterations; it++) {
    let sum = 0;
    for (let i = 0; i < n; i++) sum += rand() < 0.5 ? -diffs[i] : diffs[i];
    if (Math.abs(sum / n) >= Math.abs(observedDiff) - 1e-12) extreme++;
  }
  const pValue = (extreme + 1) / (iterations + 1);
  return { observedDiff, pValue, significant: pValue < 0.05 };
}

/** Benjamini-Hochberg FDR correction. Returns adjusted p-values in input order. */
export function benjaminiHochberg(pValues: number[]): number[] {
  const m = pValues.length;
  if (m === 0) return [];
  const idx = pValues.map((p, i) => ({ p, i })).sort((x, y) => x.p - y.p);
  const adj = new Array(m).fill(0);
  let prev = 1;
  for (let k = m - 1; k >= 0; k--) {
    const val = Math.min(prev, (idx[k].p * m) / (k + 1));
    prev = val;
    adj[idx[k].i] = Math.min(1, val);
  }
  return adj;
}

/** Cohen's d effect size for paired samples. */
export function cohensD(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n < 2) return 0;
  const diffs = Array.from({ length: n }, (_, i) => a[i] - b[i]);
  const mean = diffs.reduce((s, v) => s + v, 0) / n;
  const sd = Math.sqrt(diffs.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1));
  return sd === 0 ? 0 : mean / sd;
}

/** Deterministic synthetic per-item score vector for a model of known macro-F1. */
export function syntheticScores(macroF1: number, n = 400, seed = 11): number[] {
  const rand = seededRandom(seed);
  return Array.from({ length: n }, () => {
    const noise = (rand() + rand() + rand()) / 3 - 0.5; // approx normal, mean 0
    return Math.min(1, Math.max(0, macroF1 + noise * 0.35));
  });
}
