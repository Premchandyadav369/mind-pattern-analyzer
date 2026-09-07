import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Scale, Download, RefreshCw } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { fairnessReport, type FairnessSample } from "@/lib/fairness";
import { seededRandom } from "@/lib/significance";

const GROUPS = ["Gender-coded", "Age-coded", "Region-coded", "Neutral"];

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

function simulate(seed: number, n: number, skew: number): FairnessSample[] {
  const rand = seededRandom(seed);
  const out: FairnessSample[] = [];
  GROUPS.forEach((group, gi) => {
    const bias = gi === GROUPS.length - 1 ? 0 : skew * ((gi + 1) / GROUPS.length);
    for (let i = 0; i < n; i++) {
      const yTrue = rand() < 0.45 ? 1 : 0;
      const flip = rand();
      let yPred = yTrue;
      if (yTrue === 1 && flip < 0.12 + bias) yPred = 0;
      if (yTrue === 0 && flip > 0.9 - bias) yPred = 1;
      out.push({ group, yTrue: yTrue as 0 | 1, yPred: yPred as 0 | 1 });
    }
  });
  return out;
}

const FairnessAudit = () => {
  const { isQuantum } = useTheme();
  const [seed, setSeed] = useState(7);
  const [n, setN] = useState(200);
  const [skew, setSkew] = useState(0.18);

  const samples = useMemo(() => simulate(seed, n, skew), [seed, n, skew]);
  const report = useMemo(() => fairnessReport(samples), [samples]);

  const exportCsv = () => {
    const lines = [
      "group,n,tp,fp,tn,fn,selection_rate,tpr,fpr,precision,accuracy",
      ...report.groups.map((g) =>
        [g.group, g.n, g.tp, g.fp, g.tn, g.fn, g.positiveRate, g.tpr, g.fpr, g.precision, g.accuracy]
          .map((v) => (typeof v === "number" ? Number(v).toFixed(4) : v))
          .join(","),
      ),
      `demographic_parity_difference,${report.demographicParityDifference.toFixed(4)},,,,,,,,,`,
      `disparate_impact_ratio,${report.disparateImpactRatio.toFixed(4)},,,,,,,,,`,
      `equal_opportunity_difference,${report.equalOpportunityDifference.toFixed(4)},,,,,,,,,`,
      `equalized_odds_difference,${report.equalizedOddsDifference.toFixed(4)},,,,,,,,,`,
      `seed,${seed},,,,,,,,,`,
    ];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `mindtrace-fairness-seed${seed}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const metrics = [
    { label: "Demographic parity Δ", value: pct(report.demographicParityDifference), note: "max − min selection rate" },
    {
      label: "Disparate impact",
      value: report.disparateImpactRatio.toFixed(3),
      note: report.fourFifthsPass ? "passes four-fifths rule" : "fails four-fifths rule",
    },
    { label: "Equal opportunity Δ", value: pct(report.equalOpportunityDifference), note: "TPR gap across groups" },
    { label: "Equalized odds Δ", value: pct(report.equalizedOddsDifference), note: "max(TPR gap, FPR gap)" },
  ];

  return (
    <motion.div
      id="fairness"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-2xl p-6`}
    >
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-display font-bold text-lg text-foreground">Fairness Audit</h3>
            <p className="text-xs text-muted-foreground">
              Demographic parity, equal opportunity and equalized odds across group-coded text slices.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSeed((s) => s + 1)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border/50 hover:border-primary/50 text-muted-foreground hover:text-primary transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Resample
          </button>
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <label className="block">
          <span className="text-[11px] font-mono text-muted-foreground">Items per group: {n}</span>
          <input type="range" min={40} max={600} step={20} value={n} onChange={(e) => setN(Number(e.target.value))} className="w-full accent-primary mt-1" />
        </label>
        <label className="block">
          <span className="text-[11px] font-mono text-muted-foreground">Injected group skew: {pct(skew)}</span>
          <input type="range" min={0} max={0.4} step={0.01} value={skew} onChange={(e) => setSkew(Number(e.target.value))} className="w-full accent-primary mt-1" />
        </label>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {metrics.map((m) => (
          <div key={m.label} className="p-4 rounded-xl bg-muted/10 border border-border/20">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">{m.label}</p>
            <p className="text-xl font-display font-bold text-primary">{m.value}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{m.note}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border/30">
              <th className="py-2 pr-3 font-medium">Group</th>
              <th className="py-2 pr-3 font-medium">n</th>
              <th className="py-2 pr-3 font-medium">Selection rate</th>
              <th className="py-2 pr-3 font-medium">TPR</th>
              <th className="py-2 pr-3 font-medium">FPR</th>
              <th className="py-2 font-medium">Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {report.groups.map((g) => (
              <tr key={g.group} className="border-b border-border/10">
                <td className="py-2 pr-3 text-foreground">{g.group}</td>
                <td className="py-2 pr-3 font-mono text-muted-foreground">{g.n}</td>
                <td className="py-2 pr-3 font-mono text-primary">{pct(g.positiveRate)}</td>
                <td className="py-2 pr-3 font-mono text-muted-foreground">{pct(g.tpr)}</td>
                <td className="py-2 pr-3 font-mono text-muted-foreground">{pct(g.fpr)}</td>
                <td className="py-2 font-mono text-muted-foreground">{pct(g.accuracy)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-muted-foreground/70 mt-4 leading-relaxed">
        Group labels come from a seeded simulator (seed {seed}) so audits are reproducible; feeding real
        group-annotated corpora into `fairnessReport()` yields the same metric set for a publishable fairness table.
      </p>
    </motion.div>
  );
};

export default FairnessAudit;
