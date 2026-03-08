import { motion } from "framer-motion";
import type { SentimentData } from "@/lib/biasAnalyzer";
import { useTheme } from "@/contexts/ThemeContext";

const SENTIMENT_COLORS: Record<string, string> = {
  positive: "text-secondary",
  negative: "text-destructive",
  neutral: "text-muted-foreground",
  mixed: "text-accent",
};

const SENTIMENT_ICONS: Record<string, string> = {
  positive: "😊",
  negative: "😟",
  neutral: "😐",
  mixed: "🤔",
};

const SentimentAnalysis = ({ sentiment }: { sentiment: SentimentData }) => {
  const { isQuantum } = useTheme();

  const valencePercent = ((sentiment.valence + 1) / 2) * 100;
  const arousalPercent = sentiment.arousal * 100;
  const dominancePercent = sentiment.dominance * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-2xl p-6`}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{SENTIMENT_ICONS[sentiment.overall]}</span>
        <h3 className="font-display font-semibold text-foreground">Sentiment Analysis</h3>
        <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-full border ${
          sentiment.overall === "positive" ? "bg-secondary/10 text-secondary border-secondary/30" :
          sentiment.overall === "negative" ? "bg-destructive/10 text-destructive border-destructive/30" :
          sentiment.overall === "mixed" ? "bg-accent/10 text-accent border-accent/30" :
          "bg-muted/30 text-muted-foreground border-border/50"
        }`}>
          {sentiment.overall}
        </span>
      </div>

      {/* VAD Model */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: "Valence", value: valencePercent, desc: "Positive ↔ Negative", color: "bg-secondary" },
          { label: "Arousal", value: arousalPercent, desc: "Calm ↔ Excited", color: "bg-accent" },
          { label: "Dominance", value: dominancePercent, desc: "Submissive ↔ Dominant", color: "bg-primary" },
        ].map((dim) => (
          <div key={dim.label} className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-2">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                <motion.circle
                  cx="32" cy="32" r="28" fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - dim.value / 100) }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className={dim.color === "bg-secondary" ? "text-secondary" : dim.color === "bg-accent" ? "text-accent" : "text-primary"}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-mono-code font-bold text-foreground">{Math.round(dim.value)}%</span>
              </div>
            </div>
            <p className="text-xs font-semibold text-foreground">{dim.label}</p>
            <p className="text-[9px] text-muted-foreground">{dim.desc}</p>
          </div>
        ))}
      </div>

      {/* Detected Emotions */}
      {sentiment.emotions && sentiment.emotions.length > 0 && (
        <div>
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-2">Detected Emotions</p>
          <div className="flex flex-wrap gap-1.5">
            {sentiment.emotions.map((emotion) => (
              <motion.span
                key={emotion}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium"
              >
                {emotion}
              </motion.span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SentimentAnalysis;
