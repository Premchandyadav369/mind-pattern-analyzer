import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, Wand2, RotateCcw } from "lucide-react";
import { loadFeedback, type FeedbackRecord } from "@/lib/feedback";
import { fetchAnnotations } from "@/lib/feedbackCloud";
import {
  toCalibrationSamples,
  sweepThresholds,
  bestThreshold,
  loadThreshold,
  saveThreshold,
  DEFAULT_THRESHOLD,
} from "@/lib/calibration";

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

const ThresholdTuner = () => {
  const [records, setRecords] = useState<FeedbackRecord[]>([]);
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD);

  const refresh = useCallback(async () => {
    const cloud = await fetchAnnotations(500);
    const local = loadFeedback();
    const seen = new Set(cloud.map((c) => `${c.biasType}::${c.excerpt.slice(0, 60)}`));
    setRecords([...cloud, ...local.filter((l) => !seen.has(`${l.biasType}::${l.excerpt.slice(0, 60)}`))]);
  }, []);

  useEffect(() => {
    setThreshold(loadThreshold());
    refresh();
    window.addEventListener("mindtrace:feedback", refresh);
    return () => window.removeEventListener("mindtrace:feedback", refresh);
  }, [refresh]);

  const { points, best, current } = useMemo(() => {
    const samples = toCalibrationSamples(records);
    const pts = sweepThresholds(samples, 0.05);
    const nearest = pts.reduce(
      (a, p) => (Math.abs(p.threshold - threshold) < Math.abs(a.threshold - threshold) ? p : a),
      pts[0]
    );
    return { points: pts, best: bestThreshold(pts), current: nearest };
  }, [records, threshold]);

  const apply = (v: number) => {
    setThreshold(v);
    saveThreshold(v);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      id="threshold"
      className="quantum-glass rounded-2xl p-6"
    >
      <div className="flex items-center gap-2 mb-1">
        <SlidersHorizontal className="w-4 h-4 text-primary" />
        <h3 className="font-display font-semibold text-foreground">Decision Threshold Tuning</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-5">
        Predictions below the threshold are suppressed in the detector. Sweep the operating point to trade
        precision against coverage — the curve is computed on your annotated corpus.
      </p>

      <div className="flex flex-wrap items-center gap-4 mb-5">
        <div className="flex-1 min-w-[220px]">
          <input
            type="range"
            min={0}
            max={0.95}
            step={0.05}
            value={threshold}
            onChange={(e) => apply(Number(e.target.value))}
            className="w-full accent-primary"
            aria-label="Decision threshold"
          />
          <div className="flex justify-between text-[9px] font-mono text-muted-foreground/60 mt-1">
            <span>0.00 (max recall)</span>
            <span>0.95 (max precision)</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-display font-bold text-primary">{threshold.toFixed(2)}</div>
          <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">active τ</div>
        </div>
        <div className="flex gap-2">
          <button
            disabled={!best}
            onClick={() => best && apply(best.threshold)}
            className="text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-lg border border-primary/40 text-primary hover:bg-primary/10 disabled:opacity-30 transition-colors flex items-center gap-1"
          >
            <Wand2 className="w-3 h-3" /> Auto-tune
          </button>
          <button
            onClick={() => apply(DEFAULT_THRESHOLD)}
            className="text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      </div>

      {records.length === 0 ? (
        <p className="text-xs text-muted-foreground/70 py-4 text-center">
          No annotations yet — the threshold still applies to the detector, but the sweep needs labelled data.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Precision", value: pct(current?.precision ?? 0) },
              { label: "Recall", value: pct(current?.recall ?? 0) },
              { label: "F1", value: (current?.f1 ?? 0).toFixed(3) },
              { label: "Coverage", value: pct(current?.coverage ?? 0) },
            ].map((m) => (
              <div key={m.label} className="p-3 rounded-xl bg-muted/10 border border-border/20">
                <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                  {m.label}
                </div>
                <div className="text-lg font-display font-bold text-foreground">{m.value}</div>
              </div>
            ))}
          </div>

          {/* PR / F1 vs threshold curve */}
          <div className="relative h-44 border-l border-b border-border/40">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {(["precision", "recall", "f1"] as const).map((key, ki) => (
                <polyline
                  key={key}
                  fill="none"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                  className={
                    ki === 0 ? "stroke-primary" : ki === 1 ? "stroke-secondary" : "stroke-accent"
                  }
                  points={points
                    .map((p, i) => `${(i / (points.length - 1)) * 100},${100 - p[key] * 100}`)
                    .join(" ")}
                />
              ))}
              <line
                x1={threshold * 100}
                y1="0"
                x2={threshold * 100}
                y2="100"
                className="stroke-foreground/40"
                strokeWidth="1"
                strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
          <div className="flex items-center justify-between mt-2 text-[9px] font-mono text-muted-foreground/60">
            <span>τ = 0</span>
            <span className="flex gap-3">
              <span className="text-primary">precision</span>
              <span className="text-secondary">recall</span>
              <span className="text-accent">F1</span>
            </span>
            <span>τ = 1</span>
          </div>

          {best && (
            <div className="mt-5 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-xs text-foreground">
                <span className="font-display font-semibold">Recommended operating point:</span> τ ={" "}
                {best.threshold.toFixed(2)} → F1 {best.f1.toFixed(3)}, precision {pct(best.precision)},
                recall {pct(best.recall)}, keeping {pct(best.coverage)} of predictions.
              </p>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default ThresholdTuner;
