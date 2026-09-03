/**
 * Inter-annotator agreement metrics for the MindTrace annotation corpus.
 *
 * Implements observed agreement, Cohen's kappa (2 raters), Fleiss' kappa
 * (m raters, nominal), Krippendorff's alpha (nominal) and Gwet's AC1
 * (robust to the kappa prevalence paradox).
 *
 * Input convention: `ratings` is an items x raters matrix of category labels.
 * `null` marks a missing rating (supported by Krippendorff's alpha only;
 *  other estimators drop rows with missing values).
 */

export type Rating = string | null;
export type RatingMatrix = Rating[][];

export const categoriesOf = (m: RatingMatrix): string[] => {
  const set = new Set<string>();
  m.forEach((row) => row.forEach((r) => r && set.add(r)));
  return [...set].sort();
};

const completeRows = (m: RatingMatrix): string[][] =>
  m.filter((row) => row.every((r) => r !== null && r !== undefined)) as string[][];

/** Proportion of item/rater pairs that agree, averaged over items. */
export const observedAgreement = (m: RatingMatrix): number => {
  const rows = completeRows(m);
  if (!rows.length) return 0;
  let total = 0;
  for (const row of rows) {
    const n = row.length;
    if (n < 2) continue;
    const counts: Record<string, number> = {};
    row.forEach((r) => (counts[r] = (counts[r] ?? 0) + 1));
    const agree = Object.values(counts).reduce((s, c) => s + c * (c - 1), 0);
    total += agree / (n * (n - 1));
  }
  return total / rows.length;
};

/** Cohen's kappa for exactly two raters. */
export const cohensKappa = (a: Rating[], b: Rating[]): number => {
  const pairs = a
    .map((x, i) => [x, b[i]] as const)
    .filter(([x, y]) => x != null && y != null) as [string, string][];
  if (!pairs.length) return 0;
  const n = pairs.length;
  const po = pairs.filter(([x, y]) => x === y).length / n;
  const ca: Record<string, number> = {};
  const cb: Record<string, number> = {};
  pairs.forEach(([x, y]) => {
    ca[x] = (ca[x] ?? 0) + 1;
    cb[y] = (cb[y] ?? 0) + 1;
  });
  const cats = new Set([...Object.keys(ca), ...Object.keys(cb)]);
  let pe = 0;
  cats.forEach((c) => {
    pe += ((ca[c] ?? 0) / n) * ((cb[c] ?? 0) / n);
  });
  if (pe === 1) return 1;
  return (po - pe) / (1 - pe);
};

/** Fleiss' kappa for a fixed number of raters per item. */
export const fleissKappa = (m: RatingMatrix): number => {
  const rows = completeRows(m);
  if (!rows.length) return 0;
  const nRaters = rows[0].length;
  if (nRaters < 2) return 0;
  const cats = categoriesOf(rows);
  const N = rows.length;

  let pBarSum = 0;
  const catTotals: Record<string, number> = {};
  for (const row of rows) {
    const counts: Record<string, number> = {};
    row.forEach((r) => {
      counts[r] = (counts[r] ?? 0) + 1;
      catTotals[r] = (catTotals[r] ?? 0) + 1;
    });
    const sumSq = cats.reduce((s, c) => s + (counts[c] ?? 0) ** 2, 0);
    pBarSum += (sumSq - nRaters) / (nRaters * (nRaters - 1));
  }
  const pBar = pBarSum / N;
  const pe = cats.reduce((s, c) => s + ((catTotals[c] ?? 0) / (N * nRaters)) ** 2, 0);
  if (pe === 1) return 1;
  return (pBar - pe) / (1 - pe);
};

/** Krippendorff's alpha (nominal level), tolerant of missing ratings. */
export const krippendorffAlpha = (m: RatingMatrix): number => {
  const cats = categoriesOf(m);
  if (cats.length <= 1) return 1;

  let totalPairable = 0;
  let disagreeUnits = 0;
  const catTotals: Record<string, number> = {};

  for (const row of m) {
    const vals = row.filter((r): r is string => r != null);
    const mu = vals.length;
    if (mu < 2) continue;
    totalPairable += mu;
    const counts: Record<string, number> = {};
    vals.forEach((v) => {
      counts[v] = (counts[v] ?? 0) + 1;
      catTotals[v] = (catTotals[v] ?? 0) + 1;
    });
    const sumSq = cats.reduce((s, c) => s + (counts[c] ?? 0) ** 2, 0);
    // number of disagreeing pairs within the unit, normalised by (mu - 1)
    disagreeUnits += (mu * mu - sumSq) / (mu - 1);
  }
  if (totalPairable < 2) return 0;

  const Do = disagreeUnits / totalPairable;
  const sumSqTotal = cats.reduce((s, c) => s + (catTotals[c] ?? 0) ** 2, 0);
  const De = (totalPairable * totalPairable - sumSqTotal) / (totalPairable - 1);
  const DeNorm = De / totalPairable;
  if (DeNorm === 0) return 1;
  return 1 - Do / DeNorm;
};

/** Gwet's AC1 — chance-corrected but resistant to the kappa prevalence paradox. */
export const gwetAC1 = (m: RatingMatrix): number => {
  const rows = completeRows(m);
  if (!rows.length) return 0;
  const nRaters = rows[0].length;
  if (nRaters < 2) return 0;
  const cats = categoriesOf(rows);
  const N = rows.length;

  const pa = observedAgreement(rows);
  const pi = cats.map((c) => {
    let s = 0;
    rows.forEach((row) => {
      s += row.filter((r) => r === c).length / nRaters;
    });
    return s / N;
  });
  const K = cats.length;
  if (K < 2) return 1;
  const pe = pi.reduce((s, p) => s + p * (1 - p), 0) / (K - 1);
  if (pe === 1) return 1;
  return (pa - pe) / (1 - pe);
};

/** Landis & Koch (1977) qualitative interpretation bands. */
export const interpretKappa = (k: number): string => {
  if (k < 0) return "Poor (worse than chance)";
  if (k < 0.21) return "Slight";
  if (k < 0.41) return "Fair";
  if (k < 0.61) return "Moderate";
  if (k < 0.81) return "Substantial";
  return "Almost perfect";
};

export interface AgreementReport {
  items: number;
  raters: number;
  categories: string[];
  observed: number;
  fleiss: number;
  alpha: number;
  ac1: number;
  pairwise: { a: string; b: string; kappa: number }[];
}

export const agreementReport = (m: RatingMatrix, raterNames: string[]): AgreementReport => {
  const raters = raterNames.length;
  const pairwise: AgreementReport["pairwise"] = [];
  for (let i = 0; i < raters; i++) {
    for (let j = i + 1; j < raters; j++) {
      pairwise.push({
        a: raterNames[i],
        b: raterNames[j],
        kappa: cohensKappa(
          m.map((row) => row[i]),
          m.map((row) => row[j]),
        ),
      });
    }
  }
  return {
    items: m.length,
    raters,
    categories: categoriesOf(m),
    observed: observedAgreement(m),
    fleiss: fleissKappa(m),
    alpha: krippendorffAlpha(m),
    ac1: gwetAC1(m),
    pairwise,
  };
};
