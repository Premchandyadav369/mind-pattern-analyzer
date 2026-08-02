import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import {
  buildConfusionMatrix,
  normalizeRows,
  topConfusions,
  diagonalAccuracy,
  matrixToCsv,
} from "@/lib/confusionMatrix";

const short = (label: string) =>
  label
    .split(/[\s-]+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

const ConfusionHeatmap = () => {
  const [normalized, setNormalized] = useState(true);
  const matrix = useMemo(() => buildConfusionMatrix(), []);
  const norm = useMemo(() => normalizeRows(matrix), [matrix]);
  const top = useMemo(() => topConfusions(matrix, 5), [matrix]);
  const acc = diagonalAccuracy(matrix);

  const download = () => {
    const blob = new Blob([matrixToCsv(matrix)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mindtrace-confusion-matrix.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="quantum-glass rounded-2xl p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">🧯</span>
          <h3 className="font-display font-semibold text-foreground">Confusion Heatmap</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setNormalized((n) => !n)}
            className="text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            {normalized ? "Row %" : "Counts"}
          </button>
          <button
            onClick={download}
            className="text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Download className="w-3 h-3" /> CSV
          </button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-5">
        Gold annotations (rows) vs. model predictions (columns) on the held-out test split (n = 2,140). Diagonal
        accuracy {(acc * 100).toFixed(1)}%.
      </p>

      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="text-[9px] text-muted-foreground/50 font-mono-code text-left pr-2">gold \ pred</th>
              {matrix.columns.map((c) => (
                <th key={c} className="text-[9px] text-muted-foreground font-mono-code w-9" title={c}>
                  {short(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.rows.map((row, i) => (
              <tr key={matrix.labels[i]}>
                <td className="text-[10px] text-muted-foreground whitespace-nowrap pr-2 max-w-[170px] truncate">
                  {matrix.labels[i]}
                </td>
                {row.map((count, j) => {
                  const rate = norm[i][j];
                  const isDiag = i === j;
                  return (
                    <td key={j}>
                      <div
                        title={`${matrix.labels[i]} → ${matrix.columns[j]}: ${count} (${(rate * 100).toFixed(1)}%)`}
                        className="w-9 h-9 rounded-md flex items-center justify-center text-[9px] font-mono-code font-bold border"
                        style={{
                          backgroundColor: isDiag
                            ? `hsl(var(--secondary) / ${0.15 + rate * 0.7})`
                            : `hsl(var(--destructive) / ${rate === 0 ? 0.03 : 0.15 + rate * 1.6})`,
                          borderColor: rate === 0 ? "hsl(var(--border) / 0.4)" : "transparent",
                          color: rate > 0.35 ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground) / 0.7)",
                        }}
                      >
                        {count === 0 ? "" : normalized ? `${Math.round(rate * 100)}` : count}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 grid md:grid-cols-2 gap-3">
        {top.map((p) => (
          <div key={`${p.gold}-${p.predicted}`} className="p-3 rounded-xl bg-muted/20 border border-border/30">
            <p className="text-xs text-foreground">
              <span className="font-semibold">{p.gold}</span>
              <span className="text-muted-foreground"> mislabelled as </span>
              <span className="font-semibold text-destructive">{p.predicted}</span>
            </p>
            <p className="text-[10px] text-muted-foreground/70 font-mono-code mt-1">
              {p.count} cases · {(p.rate * 100).toFixed(1)}% of that class
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ConfusionHeatmap;
