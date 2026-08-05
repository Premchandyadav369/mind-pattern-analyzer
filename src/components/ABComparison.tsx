import { useState } from "react";
import { motion } from "framer-motion";
import { GitCompare, Loader2, Download, ArrowRight } from "lucide-react";
import { analyzeText } from "@/lib/biasAnalyzer";
import { compareAnalyses, comparisonToMarkdown, type ComparisonSummary } from "@/lib/compareAnalyses";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";

const ABComparison = () => {
  const { isQuantum } = useTheme();
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<ComparisonSummary | null>(null);

  const run = async () => {
    if (!textA.trim() || !textB.trim()) {
      toast.error("Add text to both sides to compare.");
      return;
    }
    setLoading(true);
    setSummary(null);
    try {
      const [a, b] = await Promise.all([analyzeText(textA), analyzeText(textB)]);
      setSummary(compareAnalyses(a.biases, b.biases, "Version A", "Version B"));
    } catch {
      toast.error("Comparison failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const exportMd = () => {
    if (!summary) return;
    const url = URL.createObjectURL(
      new Blob([comparisonToMarkdown(summary, "Version A", "Version B")], { type: "text/markdown" })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "mindtrace-ab-comparison.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const box = "w-full h-40 rounded-xl bg-muted/20 border border-border/40 p-4 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-primary/50";

  return (
    <section id="compare" className="py-20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-5xl mx-auto"
      >
        <div className="flex items-center gap-3 mb-3">
          <GitCompare className="w-5 h-5 text-primary" />
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">A/B Bias Comparison</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-8 max-w-2xl">
          Paste an original draft and a revision — MindTrace analyses both and reports which version carries
          the lower bias load, label by label.
        </p>

        <div className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-2xl p-6`}>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 block">Version A · original</label>
              <textarea value={textA} onChange={(e) => setTextA(e.target.value)} placeholder="Paste the first passage…" className={box} />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 block">Version B · revision</label>
              <textarea value={textB} onChange={(e) => setTextB(e.target.value)} placeholder="Paste the revised passage…" className={box} />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={run}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-primary/15 text-primary border border-primary/40 text-sm font-medium hover:bg-primary/25 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? "Comparing…" : "Compare versions"}
            </button>
            {summary && (
              <button
                onClick={exportMd}
                className="px-3 py-2 rounded-xl border border-border/40 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Export .md
              </button>
            )}
          </div>

          {summary && (
            <div className="mt-6">
              <p className="text-sm font-display font-semibold text-foreground mb-4">{summary.headline}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Load A", value: summary.loadA },
                  { label: "Load B", value: summary.loadB },
                  { label: "Δ load", value: `${summary.loadDelta >= 0 ? "+" : ""}${summary.loadDelta}` },
                  { label: "Overlap", value: `${Math.round(summary.overlap * 100)}%` },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-muted/20 border border-border/30 p-3">
                    <div className="text-lg font-display font-bold text-foreground">{s.value}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/40">
                      <th className="text-left py-2">Bias</th>
                      <th className="text-right py-2">A</th>
                      <th className="text-right py-2">B</th>
                      <th className="text-right py-2">Δ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.rows.map((r) => (
                      <tr key={r.biasType} className="border-b border-border/20">
                        <td className="py-2 text-foreground">{r.biasType}</td>
                        <td className="py-2 text-right font-mono text-muted-foreground">{r.a ?? "—"}</td>
                        <td className="py-2 text-right font-mono text-muted-foreground">{r.b ?? "—"}</td>
                        <td
                          className={`py-2 text-right font-mono ${
                            r.delta < 0 ? "text-secondary" : r.delta > 0 ? "text-destructive" : "text-muted-foreground"
                          }`}
                        >
                          {r.delta >= 0 ? "+" : ""}
                          {r.delta}
                        </td>
                      </tr>
                    ))}
                    {summary.rows.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-muted-foreground">
                          No biases detected in either version.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
};

export default ABComparison;
