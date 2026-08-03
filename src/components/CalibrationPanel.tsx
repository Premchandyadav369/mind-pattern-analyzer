import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Gauge, RefreshCw } from "lucide-react";
import { loadFeedback, type FeedbackRecord } from "@/lib/feedback";
import { fetchAnnotations } from "@/lib/feedbackCloud";
import {
  toCalibrationSamples,
  reliabilityBins,
  expectedCalibrationError,
  maximumCalibrationError,
  brierScore,
  overconfidence,
} from "@/lib/calibration";

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

const CalibrationPanel = () => {
  const [records, setRecords] = useState<FeedbackRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const cloud = await fetchAnnotations(500);
    const local = loadFeedback();
    const seen = new Set(cloud.map((c) => `${c.biasType}::${c.excerpt.slice(0, 60)}`));
    setRecords([...cloud, ...local.filter((l) => !seen.has(`${l.biasType}::${l.excerpt.slice(0, 60)}`))]);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("mindtrace:feedback", refresh);
    return () => window.removeEventListener("mindtrace:feedback", refresh);
  }, [refresh]);

  const { bins, ece, mce, brier, over, samples } = useMemo(() => {
    const s = toCalibrationSamples(records);
    return {
      samples: s,
      bins: reliabilityBins(s, 10),
      ece: expectedCalibrationError(s, 10),
      mce: maximumCalibrationError(s, 10),
      brier: brierScore(s),
      over: overconfidence(s),
    };
  }, [records]);

  const maxCount = Math.max(1, ...bins.map((b) => b.count));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      id="calibration"
      className="quantum-glass rounded-2xl p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground">Confidence Calibration</h3>
        </div>
        <button
          onClick={refresh}
          className="text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} /> Sync
        </button>
      </div>
      <p className="text-xs text-muted-foreground mb-5">
        Reliability diagram built from {samples.length} cloud + local annotations. A perfectly calibrated
        model sits on the diagonal: bars above it are under-confident, bars below are over-confident.
      </p>

      {samples.length === 0 ? (
        <p className="text-xs text-muted-foreground/70 py-6 text-center">
          Annotate a few results in the detector to populate the calibration curve.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: "ECE", value: pct(ece), hint: "expected calib. error" },
              { label: "MCE", value: pct(mce), hint: "worst bin gap" },
              { label: "Brier", value: brier.toFixed(3), hint: "lower is better" },
              {
                label: over >= 0 ? "Overconfidence" : "Underconfidence",
                value: pct(Math.abs(over)),
                hint: "mean conf − mean acc",
              },
            ].map((m) => (
              <div key={m.label} className="p-3 rounded-xl bg-muted/10 border border-border/20">
                <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                  {m.label}
                </div>
                <div className="text-lg font-display font-bold text-primary">{m.value}</div>
                <div className="text-[9px] text-muted-foreground/60">{m.hint}</div>
              </div>
            ))}
          </div>

          {/* Reliability diagram */}
          <div className="relative h-52 flex items-end gap-1 border-l border-b border-border/40 pl-2 pb-1">
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="0.4"
                  strokeDasharray="2 2" className="text-muted-foreground/40" />
              </svg>
            </div>
            {bins.map((b, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end items-center group relative h-full">
                <div
                  className={`w-full rounded-t transition-all ${
                    b.count === 0 ? "bg-muted/20" : b.gap < -0.1 ? "bg-destructive/60" : "bg-primary/70"
                  }`}
                  style={{ height: `${(b.count ? b.accuracy : 0) * 100}%` }}
                />
                <div
                  className="absolute bottom-0 w-1 bg-secondary/70 rounded-t"
                  style={{ height: `${(b.count ? b.avgConfidence : 0) * 100}%` }}
                />
                <div className="absolute -top-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap text-[9px] font-mono px-2 py-1 rounded bg-background border border-border/50">
                  {b.lo.toFixed(1)}–{b.hi.toFixed(1)} · n={b.count} · acc {pct(b.accuracy)} · conf{" "}
                  {pct(b.avgConfidence)}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-2 text-[9px] font-mono text-muted-foreground/60">
            <span>0.0 confidence</span>
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1"><i className="w-2 h-2 rounded-sm bg-primary/70 inline-block" /> accuracy</span>
              <span className="flex items-center gap-1"><i className="w-2 h-2 rounded-sm bg-secondary/70 inline-block" /> mean confidence</span>
              <span className="flex items-center gap-1"><i className="w-2 h-2 rounded-sm bg-destructive/60 inline-block" /> overconfident bin</span>
            </span>
            <span>1.0</span>
          </div>

          {/* Bin support */}
          <div className="mt-5">
            <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
              Bin support
            </div>
            <div className="flex items-end gap-1 h-10">
              {bins.map((b, i) => (
                <div
                  key={i}
                  className="flex-1 bg-accent/40 rounded-t"
                  style={{ height: `${(b.count / maxCount) * 100}%`, minHeight: b.count ? "3px" : "1px" }}
                  title={`${b.count} samples`}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default CalibrationPanel;
