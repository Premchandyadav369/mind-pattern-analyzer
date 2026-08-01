import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";
import {
  Upload,
  Play,
  FileDown,
  FileSpreadsheet,
  Loader2,
  Database,
  X,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { analyzeText } from "@/lib/biasAnalyzer";
import {
  parseDataset,
  toEvaluatedRow,
  summarize,
  buildBatchReport,
  buildBatchCsv,
  downloadFile,
  SAMPLE_DATASET,
  type DatasetRow,
  type EvaluatedRow,
  type BatchSummary,
} from "@/lib/batchEvaluation";

const MAX_ROWS = 40;
const pct = (n: number) => (n * 100).toFixed(1) + "%";

const BatchEvaluation = () => {
  const { isQuantum } = useTheme();
  const card = isQuantum ? "quantum-glass" : "glass-card";
  const fileRef = useRef<HTMLInputElement>(null);

  const [datasetName, setDatasetName] = useState("");
  const [rows, setRows] = useState<DatasetRow[]>([]);
  const [results, setResults] = useState<EvaluatedRow[]>([]);
  const [summary, setSummary] = useState<BatchSummary | null>(null);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);

  const loadRaw = (raw: string, name: string) => {
    const parsed = parseDataset(raw, name);
    if (!parsed.length) {
      toast.error("No usable passages found. Provide a CSV with a `text` column, JSONL, or one passage per line.");
      return;
    }
    const capped = parsed.slice(0, MAX_ROWS);
    setRows(capped);
    setDatasetName(name);
    setResults([]);
    setSummary(null);
    setDone(0);
    toast.success(
      `Loaded ${capped.length} passage${capped.length > 1 ? "s" : ""}${
        parsed.length > MAX_ROWS ? ` (capped from ${parsed.length})` : ""
      }`,
    );
  };

  const onFile = async (file?: File) => {
    if (!file) return;
    if (file.size > 2_000_000) {
      toast.error("File too large — keep datasets under 2 MB.");
      return;
    }
    loadRaw(await file.text(), file.name);
  };

  const run = async () => {
    if (!rows.length || running) return;
    setRunning(true);
    setDone(0);
    const out: EvaluatedRow[] = [];
    for (const row of rows) {
      try {
        const res = await analyzeText(row.text, "en");
        out.push(toEvaluatedRow(row, res));
      } catch (e) {
        out.push({
          ...row,
          predicted: [],
          confidences: {},
          biasCount: 0,
          topConfidence: 0,
          error: e instanceof Error ? e.message : "Analysis failed",
        });
      }
      setDone((d) => d + 1);
      setResults([...out]);
    }
    setSummary(summarize(out));
    setRunning(false);
    toast.success("Batch evaluation complete");
  };

  const stamp = new Date().toISOString().slice(0, 10);

  return (
    <section id="batch" className="py-28 px-6 relative">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-xs font-mono text-primary/70 uppercase tracking-widest mb-3 block">
            Batch Pipeline
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Dataset{" "}
            <span className={isQuantum ? "text-gradient-quantum" : "text-gradient-cyan"}>
              Evaluation
            </span>
          </h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">
            Upload a corpus, run every passage through the detector, and export a reproducible
            evaluation report with per-label precision, recall and F1.
          </p>
        </motion.div>

        {/* Upload */}
        <div
          className={`${card} rounded-2xl p-6 mb-6`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onFile(e.dataTransfer.files?.[0]);
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Database className="w-4 h-4 text-primary" />
                <h3 className="font-display font-semibold text-sm text-foreground">
                  Upload dataset
                </h3>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                CSV with a <span className="font-mono text-foreground">text</span> column (optional{" "}
                <span className="font-mono text-foreground">label</span> column, semicolon-separated
                for multi-label), JSON / JSONL, or plain text with one passage per line. Max{" "}
                {MAX_ROWS} passages per run.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.json,.jsonl,.ndjson,.txt,text/*"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0] ?? undefined)}
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 text-xs px-4 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" /> Choose file
              </button>
              <button
                onClick={() => loadRaw(SAMPLE_DATASET, "sample-corpus.csv")}
                className="flex items-center gap-2 text-xs px-4 py-2 rounded-xl border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Load sample
              </button>
            </div>
          </div>

          <AnimatePresence>
            {rows.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-5 pt-5 border-t border-border/30 flex flex-wrap items-center gap-3">
                  <span className="text-xs text-foreground font-mono">{datasetName}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/20 text-muted-foreground border border-border/30">
                    {rows.length} passages
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/30">
                    {rows.filter((r) => r.labels.length).length} labelled
                  </span>
                  <div className="flex-1" />
                  <button
                    onClick={() => {
                      setRows([]);
                      setResults([]);
                      setSummary(null);
                    }}
                    disabled={running}
                    className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg border border-border/50 text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors disabled:opacity-40"
                  >
                    <X className="w-3 h-3" /> Clear
                  </button>
                  <button
                    onClick={run}
                    disabled={running}
                    className="flex items-center gap-2 text-xs px-5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {running ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> {done}/{rows.length}
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" /> Run evaluation
                      </>
                    )}
                  </button>
                </div>

                {running && (
                  <div className="mt-4 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      animate={{ width: `${(done / rows.length) * 100}%` }}
                      transition={{ ease: "easeOut" }}
                    />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Summary */}
        {summary && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Evaluated", value: `${summary.evaluated}/${summary.total}` },
                { label: "Mean biases", value: summary.avgBiasesPerRow.toFixed(2) },
                {
                  label: "Macro F1",
                  value: summary.macroF1 === null ? "—" : pct(summary.macroF1),
                },
                {
                  label: "Exact match",
                  value: summary.exactMatch === null ? "—" : pct(summary.exactMatch),
                },
              ].map((m) => (
                <div key={m.label} className={`${card} rounded-xl p-4 text-center`}>
                  <div className="font-display text-2xl font-bold text-primary">{m.value}</div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Frequency */}
            <div className={`${card} rounded-2xl p-5`}>
              <h3 className="font-display font-semibold text-sm text-foreground mb-4">
                Bias frequency across corpus
              </h3>
              <div className="space-y-2.5">
                {summary.biasFrequency.map((b) => (
                  <div key={b.bias} className="grid grid-cols-[160px_1fr_auto] gap-3 items-center">
                    <span className="text-xs text-foreground truncate">{b.bias}</span>
                    <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${b.share * 100}%` }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground w-20 text-right">
                      {b.count} · {pct(b.share)}
                    </span>
                  </div>
                ))}
                {!summary.biasFrequency.length && (
                  <p className="text-xs text-muted-foreground">No biases detected in this corpus.</p>
                )}
              </div>
            </div>

            {/* Per-label scores */}
            {summary.perLabel.length > 0 && (
              <div className={`${card} rounded-2xl overflow-x-auto`}>
                <table className="w-full text-xs min-w-[560px]">
                  <thead>
                    <tr className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground border-b border-border/30">
                      <th className="p-3">Label</th>
                      <th className="p-3">Support</th>
                      <th className="p-3">TP</th>
                      <th className="p-3">FP</th>
                      <th className="p-3">FN</th>
                      <th className="p-3">Precision</th>
                      <th className="p-3">Recall</th>
                      <th className="p-3">F1</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.perLabel.map((s) => (
                      <tr key={s.label} className="border-b border-border/15 last:border-0">
                        <td className="p-3 text-foreground capitalize">{s.label}</td>
                        <td className="p-3 font-mono text-muted-foreground">{s.support}</td>
                        <td className="p-3 font-mono text-secondary">{s.tp}</td>
                        <td className="p-3 font-mono text-destructive">{s.fp}</td>
                        <td className="p-3 font-mono text-accent">{s.fn}</td>
                        <td className="p-3 font-mono text-muted-foreground">{pct(s.precision)}</td>
                        <td className="p-3 font-mono text-muted-foreground">{pct(s.recall)}</td>
                        <td className="p-3 font-mono text-primary">{pct(s.f1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Per-row */}
            <div className={`${card} rounded-2xl p-5`}>
              <h3 className="font-display font-semibold text-sm text-foreground mb-4">
                Per-passage predictions
              </h3>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {results.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-lg bg-muted/10 border border-border/20 flex items-start gap-3"
                  >
                    {r.error ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-secondary mt-0.5 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-foreground line-clamp-2">{r.text}</p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {r.error && (
                          <span className="text-[10px] text-destructive">{r.error}</span>
                        )}
                        {r.predicted.map((p) => (
                          <span
                            key={p}
                            className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                          >
                            {p} {pct(r.confidences[p] ?? 0)}
                          </span>
                        ))}
                        {r.labels.map((l) => (
                          <span
                            key={`g-${l}`}
                            className="text-[9px] px-2 py-0.5 rounded-full bg-muted/20 text-muted-foreground border border-border/30"
                          >
                            gold: {l}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Exports */}
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() =>
                  downloadFile(
                    `mindtrace-batch-report-${stamp}.md`,
                    buildBatchReport(results, summary, datasetName),
                    "text/markdown",
                  )
                }
                className="flex items-center gap-2 text-xs px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                <FileDown className="w-3.5 h-3.5" /> Download research report (.md)
              </button>
              <button
                onClick={() =>
                  downloadFile(
                    `mindtrace-batch-results-${stamp}.csv`,
                    buildBatchCsv(results),
                    "text/csv",
                  )
                }
                className="flex items-center gap-2 text-xs px-5 py-2.5 rounded-xl border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Download raw results (.csv)
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default BatchEvaluation;
