import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Search, Download } from "lucide-react";
import { loadFeedback, type FeedbackRecord } from "@/lib/feedback";
import { fetchAnnotations } from "@/lib/feedbackCloud";
import { analyzeDisagreements } from "@/lib/calibration";

const pct = (n: number) => `${(n * 100).toFixed(0)}%`;

const DisagreementDeepDive = () => {
  const [records, setRecords] = useState<FeedbackRecord[]>([]);
  const [query, setQuery] = useState("");
  const [cutoff, setCutoff] = useState(0.7);

  const refresh = useCallback(async () => {
    const cloud = await fetchAnnotations(500);
    const local = loadFeedback();
    const seen = new Set(cloud.map((c) => `${c.biasType}::${c.excerpt.slice(0, 60)}`));
    setRecords([...cloud, ...local.filter((l) => !seen.has(`${l.biasType}::${l.excerpt.slice(0, 60)}`))]);
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("mindtrace:feedback", refresh);
    return () => window.removeEventListener("mindtrace:feedback", refresh);
  }, [refresh]);

  const report = useMemo(() => analyzeDisagreements(records, cutoff), [records, cutoff]);

  const cases = useMemo(
    () =>
      report.highConfidenceErrors.filter((c) =>
        query
          ? `${c.biasType} ${c.correctedLabel ?? ""} ${c.excerpt}`.toLowerCase().includes(query.toLowerCase())
          : true
      ),
    [report, query]
  );

  const exportCases = () => {
    const rows = [
      ["predicted", "gold", "confidence", "note", "excerpt", "annotated_at"].join(","),
      ...report.highConfidenceErrors.map((c) =>
        [c.biasType, c.correctedLabel ?? "", c.confidence, c.note ?? "", c.excerpt, c.createdAt]
          .map((v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v)))
          .join(",")
      ),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([rows], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "mindtrace-disagreements.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const maxSeverity = Math.max(1, ...report.pairs.map((p) => p.severity));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      id="disagreement"
      className="quantum-glass rounded-2xl p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <h3 className="font-display font-semibold text-foreground">Disagreement Deep Dive</h3>
        </div>
        <button
          disabled={!report.highConfidenceErrors.length}
          onClick={exportCases}
          className="text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors flex items-center gap-1"
        >
          <Download className="w-3 h-3" /> Cases CSV
        </button>
      </div>
      <p className="text-xs text-muted-foreground mb-5">
        Where annotators overrule the model. High-confidence errors are the most damaging failure mode and
        the highest-value re-training signal.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Disagreements", value: String(report.totalDisagreements) },
          { label: "Disagree rate", value: pct(report.disagreementRate) },
          { label: "Conf. when right", value: pct(report.avgConfidenceCorrect) },
          { label: "Conf. when wrong", value: pct(report.avgConfidenceWrong) },
        ].map((m) => (
          <div key={m.label} className="p-3 rounded-xl bg-muted/10 border border-border/20">
            <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
              {m.label}
            </div>
            <div className="text-lg font-display font-bold text-foreground">{m.value}</div>
          </div>
        ))}
      </div>

      {records.length === 0 ? (
        <p className="text-xs text-muted-foreground/70 py-4 text-center">
          No annotations yet — mark results as Partly/Wrong in the detector to build this view.
        </p>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Confusion pairs */}
          <div>
            <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
              Predicted → Gold (ranked by severity)
            </div>
            <div className="space-y-2">
              {report.pairs.length === 0 && (
                <p className="text-xs text-muted-foreground/70">No labelled corrections yet.</p>
              )}
              {report.pairs.slice(0, 8).map((p) => (
                <div key={`${p.from}->${p.to}`} className="p-3 rounded-xl bg-muted/10 border border-border/20">
                  <div className="flex items-center justify-between gap-2 text-xs mb-2">
                    <span className="text-foreground truncate">
                      <span className="text-destructive">{p.from}</span>
                      <span className="text-muted-foreground"> → </span>
                      <span className="text-secondary">{p.to}</span>
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                      ×{p.count} · {pct(p.avgConfidence)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-destructive/70"
                      style={{ width: `${(p.severity / maxSeverity) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {report.worstClasses.length > 0 && (
              <>
                <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mt-6 mb-3">
                  Weakest classes
                </div>
                <div className="space-y-1.5">
                  {report.worstClasses.slice(0, 6).map((c) => (
                    <div key={c.biasType} className="flex items-center justify-between text-xs">
                      <span className="text-foreground truncate">{c.biasType}</span>
                      <span className="font-mono text-[10px] text-destructive shrink-0">
                        {pct(c.errorRate)} err ({c.errors}/{c.total})
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Case explorer */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search failure cases…"
                  className="w-full pl-8 pr-3 py-2 rounded-lg bg-muted/20 border border-border/30 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/40"
                />
              </div>
              <select
                value={cutoff}
                onChange={(e) => setCutoff(Number(e.target.value))}
                className="text-[10px] font-mono px-2 py-2 rounded-lg bg-muted/20 border border-border/30 text-foreground focus:outline-none"
                aria-label="Confidence cutoff"
              >
                {[0.5, 0.6, 0.7, 0.8, 0.9].map((c) => (
                  <option key={c} value={c}>
                    ≥ {c.toFixed(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 max-h-[22rem] overflow-y-auto pr-1">
              {cases.length === 0 && (
                <p className="text-xs text-muted-foreground/70">No high-confidence failures at this cutoff.</p>
              )}
              {cases.map((c, i) => (
                <div key={i} className="p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono text-destructive">
                      {c.biasType}
                      {c.correctedLabel ? ` → ${c.correctedLabel}` : ""}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">{pct(c.confidence)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">“{c.excerpt}”</p>
                  {c.note && (
                    <p className="text-[10px] text-foreground/70 mt-1.5 italic">Annotator: {c.note}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DisagreementDeepDive;
