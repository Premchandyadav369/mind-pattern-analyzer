import { motion } from "framer-motion";
import type { BiasResult } from "@/lib/biasAnalyzer";

const colorStyles: Record<string, { bar: string; badge: string; text: string }> = {
  cyan: { bar: "bg-primary", badge: "bg-primary/10 text-primary border-primary/30", text: "text-primary" },
  green: { bar: "bg-secondary", badge: "bg-secondary/10 text-secondary border-secondary/30", text: "text-secondary" },
  red: { bar: "bg-destructive", badge: "bg-destructive/10 text-destructive border-destructive/30", text: "text-destructive" },
  orange: { bar: "bg-accent", badge: "bg-accent/10 text-accent border-accent/30", text: "text-accent" },
  purple: { bar: "bg-ring", badge: "bg-ring/10 text-ring border-ring/30", text: "text-ring" },
};

const BiasResultCard = ({ bias, index }: { bias: BiasResult; index: number }) => {
  const styles = colorStyles[bias.color] || colorStyles.cyan;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.15 }}
      className="glass-card rounded-xl p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${styles.badge}`}>
            {bias.biasType}
          </span>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-display font-bold ${styles.text}`}>
            {(bias.confidence * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-muted-foreground">confidence</div>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="w-full h-2 rounded-full bg-muted mb-4 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${bias.confidence * 100}%` }}
          transition={{ duration: 0.8, delay: 0.2 + index * 0.15 }}
          className={`h-full rounded-full ${styles.bar}`}
        />
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{bias.explanation}</p>

      {bias.triggers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground/70">Triggers:</span>
          {bias.triggers.map((t) => (
            <span key={t} className="text-xs font-mono px-2 py-0.5 rounded bg-muted/50 text-foreground">
              {t}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default BiasResultCard;
