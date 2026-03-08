import { motion } from "framer-motion";
import type { BiasResult } from "@/lib/biasAnalyzer";
import { useTheme } from "@/contexts/ThemeContext";

const COLORS: Record<string, { bg: string; text: string; border: string }> = {
  cyan: { bg: "bg-primary/20", text: "text-primary", border: "border-primary/40" },
  green: { bg: "bg-secondary/20", text: "text-secondary", border: "border-secondary/40" },
  red: { bg: "bg-destructive/20", text: "text-destructive", border: "border-destructive/40" },
  orange: { bg: "bg-accent/20", text: "text-accent", border: "border-accent/40" },
  purple: { bg: "bg-ring/20", text: "text-ring", border: "border-ring/40" },
};

interface AttentionSpan {
  text: string;
  weight: number;
  biasType?: string;
  color?: string;
}

function computeAttention(text: string, biases: BiasResult[]): AttentionSpan[] {
  const words = text.split(/(\s+)/);
  const spans: AttentionSpan[] = [];

  for (const word of words) {
    if (/^\s+$/.test(word)) {
      spans.push({ text: word, weight: 0 });
      continue;
    }

    const cleanWord = word.replace(/[^a-zA-Z']/g, "").toLowerCase();
    let maxWeight = 0;
    let matchedBias: BiasResult | undefined;

    for (const bias of biases) {
      for (const trigger of bias.triggers) {
        const triggerWords = trigger.toLowerCase().split(/\s+/);
        if (triggerWords.includes(cleanWord)) {
          const weight = bias.confidence;
          if (weight > maxWeight) {
            maxWeight = weight;
            matchedBias = bias;
          }
        }
      }
    }

    // Also give slight attention to surrounding context words
    if (maxWeight === 0) {
      for (const bias of biases) {
        for (const trigger of bias.triggers) {
          if (trigger.toLowerCase().includes(cleanWord) && cleanWord.length > 2) {
            maxWeight = bias.confidence * 0.3;
            matchedBias = bias;
          }
        }
      }
    }

    spans.push({
      text: word,
      weight: maxWeight,
      biasType: matchedBias?.biasType,
      color: matchedBias?.color,
    });
  }

  return spans;
}

const AttentionHighlights = ({ biases, text }: { biases: BiasResult[]; text: string }) => {
  const { isQuantum } = useTheme();
  const spans = computeAttention(text, biases);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-2xl p-6`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">✨</span>
        <h3 className="font-display font-semibold text-foreground">Attention Visualization</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-1">
        Transformer-style attention weights showing which words triggered bias detection.
      </p>
      <p className="text-[10px] text-muted-foreground/50 mb-5">
        Brighter highlights = higher attention weight = stronger bias signal
      </p>

      {/* Attention text */}
      <div className="bg-muted/10 rounded-xl p-5 border border-border/30 leading-loose">
        {spans.map((span, i) => {
          if (/^\s+$/.test(span.text)) {
            return <span key={i}>{span.text}</span>;
          }

          if (span.weight === 0) {
            return (
              <span key={i} className="text-muted-foreground/70">
                {span.text}
              </span>
            );
          }

          const colors = COLORS[span.color || "cyan"];
          const opacity = 0.15 + span.weight * 0.85;

          return (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              className={`relative inline-block px-1 py-0.5 mx-0.5 rounded cursor-default group ${colors.text}`}
              style={{ backgroundColor: `hsl(var(--primary) / ${opacity * 0.25})` }}
            >
              {/* Attention bar underneath */}
              <span
                className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full"
                style={{
                  backgroundColor: `hsl(var(--primary))`,
                  opacity: span.weight,
                }}
              />

              <span className="relative font-semibold">{span.text}</span>

              {/* Tooltip on hover */}
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-card border border-border rounded-lg px-2.5 py-1.5 text-[10px] whitespace-nowrap z-20 pointer-events-none shadow-lg">
                <span className="font-mono-code text-primary font-bold">{(span.weight * 100).toFixed(0)}%</span>
                <span className="text-muted-foreground ml-1">· {span.biasType}</span>
              </span>
            </motion.span>
          );
        })}
      </div>

      {/* Attention legend */}
      <div className="mt-4 flex items-center gap-4">
        <span className="text-[10px] text-muted-foreground/50">Attention:</span>
        <div className="flex items-center gap-1">
          {[0.1, 0.3, 0.5, 0.7, 0.9].map((w) => (
            <div
              key={w}
              className="w-6 h-3 rounded-sm"
              style={{ backgroundColor: `hsl(var(--primary) / ${w * 0.3})` }}
            />
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground/40">Low → High</span>
      </div>
    </motion.div>
  );
};

export default AttentionHighlights;
