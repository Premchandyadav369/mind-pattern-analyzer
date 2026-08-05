// Longitudinal cognitive profile built from the local analysis history.
// Pure functions so the profile can be regression-tested headlessly.

export interface ProfileEntry {
  analyzedAt: string | Date;
  biases: { biasType: string; confidence: number; severity?: string }[];
}

export interface BiasFrequency {
  biasType: string;
  count: number;
  share: number;
  avgConfidence: number;
}

export interface CognitiveProfile {
  totalAnalyses: number;
  totalDetections: number;
  avgBiasesPerAnalysis: number;
  avgConfidence: number;
  dominant: BiasFrequency[];
  severityMix: { low: number; medium: number; high: number };
  /** -1 (improving) … +1 (worsening); compares first vs. second half of history. */
  trend: number;
  trendLabel: "improving" | "stable" | "worsening";
  /** Std-dev of biases-per-analysis, normalised 0..1. */
  volatility: number;
  cleanRate: number;
  recommendations: string[];
}

const round = (n: number, d = 2) => Number(n.toFixed(d));

export function buildCognitiveProfile(entries: ProfileEntry[]): CognitiveProfile {
  const total = entries.length;
  const counts = new Map<string, { count: number; conf: number }>();
  const severity = { low: 0, medium: 0, high: 0 };
  let detections = 0;
  let confSum = 0;
  let clean = 0;

  entries.forEach((e) => {
    const biases = e.biases ?? [];
    if (biases.length === 0) clean += 1;
    biases.forEach((b) => {
      detections += 1;
      confSum += b.confidence ?? 0;
      const prev = counts.get(b.biasType) ?? { count: 0, conf: 0 };
      counts.set(b.biasType, { count: prev.count + 1, conf: prev.conf + (b.confidence ?? 0) });
      const s = (b.severity as keyof typeof severity) ?? "medium";
      if (s in severity) severity[s] += 1;
    });
  });

  const dominant: BiasFrequency[] = [...counts.entries()]
    .map(([biasType, v]) => ({
      biasType,
      count: v.count,
      share: detections ? round(v.count / detections) : 0,
      avgConfidence: round(v.conf / v.count),
    }))
    .sort((a, b) => b.count - a.count || a.biasType.localeCompare(b.biasType));

  const perAnalysis = entries.map((e) => (e.biases ?? []).length);
  const mean = total ? perAnalysis.reduce((a, b) => a + b, 0) / total : 0;
  const variance = total
    ? perAnalysis.reduce((a, b) => a + (b - mean) ** 2, 0) / total
    : 0;
  const volatility = mean > 0 ? round(Math.min(1, Math.sqrt(variance) / (mean + 1))) : 0;

  // History is newest-first in the app; compare recent half vs. older half.
  const half = Math.floor(total / 2);
  const recent = perAnalysis.slice(0, half);
  const older = perAnalysis.slice(total - half);
  const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
  const diff = avg(recent) - avg(older);
  const trend = half === 0 ? 0 : round(Math.max(-1, Math.min(1, diff / Math.max(1, avg(older) || 1))));
  const trendLabel = trend <= -0.15 ? "improving" : trend >= 0.15 ? "worsening" : "stable";

  const recommendations: string[] = [];
  if (dominant[0]) {
    recommendations.push(
      `Your most recurrent pattern is ${dominant[0].biasType} (${Math.round(dominant[0].share * 100)}% of detections). Challenge it with a counter-evidence prompt before writing.`
    );
  }
  if (severity.high > 0) {
    recommendations.push(`${severity.high} high-severity detection(s) — revisit those passages and rewrite the strongest claims.`);
  }
  if (trendLabel === "worsening") recommendations.push("Bias density is rising across recent analyses. Slow down and re-read before submitting.");
  if (trendLabel === "improving") recommendations.push("Bias density is falling — your recent edits are working. Keep the same review habit.");
  if (volatility > 0.5) recommendations.push("Your results swing a lot between texts; consistency improves with a fixed pre-writing checklist.");
  if (total === 0) recommendations.push("Run a few analyses to unlock your cognitive profile.");

  return {
    totalAnalyses: total,
    totalDetections: detections,
    avgBiasesPerAnalysis: round(mean),
    avgConfidence: detections ? round(confSum / detections) : 0,
    dominant,
    severityMix: severity,
    trend,
    trendLabel,
    volatility,
    cleanRate: total ? round(clean / total) : 0,
    recommendations,
  };
}

export function profileToMarkdown(p: CognitiveProfile): string {
  const lines = [
    "# MindTrace AI — Cognitive Profile",
    "",
    `- Analyses: ${p.totalAnalyses}`,
    `- Detections: ${p.totalDetections} (avg ${p.avgBiasesPerAnalysis} per analysis)`,
    `- Mean confidence: ${(p.avgConfidence * 100).toFixed(0)}%`,
    `- Bias-free analyses: ${(p.cleanRate * 100).toFixed(0)}%`,
    `- Trend: ${p.trendLabel} (${p.trend >= 0 ? "+" : ""}${p.trend})`,
    `- Volatility: ${p.volatility}`,
    "",
    "## Dominant patterns",
    ...p.dominant.slice(0, 8).map(
      (d) => `- ${d.biasType}: ${d.count} (${(d.share * 100).toFixed(0)}%), avg conf ${(d.avgConfidence * 100).toFixed(0)}%`
    ),
    "",
    "## Recommendations",
    ...p.recommendations.map((r) => `- ${r}`),
  ];
  return lines.join("\n");
}
