import { motion } from "framer-motion";
import type { BiasResult } from "@/lib/biasAnalyzer";

const COLORS: Record<string, string> = {
  cyan: "hsl(199, 89%, 60%)",
  green: "hsl(142, 71%, 45%)",
  red: "hsl(0, 84%, 60%)",
  orange: "hsl(24, 95%, 53%)",
  purple: "hsl(270, 70%, 60%)",
};

const BiasHeatmap = ({ biases, text }: { biases: BiasResult[]; text: string }) => {
  // Split text into sentences
  const sentences = text.match(/[^.!?]+[.!?]*/g)?.map((s) => s.trim()).filter(Boolean) || [text];

  // Calculate bias intensity per sentence
  const heatmapData = sentences.map((sentence) => {
    const lower = sentence.toLowerCase();
    const scores: Record<string, number> = {};
    for (const bias of biases) {
      const matchCount = bias.triggers.filter((t) => lower.includes(t.toLowerCase())).length;
      if (matchCount > 0) {
        scores[bias.biasType] = Math.min(matchCount * bias.confidence, 1);
      }
    }
    return { sentence, scores };
  });

  const allBiasTypes = [...new Set(biases.map((b) => b.biasType))];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="quantum-glass rounded-2xl p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🗺️</span>
        <h3 className="font-display font-semibold text-foreground">Bias Intensity Heatmap</h3>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-5">
        {biases.map((bias) => (
          <div key={bias.biasType} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[bias.color] }} />
            <span className="text-[10px] text-muted-foreground">{bias.biasType}</span>
          </div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="space-y-2 overflow-x-auto">
        {heatmapData.map((row, si) => (
          <motion.div
            key={si}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: si * 0.08 }}
            className="flex items-stretch gap-2"
          >
            {/* Sentence text */}
            <div className="min-w-[200px] max-w-[300px] text-xs text-muted-foreground py-2 pr-3 border-r border-border/30 truncate flex-shrink-0">
              <span className="font-mono-code text-muted-foreground/40 mr-1">S{si + 1}</span>
              {row.sentence}
            </div>

            {/* Heat cells */}
            <div className="flex gap-1 items-center flex-1">
              {allBiasTypes.map((bt) => {
                const intensity = row.scores[bt] || 0;
                const color = COLORS[biases.find((b) => b.biasType === bt)?.color || "cyan"];
                return (
                  <motion.div
                    key={bt}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: si * 0.08 + 0.3 }}
                    className="w-8 h-8 rounded-md flex items-center justify-center text-[9px] font-mono-code font-bold"
                    style={{
                      backgroundColor: intensity > 0 ? color : "transparent",
                      opacity: intensity > 0 ? 0.2 + intensity * 0.8 : 0.05,
                      border: `1px solid ${intensity > 0 ? color : "hsl(var(--border))"}`,
                      color: intensity > 0.3 ? "white" : "transparent",
                    }}
                    title={`${bt}: ${(intensity * 100).toFixed(0)}%`}
                  >
                    {intensity > 0.3 ? (intensity * 100).toFixed(0) : ""}
                  </motion.div>
                );
              })}

              {/* Overall intensity bar */}
              <div className="flex-1 h-2 rounded-full bg-muted/20 overflow-hidden ml-2">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(Object.values(row.scores).reduce((a, b) => a + b, 0) * 100, 100)}%` }}
                  transition={{ delay: si * 0.08 + 0.5 }}
                  style={{ opacity: 0.6 }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default BiasHeatmap;
