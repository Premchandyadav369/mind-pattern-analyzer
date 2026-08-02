import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { BiasResult } from "@/lib/biasAnalyzer";
import { useTheme } from "@/contexts/ThemeContext";
import FeedbackControls from "./FeedbackControls";

const colorStyles: Record<string, { bar: string; badge: string; text: string }> = {
  cyan: { bar: "bg-primary", badge: "bg-primary/10 text-primary border-primary/30", text: "text-primary" },
  green: { bar: "bg-secondary", badge: "bg-secondary/10 text-secondary border-secondary/30", text: "text-secondary" },
  red: { bar: "bg-destructive", badge: "bg-destructive/10 text-destructive border-destructive/30", text: "text-destructive" },
  orange: { bar: "bg-accent", badge: "bg-accent/10 text-accent border-accent/30", text: "text-accent" },
  purple: { bar: "bg-ring", badge: "bg-ring/10 text-ring border-ring/30", text: "text-ring" },
};

const severityStyles: Record<string, string> = {
  low: "bg-secondary/10 text-secondary border-secondary/20",
  medium: "bg-accent/10 text-accent border-accent/20",
  high: "bg-destructive/10 text-destructive border-destructive/20",
};

const BiasResultCard = ({
  bias,
  index,
  sourceText,
}: {
  bias: BiasResult;
  index: number;
  sourceText?: string;
}) => {
  const { isQuantum } = useTheme();
  const styles = colorStyles[bias.color] || colorStyles.cyan;
  const [showExplanation, setShowExplanation] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-2xl p-6 hover:border-primary/20 transition-colors`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold border ${styles.badge}`}>
            {bias.biasType}
          </span>
          {bias.severity && (
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border ${severityStyles[bias.severity] || severityStyles.medium}`}>
              {bias.severity}
            </span>
          )}
        </div>
        <div className="text-right">
          <div className={`text-2xl font-display font-bold ${styles.text}`}>
            {(bias.confidence * 100).toFixed(0)}%
          </div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">confidence</div>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="w-full h-2 rounded-full bg-muted/50 mb-5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${bias.confidence * 100}%` }}
          transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
          className={`h-full rounded-full ${styles.bar}`}
        />
      </div>

      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setShowExplanation((s) => !s)}
          className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          {showExplanation ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {showExplanation ? "Hide explanation" : "Show explanation"}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{bias.explanation}</p>

            {bias.reasoning && (
              <div className="mb-4 p-4 rounded-xl bg-muted/20 border border-border/30">
                <p className="text-xs font-display font-semibold text-foreground mb-1.5">💡 Why you might think this way</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{bias.reasoning}</p>
              </div>
            )}

            {bias.reframe && (
              <div className="mb-4 p-4 rounded-xl bg-secondary/5 border border-secondary/20">
                <p className="text-xs font-display font-semibold text-secondary mb-1.5">✨ Healthier Reframe</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{bias.reframe}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {bias.triggers.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Triggers</span>
          {bias.triggers.map((t) => (
            <span key={t} className="text-xs font-mono px-2.5 py-1 rounded-lg bg-muted/40 text-foreground border border-border/30">
              {t}
            </span>
          ))}
        </div>
      )}

      {sourceText && (
        <FeedbackControls
          biasType={bias.biasType}
          confidence={bias.confidence}
          excerpt={sourceText.slice(0, 400)}
        />
      )}
    </motion.div>
  );
};

export default BiasResultCard;
