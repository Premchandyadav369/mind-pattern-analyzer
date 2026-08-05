// A/B comparison metrics between two analysed passages.
// Pure functions — regression-tested headlessly.

export interface ComparableBias {
  biasType: string;
  confidence: number;
  severity?: string;
}

export interface ComparisonRow {
  biasType: string;
  a: number | null;
  b: number | null;
  delta: number;
  status: "only-a" | "only-b" | "shared";
}

export interface ComparisonSummary {
  rows: ComparisonRow[];
  countA: number;
  countB: number;
  avgConfidenceA: number;
  avgConfidenceB: number;
  /** Jaccard overlap of the two bias label sets (0..1). */
  overlap: number;
  /** Weighted bias load: sum of confidences. */
  loadA: number;
  loadB: number;
  /** Negative means B is cleaner than A. */
  loadDelta: number;
  winner: "a" | "b" | "tie";
  headline: string;
}

const r2 = (n: number) => Number(n.toFixed(2));

const mapOf = (list: ComparableBias[]) => {
  const m = new Map<string, number>();
  list.forEach((b) => m.set(b.biasType, Math.max(m.get(b.biasType) ?? 0, b.confidence ?? 0)));
  return m;
};

export function compareAnalyses(
  aBiases: ComparableBias[],
  bBiases: ComparableBias[],
  labelA = "A",
  labelB = "B"
): ComparisonSummary {
  const a = mapOf(aBiases ?? []);
  const b = mapOf(bBiases ?? []);
  const labels = [...new Set([...a.keys(), ...b.keys()])].sort();

  const rows: ComparisonRow[] = labels.map((biasType) => {
    const av = a.has(biasType) ? r2(a.get(biasType)!) : null;
    const bv = b.has(biasType) ? r2(b.get(biasType)!) : null;
    return {
      biasType,
      a: av,
      b: bv,
      delta: r2((bv ?? 0) - (av ?? 0)),
      status: av !== null && bv !== null ? "shared" : av !== null ? "only-a" : "only-b",
    };
  });

  const sum = (m: Map<string, number>) => [...m.values()].reduce((x, y) => x + y, 0);
  const loadA = r2(sum(a));
  const loadB = r2(sum(b));
  const shared = labels.filter((l) => a.has(l) && b.has(l)).length;
  const overlap = labels.length ? r2(shared / labels.length) : 1;
  const loadDelta = r2(loadB - loadA);

  const winner = Math.abs(loadDelta) < 0.15 ? "tie" : loadDelta < 0 ? "b" : "a";
  const headline =
    winner === "tie"
      ? `${labelA} and ${labelB} carry a comparable bias load.`
      : winner === "b"
        ? `${labelB} is cleaner — bias load drops by ${Math.abs(loadDelta)}.`
        : `${labelA} is cleaner — ${labelB} adds ${loadDelta} of bias load.`;

  return {
    rows,
    countA: a.size,
    countB: b.size,
    avgConfidenceA: a.size ? r2(loadA / a.size) : 0,
    avgConfidenceB: b.size ? r2(loadB / b.size) : 0,
    overlap,
    loadA,
    loadB,
    loadDelta,
    winner,
    headline,
  };
}

export function comparisonToMarkdown(s: ComparisonSummary, labelA = "A", labelB = "B"): string {
  return [
    "# MindTrace AI — A/B Bias Comparison",
    "",
    s.headline,
    "",
    `- ${labelA}: ${s.countA} biases, load ${s.loadA}, mean conf ${s.avgConfidenceA}`,
    `- ${labelB}: ${s.countB} biases, load ${s.loadB}, mean conf ${s.avgConfidenceB}`,
    `- Label overlap (Jaccard): ${s.overlap}`,
    "",
    `| Bias | ${labelA} | ${labelB} | Δ |`,
    "| --- | --- | --- | --- |",
    ...s.rows.map((r) => `| ${r.biasType} | ${r.a ?? "—"} | ${r.b ?? "—"} | ${r.delta >= 0 ? "+" : ""}${r.delta} |`),
  ].join("\n");
}
