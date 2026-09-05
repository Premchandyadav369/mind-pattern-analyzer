/**
 * Group fairness metrics for bias-classifier auditing.
 * All estimators are pure and operate on (group, yTrue, yPred) triples.
 */

export interface FairnessSample {
  group: string;
  yTrue: 0 | 1 | boolean;
  yPred: 0 | 1 | boolean;
}

export interface GroupStats {
  group: string;
  n: number;
  tp: number;
  fp: number;
  tn: number;
  fn: number;
  positiveRate: number;
  tpr: number;
  fpr: number;
  precision: number;
  accuracy: number;
}

const bin = (v: 0 | 1 | boolean) => (v === true || v === 1 ? 1 : 0);

export function groupStats(samples: FairnessSample[]): GroupStats[] {
  const map = new Map<string, FairnessSample[]>();
  samples.forEach((s) => map.set(s.group, [...(map.get(s.group) ?? []), s]));
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([group, items]) => {
      let tp = 0;
      let fp = 0;
      let tn = 0;
      let fn = 0;
      items.forEach((s) => {
        const t = bin(s.yTrue);
        const p = bin(s.yPred);
        if (t === 1 && p === 1) tp += 1;
        else if (t === 0 && p === 1) fp += 1;
        else if (t === 0 && p === 0) tn += 1;
        else fn += 1;
      });
      const n = items.length;
      return {
        group,
        n,
        tp,
        fp,
        tn,
        fn,
        positiveRate: n ? (tp + fp) / n : 0,
        tpr: tp + fn ? tp / (tp + fn) : 0,
        fpr: fp + tn ? fp / (fp + tn) : 0,
        precision: tp + fp ? tp / (tp + fp) : 0,
        accuracy: n ? (tp + tn) / n : 0,
      };
    });
}

export interface FairnessReport {
  groups: GroupStats[];
  /** max - min selection rate. 0 = perfect demographic parity. */
  demographicParityDifference: number;
  /** min/max selection rate. 1 = parity; <0.8 fails the four-fifths rule. */
  disparateImpactRatio: number;
  /** max gap in TPR across groups (equal opportunity). */
  equalOpportunityDifference: number;
  /** max of the TPR gap and the FPR gap (equalized odds). */
  equalizedOddsDifference: number;
  accuracyDifference: number;
  fourFifthsPass: boolean;
  worstGroup?: string;
  bestGroup?: string;
}

const spread = (vals: number[]) => (vals.length ? Math.max(...vals) - Math.min(...vals) : 0);

export function fairnessReport(samples: FairnessSample[]): FairnessReport {
  const groups = groupStats(samples);
  const rates = groups.map((g) => g.positiveRate);
  const maxRate = rates.length ? Math.max(...rates) : 0;
  const minRate = rates.length ? Math.min(...rates) : 0;
  const tprGap = spread(groups.map((g) => g.tpr));
  const fprGap = spread(groups.map((g) => g.fpr));
  const di = maxRate > 0 ? minRate / maxRate : 1;
  const sortedAcc = [...groups].sort((a, b) => a.accuracy - b.accuracy);

  return {
    groups,
    demographicParityDifference: maxRate - minRate,
    disparateImpactRatio: di,
    equalOpportunityDifference: tprGap,
    equalizedOddsDifference: Math.max(tprGap, fprGap),
    accuracyDifference: spread(groups.map((g) => g.accuracy)),
    fourFifthsPass: di >= 0.8,
    worstGroup: sortedAcc[0]?.group,
    bestGroup: sortedAcc[sortedAcc.length - 1]?.group,
  };
}
