import { motion } from "framer-motion";
import { BookOpen, Brain, Target, Layers, TrendingUp } from "lucide-react";
import type { NLPMetrics as NLPMetricsType } from "@/lib/biasAnalyzer";
import { useTheme } from "@/contexts/ThemeContext";

const NLPMetricsPanel = ({ metrics, text }: { metrics: NLPMetricsType; text: string }) => {
  const { isQuantum } = useTheme();

  // Compute local text stats
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.trim().split(/\s+/);
  const chars = text.length;
  const avgWordLength = words.length > 0 ? (words.reduce((s, w) => s + w.length, 0) / words.length).toFixed(1) : "0";
  const avgSentenceLength = sentences.length > 0 ? (words.length / sentences.length).toFixed(1) : "0";
  const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^a-zA-Z]/g, ""))).size;
  const lexicalDiversity = words.length > 0 ? ((uniqueWords / words.length) * 100).toFixed(0) : "0";

  const complexityColor = metrics.cognitiveComplexity === "high" ? "text-destructive" :
    metrics.cognitiveComplexity === "medium" ? "text-accent" : "text-secondary";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-2xl p-6`}
    >
      <div className="flex items-center gap-2 mb-5">
        <Layers className="w-4 h-4 text-primary" />
        <h3 className="font-display font-semibold text-foreground">NLP Analytics Dashboard</h3>
      </div>

      {/* Text Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Words", value: words.length, icon: "📝" },
          { label: "Sentences", value: sentences.length, icon: "📄" },
          { label: "Characters", value: chars, icon: "🔤" },
          { label: "Unique Words", value: uniqueWords, icon: "🎯" },
        ].map((stat) => (
          <div key={stat.label} className="p-3 rounded-xl bg-muted/20 border border-border/30 text-center">
            <span className="text-sm">{stat.icon}</span>
            <motion.p
              className="text-xl font-display font-bold text-foreground mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {stat.value.toLocaleString()}
            </motion.p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Advanced Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <div className="p-3 rounded-xl bg-muted/10 border border-border/20">
          <div className="flex items-center gap-1.5 mb-2">
            <BookOpen className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Reading Level</span>
          </div>
          <p className="text-sm font-semibold text-foreground">{metrics.readingLevel}</p>
        </div>

        <div className="p-3 rounded-xl bg-muted/10 border border-border/20">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Word Len</span>
          </div>
          <p className="text-sm font-semibold text-foreground">{avgWordLength} chars</p>
        </div>

        <div className="p-3 rounded-xl bg-muted/10 border border-border/20">
          <div className="flex items-center gap-1.5 mb-2">
            <Target className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Lexical Diversity</span>
          </div>
          <p className="text-sm font-semibold text-foreground">{lexicalDiversity}%</p>
        </div>
      </div>

      {/* AI-Powered Metrics Bars */}
      <div className="space-y-3 mb-5">
        {[
          { label: "Emotional Intensity", value: metrics.emotionalIntensity, color: "bg-destructive" },
          { label: "Logical Coherence", value: metrics.logicalCoherence, color: "bg-secondary" },
        ].map((metric) => (
          <div key={metric.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">{metric.label}</span>
              <span className="text-xs font-mono-code font-bold text-foreground">{metric.value}/100</span>
            </div>
            <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${metric.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${metric.value}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Cognitive Complexity & Persuasion */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Brain className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">Complexity:</span>
          <span className={`text-xs font-bold uppercase ${complexityColor}`}>{metrics.cognitiveComplexity}</span>
        </div>

        {metrics.persuasionTactics && metrics.persuasionTactics.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-muted-foreground">Persuasion:</span>
            {metrics.persuasionTactics.map((tactic) => (
              <span key={tactic} className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                {tactic}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Avg Sentence Length */}
      <p className="mt-3 text-[10px] text-muted-foreground/50">
        Avg sentence length: {avgSentenceLength} words · {sentences.length} sentences parsed
      </p>
    </motion.div>
  );
};

export default NLPMetricsPanel;
