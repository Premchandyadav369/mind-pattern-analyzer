import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, Trash2, Users } from "lucide-react";
import {
  loadFeedback,
  clearFeedback,
  computeFeedbackStats,
  feedbackToCsv,
  feedbackToJsonl,
  type FeedbackRecord,
} from "@/lib/feedback";

const downloadFile = (content: string, name: string, type: string) => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};

const FeedbackDashboard = () => {
  const [records, setRecords] = useState<FeedbackRecord[]>([]);
  const refresh = useCallback(() => setRecords(loadFeedback()), []);

  useEffect(() => {
    refresh();
    window.addEventListener("mindtrace:feedback", refresh);
    return () => window.removeEventListener("mindtrace:feedback", refresh);
  }, [refresh]);

  const stats = computeFeedbackStats(records);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="quantum-glass rounded-2xl p-6"
      id="feedback"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground">Human Feedback Loop</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={!records.length}
            onClick={() => downloadFile(feedbackToJsonl(records), "mindtrace-feedback.jsonl", "application/json")}
            className="text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors flex items-center gap-1"
          >
            <Download className="w-3 h-3" /> JSONL
          </button>
          <button
            disabled={!records.length}
            onClick={() => downloadFile(feedbackToCsv(records), "mindtrace-feedback.csv", "text/csv")}
            className="text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors flex items-center gap-1"
          >
            <Download className="w-3 h-3" /> CSV
          </button>
          <button
            disabled={!records.length}
            onClick={() => {
              clearFeedback();
              refresh();
            }}
            className="text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-lg border border-border/50 text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> Clear
          </button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-5">
        Annotator verdicts collected on live predictions. Exports are formatted for supervised re-training and
        inter-annotator agreement reporting.
      </p>

      {records.length === 0 ? (
        <p className="text-sm text-muted-foreground/60 py-6 text-center">
          No feedback yet — run an analysis and rate the detected biases to build your corpus.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {[
              { label: "Annotations", value: String(stats.total) },
              { label: "Agreement", value: `${(stats.agreement * 100).toFixed(1)}%` },
              { label: "Cohen's κ", value: stats.kappa.toFixed(2) },
              { label: "Corrections", value: String(stats.corrections.length) },
            ].map((s) => (
              <div key={s.label} className="p-3 rounded-xl bg-muted/20 border border-border/30">
                <div className="text-xl font-display font-bold text-primary">{s.value}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="space-y-2 mb-5">
            {stats.perClass.map((c) => (
              <div key={c.biasType} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-48 truncate">{c.biasType}</span>
                <div className="flex-1 h-2 rounded-full bg-muted/20 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-secondary"
                    style={{ width: `${c.agreement * 100}%`, opacity: 0.8 }}
                  />
                </div>
                <span className="text-[10px] font-mono-code text-muted-foreground/70 w-20 text-right">
                  {(c.agreement * 100).toFixed(0)}% · n={c.total}
                </span>
              </div>
            ))}
          </div>

          {stats.corrections.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {stats.corrections.map((c) => (
                <span
                  key={`${c.from}-${c.to}`}
                  className="text-[10px] font-mono-code px-2.5 py-1 rounded-lg bg-destructive/10 text-destructive border border-destructive/20"
                >
                  {c.from} → {c.to} ×{c.count}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default FeedbackDashboard;
