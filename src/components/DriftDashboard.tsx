import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, RefreshCw, Download, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { driftReport, type DriftEntry } from "@/lib/drift";

const STORAGE_KEY = "mindtrace-history";

function readHistory(): DriftEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const trendIcon = { increasing: TrendingUp, decreasing: TrendingDown, "no trend": Minus } as const;

const DriftDashboard = () => {
  const { isQuantum } = useTheme();
  const [entries, setEntries] = useState<DriftEntry[]>([]);
  const [bucketDays, setBucketDays] = useState(1);
  const refresh = useCallback(() => setEntries(readHistory()), []);

  useEffect(() => {
    refresh();
    window.addEventListener("mindtrace:analysis", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("mindtrace:analysis", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  const report = useMemo(() => driftReport(entries, bucketDays), [entries, bucketDays]);
  const max = Math.max(1, ...report.buckets.map((b) => b.avgBiases));
  const VolIcon = trendIcon[report.volumeTrend.trend];
  const ConfIcon = trendIcon[report.confidenceTrend.trend];

  const exportCsv = () => {
    const lines = [
      "bucket,analyses,detections,avg_biases,avg_confidence",
      ...report.buckets.map((b) =>
        [b.key, b.analyses, b.detections, b.avgBiases.toFixed(4), b.avgConfidence.toFixed(4)].join(","),
      ),
      `psi,${report.psi.toFixed(4)},${report.psiLabel},,`,
      `mann_kendall_volume,${report.volumeTrend.tau.toFixed(4)},p=${report.volumeTrend.pValue.toFixed(4)},,`,
    ];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "mindtrace-drift.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      id="drift"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-2xl p-6`}
    >
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-display font-bold text-lg text-foreground">Temporal Drift Dashboard</h3>
            <p className="text-xs text-muted-foreground">
              PSI, Mann-Kendall trend tests and CUSUM change detection over your analysis history.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={bucketDays}
            onChange={(e) => setBucketDays(Number(e.target.value))}
            className="text-xs px-2 py-1.5 rounded-lg bg-muted/10 border border-border/40 text-foreground"
          >
            <option value={1}>Daily</option>
            <option value={7}>Weekly</option>
            <option value={30}>Monthly</option>
          </select>
          <button
            onClick={refresh}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border/50 hover:border-primary/50 text-muted-foreground hover:text-primary transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        </div>
      </div>

      {report.buckets.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          Run a few analyses — drift statistics appear once your history has entries.
        </p>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <div className="p-4 rounded-xl bg-muted/10 border border-border/20">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">PSI (first vs. second half)</p>
              <p className="text-xl font-display font-bold text-primary">{report.psi.toFixed(3)}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{report.psiLabel}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/10 border border-border/20">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Bias volume trend</p>
              <p className="text-xl font-display font-bold text-primary flex items-center gap-1">
                <VolIcon className="w-4 h-4" /> τ = {report.volumeTrend.tau.toFixed(2)}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {report.volumeTrend.trend} · p = {report.volumeTrend.pValue.toFixed(3)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/10 border border-border/20">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Confidence trend</p>
              <p className="text-xl font-display font-bold text-primary flex items-center gap-1">
                <ConfIcon className="w-4 h-4" /> τ = {report.confidenceTrend.tau.toFixed(2)}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {report.confidenceTrend.trend} · p = {report.confidenceTrend.pValue.toFixed(3)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/10 border border-border/20">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">CUSUM alarms</p>
              <p className="text-xl font-display font-bold text-primary">{report.alarms.length}</p>
              <p className="text-[10px] text-muted-foreground mt-1">change points in bias volume</p>
            </div>
          </div>

          <div className="flex items-end gap-1 h-28 mb-2">
            {report.buckets.map((b, i) => (
              <div key={b.key} className="flex-1 flex flex-col justify-end group relative">
                <div
                  className={`rounded-t ${report.alarms.includes(i) ? "bg-destructive/70" : "bg-primary/60"}`}
                  style={{ height: `${(b.avgBiases / max) * 100}%`, minHeight: 2 }}
                  title={`${b.key}: ${b.avgBiases.toFixed(2)} biases/analysis`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mb-5">
            <span>{report.buckets[0].key}</span>
            <span>biases per analysis</span>
            <span>{report.buckets[report.buckets.length - 1].key}</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-foreground mb-2">Rising biases</p>
              {report.rising.length === 0 && <p className="text-xs text-muted-foreground">None.</p>}
              {report.rising.map((r) => (
                <div key={r.biasType} className="flex justify-between text-xs py-1 border-b border-border/10">
                  <span className="text-muted-foreground">{r.biasType}</span>
                  <span className="font-mono text-destructive">+{(r.delta * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-medium text-foreground mb-2">Receding biases</p>
              {report.falling.length === 0 && <p className="text-xs text-muted-foreground">None.</p>}
              {report.falling.map((r) => (
                <div key={r.biasType} className="flex justify-between text-xs py-1 border-b border-border/10">
                  <span className="text-muted-foreground">{r.biasType}</span>
                  <span className="font-mono text-primary">{(r.delta * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default DriftDashboard;
