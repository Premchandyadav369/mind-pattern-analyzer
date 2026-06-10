import { motion } from "framer-motion";
import { useMemo } from "react";
import { Award, Sparkles, Flame, BrainCog, Trophy, Telescope } from "lucide-react";
import type { AnalysisResult } from "@/lib/biasAnalyzer";

interface Props {
  history: AnalysisResult[];
}

const AchievementBadges = ({ history }: Props) => {
  const badges = useMemo(() => {
    const total = history.length;
    const uniqueBiases = new Set(history.flatMap((h) => h.biases.map((b) => b.biasType))).size;
    const langs = new Set(history.map((h) => h.originalLanguage || "en")).size;
    const clean = history.filter((h) => h.biases.length === 0).length;

    return [
      { id: "first", label: "First Step", desc: "Run your first analysis", icon: Sparkles, unlocked: total >= 1 },
      { id: "explorer", label: "Bias Explorer", desc: "Detect 5 different bias types", icon: Telescope, unlocked: uniqueBiases >= 5 },
      { id: "polyglot", label: "Polyglot", desc: "Analyze in 3 languages", icon: BrainCog, unlocked: langs >= 3 },
      { id: "streak", label: "On Fire", desc: "Run 10 analyses", icon: Flame, unlocked: total >= 10 },
      { id: "clear", label: "Clear Mind", desc: "Pass a bias-free check", icon: Award, unlocked: clean >= 1 },
      { id: "master", label: "Cognition Master", desc: "Detect 10 unique bias types", icon: Trophy, unlocked: uniqueBiases >= 10 },
    ];
  }, [history]);

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  if (history.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card rounded-2xl p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-accent" />
          <h3 className="font-display font-semibold text-sm">Achievements</h3>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">{unlockedCount}/{badges.length}</span>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {badges.map((b, i) => {
          const Icon = b.icon;
          return (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`relative p-3 rounded-xl border text-center transition-all ${
                b.unlocked
                  ? "bg-accent/10 border-accent/40 text-accent"
                  : "bg-muted/10 border-border/30 text-muted-foreground/40 grayscale"
              }`}
              title={b.desc}
            >
              <Icon className="w-5 h-5 mx-auto mb-1" />
              <p className="text-[9px] font-display font-semibold leading-tight">{b.label}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default AchievementBadges;
