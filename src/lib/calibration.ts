// Calibration, threshold tuning and disagreement analytics for MindTrace AI.
// Pure functions so they can be regression-tested headlessly.

import type { FeedbackRecord } from "./feedback";

export interface CalibrationSample {
  /** Model confidence in [0,1] */
  confidence: number;
  /** Ground-truth correctness in [0,1] (partial credit allowed) */
  outcome: number;
  biasType?: string;
  excerpt?: string;
}

export const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

/** Human verdicts -> graded correctness used by every metric below. */
export const verdictOutcome = (verdict: FeedbackRecord["verdict"]): number =>
  verdict === "correct" ? 1 : verdict === "partial" ? 0.5 : 0;

export function toCalibrationSamples(records: FeedbackRecord[]): CalibrationSample[] {
  return records.map((r) => ({
    confidence: clamp01(r.confidence),
    outcome: verdictOutcome(r.verdict),
    biasType: r.biasType,
    excerpt: r.excerpt,
  }));
}

export interface ReliabilityBin {
  lo: number;
  hi: number;
  count: number;
  avgConfidence: number;
  accuracy: number;
  /** accuracy - confidence: negative = overconfident */
  gap: number;
}

export function reliabilityBins(samples: CalibrationSample[], nBins = 10): ReliabilityBin[] {
  const bins: ReliabilityBin[] = Array.from({ length: nBins }, (_, i) => ({
    lo: i / nBins,
    hi: (i + 1) / nBins,
    count: 0,
    avgConfidence: 0,
    accuracy: 0,
    gap: 0,
  }));

  for (const s of samples) {
    const c = clamp01(s.confidence);
    const idx = Math.min(nBins - 1, Math.floor(c * nBins));
    const b = bins[idx];
    b.count += 1;
    b.avgConfidence += c;
    b.accuracy += clamp01(s.outcome);
  }

  for (const b of bins) {
    if (b.count > 0) {
      b.avgConfidence /= b.count;
      b.accuracy /= b.count;
      b.gap = b.accuracy - b.avgConfidence;
    }
  }
  return bins;
}

/** Expected Calibration Error (support-weighted mean |accuracy - confidence|). */
export function expectedCalibrationError(samples: CalibrationSample[], nBins = 10): number {
  if (!samples.length) return 0;
  const bins = reliabilityBins(samples, nBins);
  return bins.reduce((a, b) => a + (b.count / samples.length) * Math.abs(b.gap), 0);
}

/** Maximum Calibration Error across populated bins. */
export function maximumCalibrationError(samples: CalibrationSample[], nBins = 10): number {
  const bins = reliabilityBins(samples, nBins).filter((b) => b.count > 0);
  return bins.reduce((a, b) => Math.max(a, Math.abs(b.gap)), 0);
}

/** Brier score (lower is better). */
export function brierScore(samples: CalibrationSample[]): number {
  if (!samples.length) return 0;
  return (
    samples.reduce((a, s) => a + (clamp01(s.confidence) - clamp01(s.outcome)) ** 2, 0) /
    samples.length
  );
}

/** Mean confidence minus mean accuracy. Positive = systematically overconfident. */
export function overconfidence(samples: CalibrationSample[]): number {
  if (!samples.length) return 0;
  const mc = samples.reduce((a, s) => a + clamp01(s.confidence), 0) / samples.length;
  const ma = samples.reduce((a, s) => a + clamp01(s.outcome), 0) / samples.length;
  return mc - ma;
}

export interface ThresholdPoint {
  threshold: number;
  kept: number;
  tp: number;
  fp: number;
  fn: number;
  precision: number;
  recall: number;
  f1: number;
  /** Share of predictions surfaced to the user at this threshold. */
  coverage: number;
}

/**
 * Sweeps a decision threshold over model confidence.
 * Predictions below the threshold are suppressed; suppressed-but-correct
 * predictions become false negatives.
 */
export function sweepThresholds(samples: CalibrationSample[], step = 0.05): ThresholdPoint[] {
  const points: ThresholdPoint[] = [];
  const totalPositive = samples.reduce((a, s) => a + clamp01(s.outcome), 0);

  for (let t = 0; t <= 1.0001; t += step) {
    const threshold = Math.round(t * 1000) / 1000;
    const kept = samples.filter((s) => clamp01(s.confidence) >= threshold);
    const tp = kept.reduce((a, s) => a + clamp01(s.outcome), 0);
    const fp = kept.reduce((a, s) => a + (1 - clamp01(s.outcome)), 0);
    const fn = Math.max(0, totalPositive - tp);
    const precision = kept.length ? tp / kept.length : 0;
    const recall = totalPositive ? tp / totalPositive : 0;
    const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
    points.push({
      threshold,
      kept: kept.length,
      tp,
      fp,
      fn,
      precision,
      recall,
      f1,
      coverage: samples.length ? kept.length / samples.length : 0,
    });
  }
  return points;
}

