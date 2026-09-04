import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Ruler, Download } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import {
  sampleSizePerGroup,
  achievedPower,
  minDetectableEffect,
  wilsonInterval,
} from "@/lib/powerAnalysis";
import { BASELINES } from "@/lib/researchData";

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

const PowerAnalysisPanel = () => {
  const { isQuantum } = useTheme();
  const ours = BASELINES.find((b) => (b as { ours?: boolean }).ours) ?? BASELINES[BASELINES.length - 1];
  const others = BASELINES.filter((b) => b !== ours);

  const [baselineModel, setBaselineName] = useState(others[others.length - 1]?.model ?? others[0]?.model);
  const [alpha, setAlpha] = useState(0.05);
  const [power, setPower] = useState(0.8);
  const [n, setN] = useState(428);

  const baseline = others.find((b) => b.model === baselineModel) ?? others[0];
  const p1 = baseline?.macroF1 ?? 0.8;
  const p2 = ours?.macroF1 ?? 0.821;

  const results = useMemo(() => {
    const cfg = { p1, p2, alpha, twoSided: true };
    return {
      required: sampleSizePerGroup({ ...cfg, power }),
      power: achievedPower(cfg, n),
      mde: minDetectableEffect(p1, n, alpha, power),
      ciOurs: wilsonInterval(p2, n, alpha),
      ciBase: wilsonInterval(p1, n, alpha),
    };
  }, [p1, p2, alpha, power, n]);

  const exportCsv = () => {
    const rows = [
      "field,value",
      `baseline,${baseline?.model}`,
      `baseline_macro_f1,${p1}`,
      `mindtrace_macro_f1,${p2}`,
      `alpha,${alpha}`,
      `target_power,${power}`,
      `n_per_group,${n}`,
      `required_n_per_group,${Number.isFinite(results.required) ? results.required : "inf"}`,
      `achieved_power,${results.power.toFixed(4)}`,
      `minimum_detectable_effect,${results.mde.toFixed(4)}`,
      `wilson_ci_mindtrace,"[${results.ciOurs.map((v) => v.toFixed(4)).join(", ")}]"`,
      `wilson_ci_baseline,"[${results.ciBase.map((v) => v.toFixed(4)).join(", ")}]"`,
    ];
    const url = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "mindtrace-power-analysis.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const underpowered = results.power < power;
  const overlap = results.ciOurs[0] <= results.ciBase[1];

  return (
    <motion.div
      id="power-analysis"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-2xl p-6`}
    >
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Ruler className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-display font-bold text-lg text-foreground">Evaluation Power &amp; Sample Size</h3>
            <p className="text-xs text-muted-foreground">
              Two-proportion z-test planning for MindTrace vs. a chosen baseline on macro-F1.
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

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <label className="block">
          <span className="text-[11px] font-mono text-muted-foreground">Baseline</span>
          <select
            value={baselineModel}
            onChange={(e) => setBaselineName(e.target.value)}
            className="w-full mt-1 text-xs bg-muted/20 border border-border/40 rounded-lg px-2 py-1.5 text-foreground"
          >
            {others.map((b) => (
              <option key={b.model} value={b.model}>
                {b.model} ({b.macroF1.toFixed(3)})
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-[11px] font-mono text-muted-foreground">α = {alpha.toFixed(3)}</span>
          <input type="range" min={0.001} max={0.1} step={0.001} value={alpha}
            onChange={(e) => setAlpha(Number(e.target.value))} className="w-full accent-primary mt-2" />
        </label>
        <label className="block">
          <span className="text-[11px] font-mono text-muted-foreground">Target power = {pct(power)}</span>
          <input type="range" min={0.5} max={0.99} step={0.01} value={power}
            onChange={(e) => setPower(Number(e.target.value))} className="w-full accent-primary mt-2" />
        </label>
        <label className="block">
          <span className="text-[11px] font-mono text-muted-foreground">Held-out n = {n}</span>
          <input type="range" min={50} max={5000} step={10} value={n}
            onChange={(e) => setN(Number(e.target.value))} className="w-full accent-primary mt-2" />
        </label>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          {
            label: "Required n / group",
            value: Number.isFinite(results.required) ? results.required.toLocaleString() : "∞",
            note: `to detect Δ = ${(Math.abs(p2 - p1) * 100).toFixed(1)} pp`,
          },
          { label: "Achieved power at n", value: pct(results.power), note: underpowered ? "under target" : "meets target" },
          { label: "Min detectable effect", value: `${(results.mde * 100).toFixed(2)} pp`, note: `at n = ${n}` },
          {
            label: "Wilson 95% CI (ours)",
            value: `${results.ciOurs[0].toFixed(3)}–${results.ciOurs[1].toFixed(3)}`,
            note: overlap ? "overlaps baseline CI" : "separated from baseline CI",
          },
        ].map((m) => (
          <div key={m.label} className="p-4 rounded-xl bg-muted/10 border border-border/20">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">{m.label}</p>
            <p className="text-xl font-display font-bold text-primary">{m.value}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{m.note}</p>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-muted/10 border border-border/20 text-xs text-muted-foreground leading-relaxed">
        <span className="text-foreground font-medium">Reading:</span> comparing{" "}
        <span className="text-primary font-mono">{ours?.model}</span> ({p2.toFixed(3)}) against{" "}
        <span className="text-primary font-mono">{baseline?.model}</span> ({p1.toFixed(3)}), a held-out split of{" "}
        {n.toLocaleString()} items delivers {pct(results.power)} power at α = {alpha.toFixed(3)}.{" "}
        {underpowered
          ? `Reaching ${pct(power)} power needs about ${Number.isFinite(results.required) ? results.required.toLocaleString() : "∞"} items per group — report the CI overlap rather than a bare win.`
          : `The design is adequately powered; a null result at this n would be evidence of equivalence, not of missing data.`}
      </div>
    </motion.div>
  );
};

export default PowerAnalysisPanel;
