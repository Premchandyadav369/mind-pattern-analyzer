import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Type, BarChart3, Eye, Brain } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { computeTextStats } from "@/lib/textStats";

const TextAnalyzerMini = () => {
  const { isQuantum } = useTheme();
  const [text, setText] = useState("");

  const stats = useMemo(() => computeTextStats(text), [text]);


  const fleschLabel =
    stats.flesch >= 80 ? "Very Easy" :
    stats.flesch >= 60 ? "Plain English" :
    stats.flesch >= 40 ? "College Level" :
    stats.flesch >= 20 ? "Difficult" : "Very Difficult";

  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-xs font-mono text-primary/70 uppercase tracking-widest mb-3 block">
            Linguistic Profiler
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            <span className={isQuantum ? "text-gradient-quantum" : "text-gradient-cyan"}>Readability</span> & Cognitive Load
          </h2>
          <p className="text-muted-foreground">
            Live metrics: Flesch reading ease, lexical density, speaking/reading time.
          </p>
        </motion.div>

        <div className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-3xl p-6 md:p-8`}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste any passage to measure clarity, lexical richness, and audience effort..."
            className="w-full min-h-[140px] bg-background/40 border border-border/50 rounded-xl p-4 text-sm font-mono resize-y focus:outline-none focus:border-primary/50"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
            <StatCard icon={<Type className="w-4 h-4" />} label="Words" value={stats.words} />
            <StatCard icon={<Type className="w-4 h-4" />} label="Sentences" value={stats.sentences} />
            <StatCard icon={<Type className="w-4 h-4" />} label="Avg Word Len" value={stats.avgWord} />
            <StatCard icon={<Type className="w-4 h-4" />} label="Characters" value={stats.chars} />
            <StatCard icon={<Eye className="w-4 h-4" />} label="Read Time" value={`${stats.readingMin}m`} />
            <StatCard icon={<Eye className="w-4 h-4" />} label="Speak Time" value={`${stats.speakingMin}m`} />
            <StatCard icon={<BarChart3 className="w-4 h-4" />} label="Lexical Density" value={`${stats.lexDensity}%`} />
            <StatCard
              icon={<Brain className="w-4 h-4" />}
              label={`Flesch (${fleschLabel})`}
              value={stats.flesch}
            />
          </div>

          {stats.words > 0 && (
            <div className="mt-5 h-2 bg-muted/40 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.flesch}%` }}
                className="h-full bg-gradient-to-r from-red-500 via-yellow-400 to-emerald-500"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
  <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
    <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground uppercase tracking-wide mb-1">
      {icon}
      {label}
    </div>
    <div className="font-display text-xl font-bold text-foreground">{value}</div>
  </div>
);

export default TextAnalyzerMini;
