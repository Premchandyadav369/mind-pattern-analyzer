/**
 * Temporal drift analytics over the local analysis history.
 * Pure functions: bucketing, prevalence series, PSI, Mann-Kendall trend, CUSUM.
 */

export interface DriftEntry {
  analyzedAt: string | Date;
  biases: { biasType: string; confidence: number; severity?: string }[];
}

export interface DriftBucket {
  key: string;
  start: number;
  analyses: number;
  detections: number;
  avgBiases: number;
  avgConfidence: number;
  prevalence: Record<string, number>;
}

const DAY = 86_400_000;

export function bucketHistory(entries: DriftEntry[], bucketDays = 1): DriftBucket[] {
  const size = Math.max(1, bucketDays) * DAY;
  const map = new Map<number, DriftEntry[]>();
  entries.forEach((e) => {
    const t = new Date(e.analyzedAt).getTime();
    if (!Number.isFinite(t)) return;
    const start = Math.floor(t / size) * size;
    map.set(start, [...(map.get(start) ?? []), e]);
  });

  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([start, items]) => {
      const detections = items.reduce((s, e) => s + (e.biases?.length ?? 0), 0);
      const confSum = items.reduce(
        (s, e) => s + (e.biases ?? []).reduce((x, b) => x + (b.confidence ?? 0), 0),
        0,
      );
      const prevalence: Record<string, number> = {};
      items.forEach((e) =>
        (e.biases ?? []).forEach((b) => {
          prevalence[b.biasType] = (prevalence[b.biasType] ?? 0) + 1;
        }),
      );
      Object.keys(prevalence).forEach((k) => {
        prevalence[k] = prevalence[k] / items.length;
      });
      return {
        key: new Date(start).toISOString().slice(0, 10),
        start,
        analyses: items.length,
        detections,
        avgBiases: detections / items.length,
        avgConfidence: detections ? confSum / detections : 0,
        prevalence,
      };
    });
}

/** Population Stability Index between two categorical distributions. */
export function psi(reference: Record<string, number>, current: Record<string, number>): number {
  const keys = new Set([...Object.keys(reference), ...Object.keys(current)]);
  const sum = (o: Record<string, number>) => Object.values(o).reduce((s, v) => s + v, 0) || 1;
  const rs = sum(reference);
  const cs = sum(current);
  let total = 0;
  keys.forEach((k) => {
    const r = Math.max((reference[k] ?? 0) / rs, 1e-6);
    const c = Math.max((current[k] ?? 0) / cs, 1e-6);
    total += (c - r) * Math.log(c / r);
  });
  return total;
}

export function interpretPsi(v: number): "stable" | "moderate drift" | "significant drift" {
  if (v < 0.1) return "stable";
  if (v < 0.25) return "moderate drift";
  return "significant drift";
}

export interface MannKendall {
  s: number;
  z: number;
  pValue: number;
  tau: number;
  trend: "increasing" | "decreasing" | "no trend";
}

/** Non-parametric Mann-Kendall trend test for a time-ordered series. */
export function mannKendall(series: number[], alpha = 0.05): MannKendall {
  const n = series.length;
  if (n < 3) return { s: 0, z: 0, pValue: 1, tau: 0, trend: "no trend" };
  let s = 0;
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) s += Math.sign(series[j] - series[i]);
  }
  const varS = (n * (n - 1) * (2 * n + 5)) / 18;
  const z = s > 0 ? (s - 1) / Math.sqrt(varS) : s < 0 ? (s + 1) / Math.sqrt(varS) : 0;
  const pValue = 2 * (1 - normalCdf(Math.abs(z)));
  const tau = (2 * s) / (n * (n - 1));
  const trend = pValue < alpha ? (s > 0 ? "increasing" : "decreasing") : "no trend";
  return { s, z, pValue, tau, trend };
}

function normalCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  const p = d * t * (1.330274429 * t ** 4 - 1.821255978 * t ** 3 + 1.781477937 * t ** 2 - 0.356563782 * t + 0.319381530);
  return x > 0 ? 1 - p : p;
}

export interface CusumPoint {
  index: number;
  value: number;
  high: number;
  low: number;
  alarm: boolean;
}

/** Two-sided CUSUM change detector over a series (k = slack, h = threshold in sigmas). */
export function cusum(series: number[], k = 0.5, h = 4): CusumPoint[] {
  const n = series.length;
  if (n === 0) return [];
  const mean = series.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(series.reduce((s, v) => s + (v - mean) ** 2, 0) / n) || 1e-9;
  let hi = 0;
  let lo = 0;
  return series.map((value, index) => {
    const z = (value - mean) / sd;
    hi = Math.max(0, hi + z - k);
    lo = Math.max(0, lo - z - k);
    return { index, value, high: hi, low: lo, alarm: hi > h || lo > h };
  });
}

export interface DriftReport {
  buckets: DriftBucket[];
  psi: number;
  psiLabel: ReturnType<typeof interpretPsi>;
  volumeTrend: MannKendall;
  confidenceTrend: MannKendall;
  alarms: number[];
  rising: { biasType: string; delta: number }[];
  falling: { biasType: string; delta: number }[];
}

export function driftReport(entries: DriftEntry[], bucketDays = 1): DriftReport {
  const buckets = bucketHistory(entries, bucketDays);
  const half = Math.floor(buckets.length / 2);
  const agg = (bs: DriftBucket[]) => {
    const out: Record<string, number> = {};
    bs.forEach((b) => Object.entries(b.prevalence).forEach(([k, v]) => (out[k] = (out[k] ?? 0) + v)));
    return out;
  };
  const ref = agg(buckets.slice(0, half));
  const cur = agg(buckets.slice(half));
  const norm = (o: Record<string, number>) => {
    const s = Object.values(o).reduce((a, b) => a + b, 0) || 1;
    return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v / s]));
  };
  const rn = norm(ref);
  const cn = norm(cur);
  const deltas = [...new Set([...Object.keys(rn), ...Object.keys(cn)])]
    .map((biasType) => ({ biasType, delta: (cn[biasType] ?? 0) - (rn[biasType] ?? 0) }))
    .sort((a, b) => b.delta - a.delta);

  const value = psi(ref, cur);
  return {
    buckets,
    psi: value,
    psiLabel: interpretPsi(value),
    volumeTrend: mannKendall(buckets.map((b) => b.avgBiases)),
    confidenceTrend: mannKendall(buckets.map((b) => b.avgConfidence)),
    alarms: cusum(buckets.map((b) => b.avgBiases)).filter((p) => p.alarm).map((p) => p.index),
    rising: deltas.filter((d) => d.delta > 0.01).slice(0, 5),
    falling: deltas.filter((d) => d.delta < -0.01).reverse().slice(0, 5),
  };
}
