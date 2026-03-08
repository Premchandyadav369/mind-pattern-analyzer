import { motion } from "framer-motion";
import type { BiasResult } from "@/lib/biasAnalyzer";
import { useTheme } from "@/contexts/ThemeContext";

const COLORS: Record<string, string> = {
  cyan: "hsl(199, 89%, 60%)",
  green: "hsl(142, 71%, 45%)",
  red: "hsl(0, 84%, 60%)",
  orange: "hsl(24, 95%, 53%)",
  purple: "hsl(270, 70%, 60%)",
};

interface TimelineEntry {
  sentenceIndex: number;
  sentence: string;
  biasType: string | null;
  confidence: number;
  color: string;
}

const BiasEvolutionTimeline = ({ biases, text }: { biases: BiasResult[]; text: string }) => {
  const { isQuantum } = useTheme();
  const sentences = text.match(/[^.!?]+[.!?]*/g)?.map((s) => s.trim()).filter(Boolean) || [text];

  const timeline: TimelineEntry[] = sentences.map((sentence, i) => {
    const lower = sentence.toLowerCase();
    let bestBias: BiasResult | null = null;
    let bestScore = 0;

    for (const bias of biases) {
      const matchCount = bias.triggers.filter((t) => lower.includes(t.toLowerCase())).length;
      if (matchCount > 0) {
        const score = matchCount * bias.confidence;
        if (score > bestScore) {
          bestScore = score;
          bestBias = bias;
        }
      }
    }

    return {
      sentenceIndex: i,
      sentence,
      biasType: bestBias?.biasType || null,
      confidence: bestBias ? bestBias.confidence : 0,
      color: bestBias?.color || "cyan",
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-2xl p-6`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">📈</span>
        <h3 className="font-display font-semibold text-foreground">Cognitive Bias Evolution</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-6">
        How biases evolve across sentences in the text — tracking the cognitive trajectory.
      </p>

      {/* Timeline visualization */}
      <div className="relative">
        {/* Central line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-border/50" />

        <div className="space-y-1">
          {timeline.map((entry, i) => {
            const hasBias = entry.biasType !== null;
            const color = COLORS[entry.color];

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-4 relative"
              >
                {/* Node on timeline */}
                <div className="relative z-10 flex-shrink-0 w-12 flex justify-center pt-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.08 + 0.2, type: "spring" }}
                    className="w-3 h-3 rounded-full border-2"
                    style={{
                      backgroundColor: hasBias ? color : "transparent",
                      borderColor: hasBias ? color : "hsl(var(--border))",
                      boxShadow: hasBias ? `0 0 12px ${color}40` : "none",
                    }}
                  />
                </div>

                {/* Content */}
                <div className={`flex-1 pb-4 ${hasBias ? "" : "opacity-50"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono-code text-muted-foreground/50">S{i + 1}</span>
                    {hasBias && (
                      <span
                        className="text-[10px] font-mono-code px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: color + "15",
                          color: color,
                          border: `1px solid ${color}30`,
                        }}
                      >
                        {entry.biasType} · {(entry.confidence * 100).toFixed(0)}%
                      </span>
                    )}
                    {!hasBias && (
                      <span className="text-[10px] font-mono-code text-muted-foreground/40 px-2 py-0.5 rounded-full bg-muted/20">
                        Neutral
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{entry.sentence}</p>

                  {/* Confidence micro-bar */}
                  {hasBias && (
                    <div className="mt-1.5 h-1 w-full max-w-[200px] rounded-full bg-muted/20 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${entry.confidence * 100}%` }}
                        transition={{ delay: i * 0.08 + 0.4 }}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-border/30 flex items-center gap-4 text-[10px] font-mono-code text-muted-foreground/60">
        <span>{sentences.length} sentences analyzed</span>
        <span>·</span>
        <span>{timeline.filter((t) => t.biasType).length} biased segments</span>
        <span>·</span>
        <span>{timeline.filter((t) => !t.biasType).length} neutral segments</span>
      </div>
    </motion.div>
  );
};

export default BiasEvolutionTimeline;