/** Threshold maximising F1 (ties broken by higher precision). */
export function bestThreshold(points: ThresholdPoint[]): ThresholdPoint | null {
  if (!points.length) return null;
  return points.reduce((best, p) =>
    p.f1 > best.f1 || (p.f1 === best.f1 && p.precision > best.precision) ? p : best
  );
}

export interface DisagreementPair {
  from: string;
  to: string;
  count: number;
  avgConfidence: number;
  /** Mean confidence of wrong calls — high values mark dangerous failures. */
  severity: number;
}

export interface DisagreementCase {
  biasType: string;
  correctedLabel?: string;
  confidence: number;
  excerpt: string;
  note?: string;
  createdAt: string;
}

export interface DisagreementReport {
  totalDisagreements: number;
  disagreementRate: number;
  /** Wrong calls made with confidence >= 0.7 */
  highConfidenceErrors: DisagreementCase[];
  pairs: DisagreementPair[];
  worstClasses: { biasType: string; errors: number; total: number; errorRate: number }[];
  avgConfidenceCorrect: number;
  avgConfidenceWrong: number;
}

export function analyzeDisagreements(
  records: FeedbackRecord[],
  highConfidenceCutoff = 0.7
): DisagreementReport {
  const wrong = records.filter((r) => r.verdict !== "correct");
  const right = records.filter((r) => r.verdict === "correct");

  const pairMap = new Map<string, DisagreementPair>();
  for (const r of wrong) {
    const to = r.correctedLabel?.trim() || "(no label given)";
    const key = `${r.biasType}->${to}`;
    const entry = pairMap.get(key) ?? { from: r.biasType, to, count: 0, avgConfidence: 0, severity: 0 };
    entry.avgConfidence = (entry.avgConfidence * entry.count + clamp01(r.confidence)) / (entry.count + 1);
    entry.count += 1;
    entry.severity = entry.count * entry.avgConfidence;
    pairMap.set(key, entry);
  }

  const classMap = new Map<string, { biasType: string; errors: number; total: number; errorRate: number }>();
  for (const r of records) {
    const e = classMap.get(r.biasType) ?? { biasType: r.biasType, errors: 0, total: 0, errorRate: 0 };
    e.total += 1;
    if (r.verdict !== "correct") e.errors += 1;
    e.errorRate = e.errors / e.total;
    classMap.set(r.biasType, e);
  }

  const mean = (xs: FeedbackRecord[]) =>
    xs.length ? xs.reduce((a, r) => a + clamp01(r.confidence), 0) / xs.length : 0;

  return {
    totalDisagreements: wrong.length,
    disagreementRate: records.length ? wrong.length / records.length : 0,
    highConfidenceErrors: wrong
      .filter((r) => clamp01(r.confidence) >= highConfidenceCutoff)
      .sort((a, b) => b.confidence - a.confidence)
      .map((r) => ({
        biasType: r.biasType,
        correctedLabel: r.correctedLabel,
        confidence: clamp01(r.confidence),
        excerpt: r.excerpt,
        note: r.note,
        createdAt: r.createdAt,
      })),
    pairs: [...pairMap.values()].sort((a, b) => b.severity - a.severity),
    worstClasses: [...classMap.values()]
      .filter((c) => c.errors > 0)
      .sort((a, b) => b.errorRate - a.errorRate || b.errors - a.errors),
    avgConfidenceCorrect: mean(right),
    avgConfidenceWrong: mean(wrong),
  };
}

const THRESHOLD_KEY = "mindtrace:threshold:v1";
export const DEFAULT_THRESHOLD = 0.35;

export function loadThreshold(): number {
  if (typeof window === "undefined") return DEFAULT_THRESHOLD;
  const raw = window.localStorage.getItem(THRESHOLD_KEY);
  const n = raw === null ? NaN : Number(raw);
  return Number.isFinite(n) ? clamp01(n) : DEFAULT_THRESHOLD;
}

export function saveThreshold(value: number): number {
  const v = clamp01(value);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(THRESHOLD_KEY, String(v));
    window.dispatchEvent(new CustomEvent("mindtrace:threshold", { detail: v }));
  }
  return v;
}
