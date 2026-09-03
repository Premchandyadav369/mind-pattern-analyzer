/**
 * Frequentist power / sample-size planning utilities for MindTrace evaluations.
 * Two-proportion (accuracy) comparisons and paired-difference designs.
 */

/** Standard normal CDF via an Abramowitz & Stegun erf approximation. */
export const normalCdf = (z: number): number => {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp((-z * z) / 2);
  const p =
    d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z > 0 ? 1 - p : p;
};

/** Inverse normal CDF (Acklam's rational approximation). */
export const normalQuantile = (p: number): number => {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const pl = 0.02425;
  let q: number, r: number;
  if (p < pl) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p > 1 - pl) return -normalQuantile(1 - p);
  q = p - 0.5;
  r = q * q;
  return (
    ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
    (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
  );
};

export interface PowerInput {
  /** Baseline accuracy / macro-F1 proportion, 0-1 */
  p1: number;
  /** Proposed system proportion, 0-1 */
  p2: number;
  /** Significance level, e.g. 0.05 */
  alpha: number;
  /** Target power, e.g. 0.8 */
  power: number;
  /** true = two-sided test */
  twoSided: boolean;
}

/** Required n per group for a two-proportion z-test. */
export const sampleSizePerGroup = (i: PowerInput): number => {
  const diff = Math.abs(i.p2 - i.p1);
  if (diff === 0) return Infinity;
  const zA = normalQuantile(1 - i.alpha / (i.twoSided ? 2 : 1));
  const zB = normalQuantile(i.power);
  const pBar = (i.p1 + i.p2) / 2;
  const num =
    zA * Math.sqrt(2 * pBar * (1 - pBar)) + zB * Math.sqrt(i.p1 * (1 - i.p1) + i.p2 * (1 - i.p2));
  return Math.ceil((num / diff) ** 2);
};

/** Achieved power for a given per-group n. */
export const achievedPower = (i: Omit<PowerInput, "power">, n: number): number => {
  const diff = Math.abs(i.p2 - i.p1);
  if (n <= 0) return 0;
  const zA = normalQuantile(1 - i.alpha / (i.twoSided ? 2 : 1));
  const pBar = (i.p1 + i.p2) / 2;
  const se0 = Math.sqrt((2 * pBar * (1 - pBar)) / n);
  const se1 = Math.sqrt((i.p1 * (1 - i.p1) + i.p2 * (1 - i.p2)) / n);
  if (se1 === 0) return diff > 0 ? 1 : 0;
  return normalCdf((diff - zA * se0) / se1);
};

/** Minimum detectable effect (absolute) at a given n. */
export const minDetectableEffect = (
  p1: number,
  n: number,
  alpha: number,
  power: number,
  twoSided = true,
): number => {
  let lo = 0;
  let hi = Math.min(1 - p1, p1) || 0.5;
  hi = Math.max(hi, 0.0001);
  for (let k = 0; k < 60; k++) {
    const mid = (lo + hi) / 2;
    const pw = achievedPower({ p1, p2: Math.min(0.9999, p1 + mid), alpha, twoSided }, n);
    if (pw < power) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
};

/** Wilson score interval for a proportion — preferred over Wald at extremes. */
export const wilsonInterval = (p: number, n: number, alpha = 0.05): [number, number] => {
  if (n <= 0) return [0, 1];
  const z = normalQuantile(1 - alpha / 2);
  const denom = 1 + (z * z) / n;
  const center = (p + (z * z) / (2 * n)) / denom;
  const margin = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / denom;
  return [Math.max(0, center - margin), Math.min(1, center + margin)];
};
