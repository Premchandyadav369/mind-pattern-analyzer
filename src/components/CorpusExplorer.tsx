import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Database, RefreshCw, Download, Search } from "lucide-react";
import { fetchAnnotations, type CloudAnnotation } from "@/lib/feedbackCloud";

const verdictStyles: Record<string, string> = {
  correct: "bg-secondary/10 text-secondary border-secondary/30",
  partial: "bg-accent/10 text-accent border-accent/30",
  incorrect: "bg-destructive/10 text-destructive border-destructive/30",
};

const toCsv = (rows: CloudAnnotation[]) => {
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const head = ["id", "bias_type", "verdict", "corrected_label", "confidence", "note", "excerpt", "created_at"];
  const body = rows.map((r) =>
    [r.id, r.biasType, r.verdict, r.correctedLabel ?? "", r.confidence, r.note ?? "", r.excerpt, r.createdAt]
      .map(esc)
      .join(",")
  );
  return [head.join(","), ...body].join("\n");
};

const CorpusExplorer = () => {
  const [rows, setRows] = useState<CloudAnnotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [verdict, setVerdict] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    setRows(await fetchAnnotations(300));
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    window.addEventListener("mindtrace:feedback", load);
    return () => window.removeEventListener("mindtrace:feedback", load);
  }, [load]);

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (verdict === "all" || r.verdict === verdict) &&
          (query.trim() === "" ||
            `${r.biasType} ${r.excerpt} ${r.correctedLabel ?? ""} ${r.note ?? ""}`
              .toLowerCase()
              .includes(query.toLowerCase()))
      ),
    [rows, query, verdict]
  );

  const agreement = rows.length
    ? rows.filter((r) => r.verdict === "correct").length / rows.length
    : 0;
  const annotators = new Set(rows.map((r) => r.sessionId)).size;

  const download = () => {
    const url = URL.createObjectURL(new Blob([toCsv(filtered)], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "mindtrace-annotation-corpus.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="quantum-glass rounded-2xl p-6"
      id="corpus"
    >
      <div className="flex items-center gap-2 mb-1">
        <Database className="w-4 h-4 text-primary" />
        <h3 className="font-display font-semibold text-foreground">Shared Annotation Corpus</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-5">
        Every human judgement submitted from any session, synced to the cloud store — the re-training corpus for the next model iteration.
      </p>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Annotations", value: rows.length },
          { label: "Annotators", value: annotators },
          { label: "Agreement", value: `${Math.round(agreement * 100)}%` },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-muted/20 border border-border/30 p-3">
            <div className="text-xl font-display font-bold text-foreground">{s.value}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-muted/30 border border-border/40 rounded-lg px-2.5">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search corpus…"
            className="flex-1 bg-transparent text-xs py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          />
        </div>
        <select
          value={verdict}
          onChange={(e) => setVerdict(e.target.value)}
          className="text-xs bg-muted/30 border border-border/40 rounded-lg px-2 text-foreground"
        >
          <option value="all">All verdicts</option>
          <option value="correct">Correct</option>
          <option value="partial">Partly</option>
          <option value="incorrect">Wrong</option>
        </select>
        <button
          onClick={load}
          className="text-[11px] px-2.5 py-2 rounded-lg border border-border/40 text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
        <button
          onClick={download}
          disabled={filtered.length === 0}
          className="text-[11px] px-2.5 py-2 rounded-lg border border-primary/40 text-primary hover:bg-primary/10 disabled:opacity-40 flex items-center gap-1"
        >
          <Download className="w-3 h-3" /> CSV
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto space-y-2">
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground py-6 text-center">
            {loading ? "Loading corpus…" : "No annotations match yet — rate a detection to seed the corpus."}
          </p>
        )}
        {filtered.map((r) => (
          <div key={r.id} className="rounded-xl bg-muted/15 border border-border/30 p-3">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[11px] font-semibold text-foreground">{r.biasType}</span>
              <span className={`text-[9px] px-2 py-0.5 rounded-full border uppercase ${verdictStyles[r.verdict] ?? ""}`}>
                {r.verdict}
              </span>
              {r.correctedLabel && (
                <span className="text-[10px] text-muted-foreground">→ {r.correctedLabel}</span>
              )}
              <span className="ml-auto text-[10px] font-mono text-muted-foreground/70">
                {(r.confidence * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground line-clamp-2">{r.excerpt}</p>
            {r.note && <p className="text-[10px] text-muted-foreground/70 mt-1 italic">“{r.note}”</p>}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default CorpusExplorer;
