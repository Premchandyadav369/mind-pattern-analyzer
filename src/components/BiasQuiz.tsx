import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ChevronRight, Trophy, RefreshCw } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface Question {
  scenario: string;
  options: { label: string; correct: boolean; explain: string }[];
}

const QUESTIONS: Question[] = [
  {
    scenario: "'I failed the exam — I'm clearly going to fail at everything in life forever.'",
    options: [
      { label: "Confirmation Bias", correct: false, explain: "This is about seeking evidence that supports beliefs." },
      { label: "Catastrophizing", correct: true, explain: "Correct — predicting the worst possible outcome from one event." },
      { label: "Sunk Cost Fallacy", correct: false, explain: "That involves continuing because of past investment." },
      { label: "Anchoring", correct: false, explain: "Anchoring depends on the first piece of information shown." },
    ],
  },
  {
    scenario: "'All successful CEOs wake up at 5am, so I must wake up at 5am to succeed.'",
    options: [
      { label: "Survivorship Bias", correct: true, explain: "Correct — you only see CEOs who 'survived' and ignore others." },
      { label: "Mind Reading", correct: false, explain: "Mind reading is assuming others' thoughts." },
      { label: "Framing Effect", correct: false, explain: "Framing depends on how a question is presented." },
      { label: "Halo Effect", correct: false, explain: "Halo effect transfers one trait to unrelated traits." },
    ],
  },
  {
    scenario: "'I've already spent 4 years on this degree I hate — I have to finish.'",
    options: [
      { label: "Overgeneralization", correct: false, explain: "That's drawing wide rules from a single event." },
      { label: "Loss Aversion", correct: false, explain: "Close — but specifically about past spent resources is different." },
      { label: "Sunk Cost Fallacy", correct: true, explain: "Correct — continuing only because of irrecoverable past investment." },
      { label: "Recency Bias", correct: false, explain: "Recency weights latest information more heavily." },
    ],
  },
  {
    scenario: "'She didn't smile at me in the meeting — she clearly hates my proposal.'",
    options: [
      { label: "Mind Reading", correct: true, explain: "Correct — assuming you know what someone thinks without evidence." },
      { label: "Anchoring", correct: false, explain: "Anchoring relies on an initial reference value." },
      { label: "Bandwagon Effect", correct: false, explain: "Bandwagon is doing things because the majority does." },
      { label: "Selection Bias", correct: false, explain: "Selection bias is about non-random sampling." },
    ],
  },
  {
    scenario: "'This stock went up 3 days in a row — it's definitely going up tomorrow.'",
    options: [
      { label: "Gambler's Fallacy", correct: false, explain: "Close — that's expecting reversals, not continuations." },
      { label: "Hot-Hand Fallacy", correct: true, explain: "Correct — believing a streak will continue without basis." },
      { label: "Personalization", correct: false, explain: "Personalization is blaming yourself for unrelated events." },
      { label: "Halo Effect", correct: false, explain: "Halo effect is trait-to-trait carryover." },
    ],
  },
];

const BiasQuiz = () => {
  const { isQuantum } = useTheme();
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const q = QUESTIONS[idx];

  const handlePick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (q.options[i].correct) setScore((s) => s + 1);
  };

  const next = () => {
    if (idx + 1 >= QUESTIONS.length) {
      setDone(true);
    } else {
      setIdx((i) => i + 1);
      setPicked(null);
    }
  };

  const reset = () => {
    setIdx(0);
    setScore(0);
    setPicked(null);
    setDone(false);
  };

  return (
    <section className="py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-xs font-mono text-primary/70 uppercase tracking-widest mb-3 block">
            Interactive Challenge
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            <span className={isQuantum ? "text-gradient-quantum" : "text-gradient-cyan"}>Bias</span> Recognition Quiz
          </h2>
          <p className="text-muted-foreground">Test your ability to spot cognitive distortions in everyday language.</p>
        </motion.div>

        <div className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-3xl p-8`}>
          {!done ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono text-muted-foreground">
                  Question {idx + 1} / {QUESTIONS.length}
                </span>
                <span className="text-xs font-mono text-primary">Score: {score}</span>
              </div>

              <div className="flex items-start gap-3 mb-6">
                <Brain className="w-5 h-5 text-primary mt-1 shrink-0" />
                <p className="text-base md:text-lg font-display italic">{q.scenario}</p>
              </div>

              <div className="space-y-2">
                {q.options.map((opt, i) => {
                  const isPicked = picked === i;
                  const showResult = picked !== null;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => handlePick(i)}
                      disabled={showResult}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                        showResult && opt.correct
                          ? "border-emerald-500/60 bg-emerald-500/10"
                          : showResult && isPicked && !opt.correct
                          ? "border-red-500/60 bg-red-500/10"
                          : "border-border/50 hover:border-primary/40 hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{opt.label}</span>
                        {showResult && opt.correct && (
                          <span className="text-[10px] font-mono text-emerald-400">CORRECT</span>
                        )}
                      </div>
                      <AnimatePresence>
                        {showResult && (isPicked || opt.correct) && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="text-xs text-muted-foreground mt-2"
                          >
                            {opt.explain}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </button>
                  );
                })}
              </div>

              {picked !== null && (
                <button
                  onClick={next}
                  className="mt-6 w-full px-5 py-3 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90"
                >
                  {idx + 1 >= QUESTIONS.length ? "See Results" : "Next Question"}
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-display text-2xl font-bold mb-2">
                {score} / {QUESTIONS.length}
              </h3>
              <p className="text-muted-foreground mb-6">
                {score === QUESTIONS.length
                  ? "Perfect — cognitive scientist tier."
                  : score >= 3
                  ? "Solid intuition. Keep training."
                  : "Worth reading the glossary — biases are sneaky."}
              </p>
              <button
                onClick={reset}
                className="px-5 py-2.5 border border-primary/40 text-primary rounded-xl font-semibold inline-flex items-center gap-2 hover:bg-primary/10"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BiasQuiz;
