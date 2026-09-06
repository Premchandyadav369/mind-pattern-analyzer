import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Wand2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { generateCounterfactual } from "@/lib/counterfactual";

const SAMPLE = "I always mess things up and everyone obviously thinks I am a failure; this is a disaster.";

const CounterfactualRewriter = () => {
  const { isQuantum } = useTheme();
  const [text, setText] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => generateCounterfactual(text), [text]);

  const copy = async () => {
    await navigator.clipboard.writeText(result.rewritten);
    setCopied(true);
    toast.success("Counterfactual copied");
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <motion.div
      id="counterfactual"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-2xl p-6`}
    >
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-display font-bold text-lg text-foreground">Counterfactual Bias Rewriter</h3>
            <p className="text-xs text-muted-foreground">
              Minimal, rule-audited edits that remove biased framing while preserving the claim.
            </p>
          </div>
        </div>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} Copy rewrite
        </button>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="w-full text-sm rounded-xl bg-muted/10 border border-border/30 p-3 text-foreground focus:outline-none focus:border-primary/50 mb-4"
        placeholder="Paste text to rewrite…"
      />

      <div className="grid md:grid-cols-2 gap-3 mb-5">
        <div className="p-4 rounded-xl bg-muted/10 border border-border/20">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Original</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{result.original || "—"}</p>
        </div>
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
          <p className="text-[10px] uppercase tracking-wide text-primary mb-2">Counterfactual</p>
          <p className="text-sm text-foreground leading-relaxed">{result.rewritten || "—"}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mb-5">
        {[
          { label: "Edits applied", value: result.edits.length },
          { label: "Token edit distance", value: result.editDistance },
          { label: "Minimality", value: `${Math.round(result.minimality * 100)}%` },
        ].map((m) => (
          <div key={m.label} className="p-4 rounded-xl bg-muted/10 border border-border/20">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">{m.label}</p>
            <p className="text-xl font-display font-bold text-primary">{m.value}</p>
          </div>
        ))}
      </div>

      {result.edits.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border/30">
                <th className="py-2 pr-3 font-medium">Bias</th>
                <th className="py-2 pr-3 font-medium">Edit</th>
                <th className="py-2 pr-3 font-medium">×</th>
                <th className="py-2 font-medium">Rationale</th>
              </tr>
            </thead>
            <tbody>
              {result.edits.map((e) => (
                <tr key={e.id} className="border-b border-border/10 align-top">
                  <td className="py-2 pr-3 text-primary whitespace-nowrap">{e.biasType}</td>
                  <td className="py-2 pr-3 text-foreground whitespace-nowrap">
                    <span className="line-through text-muted-foreground">{e.from}</span> → {e.to.trim()}
                  </td>
                  <td className="py-2 pr-3 font-mono text-muted-foreground">{e.count}</td>
                  <td className="py-2 text-muted-foreground">{e.rationale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No biased framing matched the edit rules — text left unchanged.</p>
      )}
    </motion.div>
  );
};

export default CounterfactualRewriter;
