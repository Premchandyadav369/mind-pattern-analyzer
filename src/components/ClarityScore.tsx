import { motion } from "framer-motion";
import { Gauge, TrendingUp, TrendingDown } from "lucide-react";
import type { AnalysisResult } from "@/lib/biasAnalyzer";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  result: AnalysisResult;
}

export function computeClarityScore(result: AnalysisResult): number {
  const biasPenalty = result.biases.reduce((sum, b) => {
    const sevWeight = b.severity === "high" ? 18 : b.severity === "medium" ? 11 : 6;
    return sum + sevWeight * b.confidence;
  }, 0);
  const coherence = result.nlpMetrics?.logicalCoherence ?? 70;
  const intensity = result.nlpMetrics?.emotionalIntensity ?? 50;
  const base = coherence * 0.6 + (100 - intensity) * 0.4;
  return Math.max(0, Math.min(100, Math.round(base - biasPenalty)));
}

const ClarityScore = ({ result }: Props) => {
  const { isQuantum } = useTheme();
  const score = computeClarityScore(result);
  const label =
    score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Cloudy" : "Distorted";
  const colorClass =
    score >= 80
      ? "text-secondary"
      : score >= 60
      ? "text-primary"
      : score >= 40
      ? "text-accent"
      : "text-destructive";

  const circumference = 2 * Math.PI * 56;
  const offset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-2xl p-6`}
    >
      <div className="flex items-center gap-2 mb-5">
        <Gauge className="w-4 h-4 text-primary" />
        <h3 className="font-display font-semibold text-sm">Cognitive Clarity Score</h3>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32 shrink-0">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="hsl(var(--border))"
              strokeWidth="8"
              fill="none"
              opacity="0.3"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className={colorClass}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-display text-3xl font-bold ${colorClass}`}>{score}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">/ 100</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            {score >= 60 ? (
              <TrendingUp className="w-4 h-4 text-secondary" />
            ) : (
              <TrendingDown className="w-4 h-4 text-accent" />
            )}
            <span className={`font-display font-semibold text-base ${colorClass}`}>{label}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Composite signal from logical coherence, emotional intensity, and detected bias load.
            Higher scores indicate clearer, more objective reasoning.
          </p>
          <div className="grid grid-cols-3 gap-2 pt-2">
            <Stat label="Biases" value={result.biases.length} />
            <Stat label="Coherence" value={`${result.nlpMetrics?.logicalCoherence ?? "—"}`} />
            <Stat label="Intensity" value={`${result.nlpMetrics?.emotionalIntensity ?? "—"}`} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-lg border border-border/40 bg-muted/20 px-2 py-1.5">
    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
    <div className="font-mono text-sm font-semibold text-foreground">{value}</div>
  </div>
);

export default ClarityScore;
