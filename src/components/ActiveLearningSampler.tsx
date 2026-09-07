import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Target, Download } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { selectBatch, expectedLabelSavings, type Candidate } from "@/lib/activeLearning";
import { lexicalPredict } from "@/lib/robustness";

const DEFAULT_POOL = [
  "Everyone always ignores my suggestions in meetings.",
  "The deployment finished at 4pm without incident.",
  "If this launch fails it will be a total disaster for us.",
  "They obviously think I am not qualified for this role.",
  "Quarterly revenue grew by six percent year over year.",
  "I should have known better; I am such a failure.",
  "Nobody ever replies to my emails on time.",
  "The survey had a response rate of 42 percent.",
  "It feels wrong, so the plan must be a bad idea.",
  "We shipped three features and closed twelve bugs.",
].join("\n");

const LABELS = ["Overgeneralization", "Catastrophizing", "Mind Reading", "Should Statements", "Labeling", "Emotional Reasoning", "None"];

function toCandidates(raw: string): Candidate[] {
  return raw
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean)
    .map((text, i) => {
      const pred = lexicalPredict(text);
      const probs = LABELS.map((l) =>
        l === "None" ? Math.max(0.05, 1 - pred.confidence) : (pred.scores[l] ?? 0.04),
      );
      const sum = probs.reduce((a, b) => a + b, 0);
      return { id: `s${i + 1}`, text, probs: probs.map((p) => p / sum) };
    });
}

const ActiveLearningSampler = () => {
  const { isQuantum } = useTheme();
  const [raw, setRaw] = useState(DEFAULT_POOL);
  const [batchSize, setBatchSize] = useState(4);
  const [lambda, setLambda] = useState(0.7);
  const [strategy, setStrategy] = useState<"entropy" | "margin" | "least-confidence">("entropy");

  const pool = useMemo(() => toCandidates(raw), [raw]);
  const batch = useMemo(() => selectBatch(pool, { batchSize, lambda, strategy }), [pool, batchSize, lambda, strategy]);
  const savings = expectedLabelSavings(batch, pool.length);

  const exportCsv = () => {
    const lines = [
      "rank,id,uncertainty,entropy,margin,least_confidence,diversity,acquisition,text",
      ...batch.map((b) =>
        [
          b.rank,
          b.id,
          b.uncertainty.toFixed(4),
          b.entropy.toFixed(4),
          b.margin.toFixed(4),
          b.leastConfidence.toFixed(4),
          b.diversity.toFixed(4),
          b.acquisition.toFixed(4),
          `"${b.text.replace(/"/g, "'")}"`,
        ].join(","),
      ),
    ];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "mindtrace-active-learning-batch.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      id="active-learning"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-2xl p-6`}
    >
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-display font-bold text-lg text-foreground">Active-Learning Sampler</h3>
            <p className="text-xs text-muted-foreground">
              Uncertainty × diversity acquisition (max-marginal-relevance) to pick the highest-value items to annotate.
            </p>
          </div>
        </div>
        <button
          onClick={exportCsv}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> CSV
        </button>
      </div>

      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        rows={5}
        className="w-full text-xs font-mono rounded-xl bg-muted/10 border border-border/30 p-3 text-foreground focus:outline-none focus:border-primary/50 mb-4"
        placeholder="One unlabeled sample per line…"
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-5">
        <label className="block">
          <span className="text-[11px] font-mono text-muted-foreground">Batch size: {batchSize}</span>
          <input type="range" min={1} max={Math.max(1, pool.length)} value={Math.min(batchSize, Math.max(1, pool.length))} onChange={(e) => setBatchSize(Number(e.target.value))} className="w-full accent-primary mt-1" />
        </label>
        <label className="block">
          <span className="text-[11px] font-mono text-muted-foreground">λ (uncertainty ↔ diversity): {lambda.toFixed(2)}</span>
          <input type="range" min={0} max={1} step={0.05} value={lambda} onChange={(e) => setLambda(Number(e.target.value))} className="w-full accent-primary mt-1" />
        </label>
        <label className="block">
          <span className="text-[11px] font-mono text-muted-foreground">Strategy</span>
          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value as typeof strategy)}
            className="w-full mt-1 text-xs px-2 py-1.5 rounded-lg bg-muted/10 border border-border/40 text-foreground"
          >
            <option value="entropy">Predictive entropy</option>
            <option value="margin">Margin sampling</option>
            <option value="least-confidence">Least confidence</option>
          </select>
        </label>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mb-5">
        {[
          { label: "Pool size", value: pool.length },
          { label: "Selected", value: batch.length },
          { label: "Est. labelling saved", value: `${Math.round(savings * 100)}%` },
        ].map((m) => (
          <div key={m.label} className="p-4 rounded-xl bg-muted/10 border border-border/20">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">{m.label}</p>
            <p className="text-xl font-display font-bold text-primary">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border/30">
              <th className="py-2 pr-3 font-medium">#</th>
              <th className="py-2 pr-3 font-medium">Sample</th>
              <th className="py-2 pr-3 font-medium">Uncert.</th>
              <th className="py-2 pr-3 font-medium">Diversity</th>
              <th className="py-2 font-medium">Acquisition</th>
            </tr>
          </thead>
          <tbody>
            {batch.map((b) => (
              <tr key={b.id} className="border-b border-border/10 align-top">
                <td className="py-2 pr-3 font-mono text-primary">{b.rank}</td>
                <td className="py-2 pr-3 text-foreground max-w-[380px]">{b.text}</td>
                <td className="py-2 pr-3 font-mono text-muted-foreground">{b.uncertainty.toFixed(3)}</td>
                <td className="py-2 pr-3 font-mono text-muted-foreground">{b.diversity.toFixed(3)}</td>
                <td className="py-2 font-mono text-primary">{b.acquisition.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-muted-foreground/70 mt-4 leading-relaxed">
        Class posteriors come from the in-browser lexical probe; diversity uses hashed bag-of-words vectors, so the
        batch is deterministic and can be reproduced in a paper's annotation-protocol section.
      </p>
    </motion.div>
  );
};

export default ActiveLearningSampler;
