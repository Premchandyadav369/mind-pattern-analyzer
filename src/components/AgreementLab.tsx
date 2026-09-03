import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Users, Download, RefreshCw } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { seededRandom } from "@/lib/significance";
import {
  agreementReport,
  interpretKappa,
  type RatingMatrix,
} from "@/lib/agreement";

const LABELS = [
  "Confirmation",
  "Catastrophizing",
  "Overgeneralization",
  "Anchoring",
  "Black-and-White",
  "None",
];

const RATERS = ["Annotator A (psych.)", "Annotator B (ling.)", "Annotator C (clinical)"];

/** Reproducible annotation study: latent gold label + per-rater noise + missingness. */
function buildMatrix(items: number, noise: number, missing: number, seed: number): RatingMatrix {
  const rand = seededRandom(seed);
  const rows: RatingMatrix = [];
  for (let i = 0; i < items; i++) {
    const gold = LABELS[Math.floor(rand() * LABELS.length)];
    rows.push(
      RATERS.map((_, r) => {
        if (rand() < missing) return null;
        const slip = rand() < noise * (1 + r * 0.15);
        return slip ? LABELS[Math.floor(rand() * LABELS.length)] : gold;
      }),
    );
  }
  return rows;
}

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
const num = (v: number) => v.toFixed(3);

const AgreementLab = () => {
  const { isQuantum } = useTheme();
  const [items, setItems] = useState(240);
  const [noise, setNoise] = useState(0.22);
  const [missing, setMissing] = useState(0.05);
  const [seed, setSeed] = useState(2026);

  const matrix = useMemo(() => buildMatrix(items, noise, missing, seed), [items, noise, missing, seed]);
  const report = useMemo(() => agreementReport(matrix, RATERS), [matrix]);

  const exportCsv = () => {
    const lines = [
      "metric,value,interpretation",
      `observed_agreement,${num(report.observed)},`,
      `fleiss_kappa,${num(report.fleiss)},${interpretKappa(report.fleiss)}`,
      `krippendorff_alpha,${num(report.alpha)},${interpretKappa(report.alpha)}`,
      `gwet_ac1,${num(report.ac1)},${interpretKappa(report.ac1)}`,
      ...report.pairwise.map((p) => `cohens_kappa_${p.a}_vs_${p.b},${num(p.kappa)},${interpretKappa(p.kappa)}`),
      `items,${report.items},`,
      `raters,${report.raters},`,
      `seed,${seed},`,
    ];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `mindtrace-agreement-seed${seed}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const metrics = [
    { label: "Observed agreement (Pₒ)", value: pct(report.observed), note: "raw pairwise" },
    { label: "Fleiss' κ", value: num(report.fleiss), note: interpretKappa(report.fleiss) },
    { label: "Krippendorff's α", value: num(report.alpha), note: interpretKappa(report.alpha) },
    { label: "Gwet's AC1", value: num(report.ac1), note: interpretKappa(report.ac1) },
  ];

  return (
    <motion.div
      id="agreement"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-2xl p-6`}
    >
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-display font-bold text-lg text-foreground">Inter-Annotator Agreement Lab</h3>
            <p className="text-xs text-muted-foreground">
              Chance-corrected reliability over a 3-annotator, {LABELS.length}-class labelling protocol.
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

      <div className="grid sm:grid-cols-3 gap-4 mb-5">
        {[
          { label: `Items: ${items}`, value: items, min: 40, max: 800, step: 20, set: setItems },
          { label: `Rater noise: ${pct(noise)}`, value: noise, min: 0, max: 0.7, step: 0.01, set: setNoise },
          { label: `Missing ratings: ${pct(missing)}`, value: missing, min: 0, max: 0.4, step: 0.01, set: setMissing },
        ].map((c) => (
          <label key={c.label} className="block">
            <span className="text-[11px] font-mono text-muted-foreground">{c.label}</span>
            <input
              type="range"
              min={c.min}
              max={c.max}
              step={c.step}
              value={c.value}
              onChange={(e) => c.set(Number(e.target.value))}
              className="w-full accent-primary mt-1"
            />
          </label>
        ))}
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
              <th className="py-2 pr-3 font-medium">Rater pair</th>
              <th className="py-2 pr-3 font-medium">Cohen's κ</th>
              <th className="py-2 font-medium">Landis &amp; Koch band</th>
            </tr>
          </thead>
          <tbody>
            {report.pairwise.map((p) => (
              <tr key={`${p.a}-${p.b}`} className="border-b border-border/10">
                <td className="py-2 pr-3 text-foreground">{p.a} ↔ {p.b}</td>
                <td className="py-2 pr-3 font-mono text-primary">{num(p.kappa)}</td>
                <td className="py-2 text-muted-foreground">{interpretKappa(p.kappa)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-muted-foreground/70 mt-4 leading-relaxed">
        Ratings are generated from a seeded latent-gold simulator (seed {seed}) so every reported coefficient is
        exactly reproducible; swap in `agreementReport()` with real corpus annotations to report study values.
        Krippendorff's α is computed at the nominal level and is the only estimator here that uses partially
        missing rating vectors.
      </p>
    </motion.div>
  );
};

export default AgreementLab;
