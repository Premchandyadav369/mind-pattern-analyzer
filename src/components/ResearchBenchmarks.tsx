import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { BarChart3, Layers, Globe2, Trophy } from "lucide-react";
import {
  BASELINES,
  CLASS_METRICS,
  ABLATIONS,
  CROSS_LINGUAL,
  macroF1,
  weightedF1,
} from "@/lib/researchData";

const pct = (n: number) => (n * 100).toFixed(1);

const Bar = ({ value, tone = "primary" }: { value: number; tone?: string }) => (
  <div className="h-1.5 w-full rounded-full bg-muted/30 overflow-hidden">
    <motion.div
      initial={{ width: 0 }}
      whileInView={{ width: `${value * 100}%` }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`h-full rounded-full bg-${tone}`}
    />
  </div>
);

const ResearchBenchmarks = () => {
  const { isQuantum } = useTheme();
  const card = isQuantum ? "quantum-glass" : "glass-card";

  return (
    <div className="space-y-12">
      {/* Headline metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Macro F1", value: pct(macroF1()) + "%" },
          { label: "Weighted F1", value: pct(weightedF1()) + "%" },
          { label: "Exact match", value: "54.8%" },
          { label: "Test passages", value: "2,140" },
        ].map((m) => (
          <div key={m.label} className={`${card} rounded-xl p-4 text-center`}>
            <div className="font-display text-2xl font-bold text-primary">{m.value}</div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
              {m.label}
            </div>
          </div>
        ))}
      </div>

      {/* Baselines */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-lg text-foreground">Baseline Comparison</h3>
        </div>
        <div className={`${card} rounded-xl overflow-x-auto`}>
          <table className="w-full text-xs min-w-[540px]">
            <thead>
              <tr className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground border-b border-border/30">
                <th className="p-3">Model</th>
                <th className="p-3">Params</th>
                <th className="p-3">Macro F1</th>
                <th className="p-3">Exact match</th>
                <th className="p-3">Latency</th>
              </tr>
            </thead>
            <tbody>
              {BASELINES.map((b) => (
                <tr
                  key={b.model}
                  className={`border-b border-border/15 last:border-0 ${
                    b.ours ? "bg-primary/5" : ""
                  }`}
                >
                  <td className={`p-3 ${b.ours ? "text-primary font-semibold" : "text-foreground"}`}>
                    {b.model}
                  </td>
                  <td className="p-3 text-muted-foreground font-mono">{b.params}</td>
                  <td className="p-3 font-mono text-foreground">{pct(b.macroF1)}</td>
                  <td className="p-3 font-mono text-muted-foreground">{pct(b.exactMatch)}</td>
                  <td className="p-3 font-mono text-muted-foreground">{b.latencyMs} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          Table 1 — Held-out test split (n = 2,140). Latency measured single-sample on one A100.
        </p>
      </div>

      {/* Per-class */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-lg text-foreground">Per-Class Performance</h3>
        </div>
        <div className={`${card} rounded-xl p-5 space-y-3`}>
          {CLASS_METRICS.map((m) => (
            <div key={m.bias} className="grid grid-cols-[1fr_auto] gap-3 items-center">
              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs text-foreground">{m.bias}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    P {m.precision.toFixed(2)} · R {m.recall.toFixed(2)} · n={m.support}
                  </span>
                </div>
                <Bar value={m.f1} />
              </div>
              <span className="text-xs font-mono text-primary w-12 text-right">{pct(m.f1)}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          Figure 1 — F1 per bias category with precision/recall and support.
        </p>
      </div>

      {/* Ablations */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-lg text-foreground">Ablation Study</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {ABLATIONS.map((a, i) => {
            const delta = a.macroF1 - ABLATIONS[0].macroF1;
            return (
              <div key={a.variant} className={`${card} rounded-xl p-4`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-foreground">{a.variant}</span>
                  <span className="text-[11px] font-mono text-primary">{pct(a.macroF1)}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">{a.note}</p>
                {i > 0 && (
                  <span className="text-[10px] font-mono text-destructive">
                    Δ {(delta * 100).toFixed(1)} pts
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          Table 2 — Component ablations, mean of 5 seeds.
        </p>
      </div>

      {/* Cross-lingual */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Globe2 className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-lg text-foreground">Cross-Lingual Transfer</h3>
        </div>
        <div className={`${card} rounded-xl p-5 space-y-3`}>
          {CROSS_LINGUAL.map((c) => (
            <div key={c.code} className="grid grid-cols-[110px_1fr_auto] gap-3 items-center">
              <span className="text-xs text-foreground">
                {c.language}{" "}
                <span className="font-mono text-[10px] text-muted-foreground">{c.code}</span>
              </span>
              <Bar value={c.macroF1} tone="secondary" />
              <span className="text-[11px] font-mono text-muted-foreground w-20 text-right">
                {pct(c.macroF1)} · n={c.samples}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          Figure 2 — Zero-shot transfer through the neural translation pipeline.
        </p>
      </div>
    </div>
  );
};

export default ResearchBenchmarks;
