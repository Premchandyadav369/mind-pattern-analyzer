import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { PenLine, Wand2, HeartHandshake, X, ChevronRight } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const STEPS = [
  {
    icon: PenLine,
    title: "Paste your thought",
    body: "A journal entry, an argument, a news paragraph — anything you want a second opinion on.",
  },
  {
    icon: Wand2,
    title: "Let MindTrace read it",
    body: "It highlights the thinking patterns that quietly bend your judgement, with plain-English reasons.",
  },
  {
    icon: HeartHandshake,
    title: "Get a kinder rewrite",
    body: "Every bias comes with a balanced reframe you can actually use in the next conversation.",
  },
];

const DISMISS_KEY = "mindtrace-quickstart-dismissed";

const QuickStartGuide = ({ onStart }: { onStart?: () => void }) => {
  const { isQuantum } = useTheme();
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    setHidden(localStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setHidden(true);
  };

  if (hidden) return null;

  return (
    <section className="px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`${isQuantum ? "quantum-glass" : "glass-card"} max-w-5xl mx-auto rounded-2xl p-6 relative`}
      >
        <button
          onClick={dismiss}
          aria-label="Dismiss quick start"
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <span className="text-xs font-mono text-primary/70 uppercase tracking-widest">Start here</span>
        <h2 className="font-display text-xl md:text-2xl font-bold mt-2 mb-6 text-foreground">
          Three steps to a clearer thought
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="p-4 rounded-xl bg-muted/10 border border-border/20">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <s.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">STEP {i + 1}</span>
              </div>
              <h3 className="font-display font-semibold text-sm text-foreground mb-1">{s.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        {onStart && (
          <button
            onClick={onStart}
            className="mt-6 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:scale-[1.03] transition-transform"
          >
            Try it now <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </motion.div>
    </section>
  );
};

export default QuickStartGuide;
