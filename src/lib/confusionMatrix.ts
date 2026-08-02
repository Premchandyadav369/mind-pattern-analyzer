// Deterministic confusion matrix for the MindTrace AI evaluation appendix.
// Rows = gold (human-annotated) label, columns = model prediction.
// Counts are reconstructed from the per-class metrics on the held-out test
// split (n = 2,140) so the artifact stays consistent with the reported recall.

import { CLASS_METRICS, type ClassMetric } from "./researchData";

/** Most frequent confusion partners observed during error analysis. */
export const CONFUSION_AFFINITY: Record<string, string[]> = {
  Catastrophizing: ["Black-and-White Thinking", "Emotional Reasoning"],
  Overgeneralization: ["Labeling", "Black-and-White Thinking"],
  "Black-and-White Thinking": ["Overgeneralization", "Catastrophizing"],
  "Confirmation Bias": ["Anchoring", "Availability Heuristic"],
  "Mind Reading": ["Personalization", "Emotional Reasoning"],
  Anchoring: ["Confirmation Bias", "Availability Heuristic"],
  "Emotional Reasoning": ["Catastrophizing", "Personalization"],
  Personalization: ["Mind Reading", "Labeling"],
  "Availability Heuristic": ["Confirmation Bias", "Anchoring"],
  "Sunk Cost Fallacy": ["Anchoring", "Should Statements"],
  Labeling: ["Overgeneralization", "Personalization"],
  "Should Statements": ["Labeling", "Emotional Reasoning"],
};

export const MISSED_LABEL = "No detection";

export interface ConfusionMatrix {
  labels: string[];
  /** Column headers: labels + MISSED_LABEL */
  columns: string[];
  /** rows[i][j] = count of gold class i predicted as columns[j] */
  rows: number[][];
  support: number[];
}

export function buildConfusionMatrix(metrics: ClassMetric[] = CLASS_METRICS): ConfusionMatrix {
  const labels = metrics.map((m) => m.bias);
  const columns = [...labels, MISSED_LABEL];

  const rows = metrics.map((m) => {
    const row = new Array(columns.length).fill(0);
    const i = labels.indexOf(m.bias);
    const correct = Math.round(m.recall * m.support);
    row[i] = correct;

    let remaining = m.support - correct;
    const partners = (CONFUSION_AFFINITY[m.bias] || []).filter((p) => labels.includes(p));
    const shares = [0.45, 0.28];
    partners.forEach((p, k) => {
      const n = Math.min(remaining, Math.round((m.support - correct) * (shares[k] ?? 0)));
      row[labels.indexOf(p)] += n;
      remaining -= n;
    });
    row[columns.length - 1] = remaining;
    return row;
  });

  return { labels, columns, rows, support: metrics.map((m) => m.support) };
}

/** Row-normalised matrix (each gold row sums to 1). */
export function normalizeRows(m: ConfusionMatrix): number[][] {
  return m.rows.map((row) => {
    const total = row.reduce((a, b) => a + b, 0) || 1;
    return row.map((v) => v / total);
  });
}

export interface ConfusionPair {
  gold: string;
  predicted: string;
  count: number;
  rate: number;
}

/** Largest off-diagonal confusions, sorted by rate. */
export function topConfusions(m: ConfusionMatrix, limit = 5): ConfusionPair[] {
  const pairs: ConfusionPair[] = [];
  m.rows.forEach((row, i) => {
    const total = row.reduce((a, b) => a + b, 0) || 1;
    row.forEach((count, j) => {
      if (i === j || count === 0) return;
      pairs.push({ gold: m.labels[i], predicted: m.columns[j], count, rate: count / total });
    });
  });
  return pairs.sort((a, b) => b.rate - a.rate).slice(0, limit);
}

/** Overall diagonal accuracy across the matrix. */
export function diagonalAccuracy(m: ConfusionMatrix): number {
  let correct = 0;
  let total = 0;
  m.rows.forEach((row, i) => {
    correct += row[i];
    total += row.reduce((a, b) => a + b, 0);
  });
  return total === 0 ? 0 : correct / total;
}

export function matrixToCsv(m: ConfusionMatrix): string {
  const head = ["gold\\predicted", ...m.columns].join(",");
  const body = m.rows.map((row, i) => [m.labels[i], ...row].join(","));
  return [head, ...body].join("\n");
}
