import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Download } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { runRobustness } from "@/lib/robustness";

const SAMPLE = "Everyone always thinks I am a failure and this project is obviously a disaster.";

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

const AdversarialLab = () => {
  const { isQuantum } = useTheme();
  const [text, setText] = useState(SAMPLE);
  const report = useMemo(() => runRobustness(text), [text]);

  const exportCsv = () => {
    const lines = [
      "perturbation,labels,confidence,confidence_delta,label_overlap,flipped,perturbed_text",
      ...report.rows.map((r) =>
        [
          r.label,
          `"${r.labels.join(" | ")}"`,
          r.confidence.toFixed(4),
          r.confidenceDelta.toFixed(4),
          r.labelOverlap.toFixed(4),
          r.labelFlipped,
          `"${r.perturbed.replace(/"/g, "'")}"`,
        ].join(","),
      ),
      `summary_flip_rate,${report.flipRate.toFixed(4)},,,,,`,
      `summary_robustness_score,${report.robustnessScore.toFixed(4)},,,,,`,
    ];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "mindtrace-robustness.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const metrics = [
    { label: "Robustness score", value: pct(report.robustnessScore), note: "0.6·label overlap + 0.4·confidence stability" },
    { label: "Attack flip rate", value: pct(report.flipRate), note: "perturbations that changed the label set" },
    { label: "Mean |Δ confidence|", value: report.meanAbsConfidenceShift.toFixed(3), note: "absolute shift under attack" },
    { label: "Baseline labels", value: report.original.labels.length || "—", note: report.original.labels.join(", ") || "no bias detected" },
  ];

  return (
    <motion.div
      id="adversarial"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-2xl p-6`}
    >
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-display font-bold text-lg text-foreground">Adversarial Robustness Lab</h3>
            <p className="text-xs text-muted-foreground">
              Semantically-preserving perturbations measure decision stability (Ribeiro et al., CheckList 2020).
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
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="w-full text-sm rounded-xl bg-muted/10 border border-border/30 p-3 text-foreground focus:outline-none focus:border-primary/50 mb-5"
        placeholder="Text to attack…"
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {metrics.map((m) => (
          <div key={m.label} className="p-4 rounded-xl bg-muted/10 border border-border/20">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">{m.label}</p>
            <p className="text-xl font-display font-bold text-primary">{m.value}</p>
            <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{m.note}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border/30">
              <th className="py-2 pr-3 font-medium">Attack</th>
              <th className="py-2 pr-3 font-medium">Predicted labels</th>
              <th className="py-2 pr-3 font-medium">Conf.</th>
              <th className="py-2 pr-3 font-medium">Δ</th>
              <th className="py-2 font-medium">Overlap</th>
            </tr>
          </thead>
          <tbody>
            {report.rows.map((r) => (
              <tr key={r.kind} className="border-b border-border/10 align-top">
                <td className="py-2 pr-3 text-foreground whitespace-nowrap">
                  {r.label}
                  {r.labelFlipped && <span className="ml-2 text-[10px] text-destructive">flipped</span>}
                </td>
                <td className="py-2 pr-3 text-muted-foreground max-w-[220px]">{r.labels.join(", ") || "—"}</td>
                <td className="py-2 pr-3 font-mono text-primary">{r.confidence.toFixed(2)}</td>
                <td className={`py-2 pr-3 font-mono ${r.confidenceDelta < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                  {r.confidenceDelta >= 0 ? "+" : ""}
                  {r.confidenceDelta.toFixed(2)}
                </td>
                <td className="py-2 font-mono text-muted-foreground">{r.labelOverlap.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {report.worst && (
        <p className="text-[11px] text-muted-foreground mt-4">
          Worst case: <span className="text-primary">{report.worst.label}</span> →{" "}
          <span className="italic">"{report.worst.perturbed.slice(0, 120)}"</span>
        </p>
      )}
      <p className="text-[10px] text-muted-foreground/70 mt-3 leading-relaxed">
        The probe classifier is a deterministic lexical scorer that runs entirely in the browser, so every attack
        result is reproducible without a network call. Swap `lexicalPredict` for the served model to report
        production robustness numbers.
      </p>
    </motion.div>
  );
};

export default AdversarialLab;
