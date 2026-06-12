import { useMemo } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Calendar } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const INSIGHTS = [
  {
    title: "The Spotlight Effect",
    body: "People notice you about 50% less than you think. The 'spotlight' on you is mostly imagined — most observers are absorbed in their own internal narrative.",
    source: "Gilovich, Medvec & Savitsky (2000)",
  },
  {
    title: "Negativity Asymmetry",
    body: "One negative event carries roughly 3–5x the cognitive weight of an equivalent positive event. Counteract by deliberately re-cataloguing positives.",
    source: "Baumeister et al. (2001)",
  },
  {
    title: "The Planning Fallacy",
    body: "Humans underestimate task duration by ~40% on average — even after being told about the planning fallacy. Use reference-class forecasting instead of intuition.",
    source: "Kahneman & Tversky (1979)",
  },
  {
    title: "Affective Forecasting Error",
    body: "We systematically overestimate how long emotions — both joy and grief — will last. Hedonic adaptation kicks in faster than we predict.",
    source: "Wilson & Gilbert (2003)",
  },
  {
    title: "Quantum Indeterminacy of Beliefs",
    body: "Per quantum cognition models, a held belief is often a superposition collapsed by the question's framing — not a stable prior. Rephrase the question, get a different answer.",
    source: "Busemeyer & Bruza (2012)",
  },
  {
    title: "The Backfire Effect",
    body: "Correcting misinformation can sometimes strengthen the original belief. Lead with the truth as the headline, never as the rebuttal.",
    source: "Nyhan & Reifler (2010)",
  },
  {
    title: "Decision Fatigue",
    body: "Self-control depletes with each decision. Sequence high-stakes choices early; automate the trivial ones.",
    source: "Vohs et al. (2008)",
  },
];

const DailyInsight = () => {
  const { isQuantum } = useTheme();

  const insight = useMemo(() => {
    const day = Math.floor(Date.now() / 86_400_000);
    return INSIGHTS[day % INSIGHTS.length];
  }, []);

  return (
    <section className="py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <span className="text-xs font-mono text-primary/70 uppercase tracking-widest mb-3 block flex items-center justify-center gap-2">
            <Calendar className="w-3 h-3" /> Daily Insight
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            <span className={isQuantum ? "text-gradient-quantum" : "text-gradient-cyan"}>One Idea</span> Per Day
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-3xl p-8 md:p-10 relative overflow-hidden`}
        >
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />
          <Lightbulb className="w-8 h-8 text-primary mb-4" />
          <h3 className="font-display text-2xl md:text-3xl font-bold mb-4">{insight.title}</h3>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6">{insight.body}</p>
          <p className="text-xs font-mono text-primary/70 border-t border-border/40 pt-4">
            Source: {insight.source}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default DailyInsight;
