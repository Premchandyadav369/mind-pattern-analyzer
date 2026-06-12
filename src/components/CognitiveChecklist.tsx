import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { CheckSquare, Square, Sparkles } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const ITEMS = [
  { id: "1", label: "I'm using words like 'always', 'never', 'everyone', 'no one'", bias: "Overgeneralization" },
  { id: "2", label: "I'm predicting the worst-case outcome without evidence", bias: "Catastrophizing" },
  { id: "3", label: "I'm assuming I know what others are thinking about me", bias: "Mind Reading" },
  { id: "4", label: "I'm blaming myself for events outside my control", bias: "Personalization" },
  { id: "5", label: "I'm continuing only because of time/money already spent", bias: "Sunk Cost Fallacy" },
  { id: "6", label: "I'm focusing on what failed, ignoring what worked", bias: "Negativity Bias" },
  { id: "7", label: "I'm filtering out information that contradicts my view", bias: "Confirmation Bias" },
  { id: "8", label: "I'm seeing the situation as all-good or all-bad", bias: "Black-and-White Thinking" },
  { id: "9", label: "I'm trusting first impressions over later evidence", bias: "Anchoring Bias" },
  { id: "10", label: "I'm copying others because everyone seems to agree", bias: "Bandwagon Effect" },
];

const CognitiveChecklist = () => {
  const { isQuantum } = useTheme();
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setChecked((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const detected = useMemo(
    () => ITEMS.filter((i) => checked.has(i.id)).map((i) => i.bias),
    [checked]
  );

  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-xs font-mono text-primary/70 uppercase tracking-widest mb-3 block">
            Self-Audit Tool
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            <span className={isQuantum ? "text-gradient-quantum" : "text-gradient-cyan"}>Cognitive</span> Distortion Checklist
          </h2>
          <p className="text-muted-foreground">
            A 10-point thought audit. Tick what applies to your current self-talk.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-3">
          {ITEMS.map((item, i) => {
            const on = checked.has(item.id);
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                onClick={() => toggle(item.id)}
                className={`text-left flex items-start gap-3 px-4 py-3 rounded-xl border transition-all ${
                  on
                    ? "border-primary/50 bg-primary/5"
                    : "border-border/50 hover:border-primary/30 hover:bg-muted/20"
                }`}
              >
                {on ? (
                  <CheckSquare className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-sm">{item.label}</p>
                  {on && (
                    <span className="inline-block mt-1.5 text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      → {item.bias}
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {detected.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-8 rounded-2xl p-6 ${isQuantum ? "quantum-glass" : "glass-card"}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold">Likely Active Distortions</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {detected.map((b) => (
                <span
                  key={b}
                  className="text-xs font-mono px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/30"
                >
                  {b}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Reframe each: separate the observation from the interpretation, then ask "what's another equally plausible explanation?"
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default CognitiveChecklist;
