import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Loader2, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "@/hooks/use-toast";
import PDFExport from "./PDFExport";

interface BiasChange {
  original_phrase: string;
  corrected_phrase: string;
  bias_type: string;
  explanation: string;
}

interface CorrectionResult {
  original: string;
  corrected: string;
  changes: BiasChange[];
  summary: string;
  objectivity_score_before: number;
  objectivity_score_after: number;
}

const EXAMPLES = [
  "Nobody ever listens to my ideas. I'm completely worthless at work.",
  "Everyone knows that technology is ruining society. There's no doubt about it.",
  "I failed the exam, so I'll never be successful in life.",
  "All politicians are corrupt. You can't trust any of them.",
];

const ScoreBar = ({ label, score, color }: { label: string; score: number; color: string }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-semibold" style={{ color }}>{Math.round(score * 100)}%</span>
    </div>
    <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score * 100}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  </div>
);

const BiasCorrectionAssistant = () => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CorrectionResult | null>(null);
  const [expandedChange, setExpandedChange] = useState<number | null>(null);
  const { isQuantum } = useTheme();

  const handleCorrect = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("correct-bias", {
        body: { text: text.trim() },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      toast({
        title: "Correction Failed",
        description: err.message || "Could not process the text. Try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="correction" className="py-28 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-xs font-mono text-primary/70 uppercase tracking-widest mb-3 block">AI Correction</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Bias <span className={isQuantum ? "text-gradient-quantum" : "text-gradient-cyan"}>Correction</span> Assistant
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base">
            Paste biased text and get an AI-rewritten neutral version — with explanations for every change.
          </p>
        </motion.div>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl p-6 mb-6"
        >
          <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3 block">
            Enter biased text
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste text with potential cognitive biases..."
            className="w-full h-32 bg-muted/30 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 resize-none font-body"
          />

          <div className="flex flex-wrap gap-2 mt-3 mb-4">
            <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider self-center mr-1">Try:</span>
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => setText(ex)}
                className="text-[11px] px-3 py-1.5 rounded-full bg-muted/40 text-muted-foreground hover:bg-primary/10 hover:text-primary border border-border/30 hover:border-primary/30 transition-all truncate max-w-[220px]"
              >
                {ex}
              </button>
            ))}
          </div>

          <button
            onClick={handleCorrect}
            disabled={loading || !text.trim()}
            className={`w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              loading || !text.trim()
                ? "bg-muted/50 text-muted-foreground cursor-not-allowed"
                : `bg-primary text-primary-foreground hover:scale-[1.02] ${isQuantum ? "glow-quantum" : "glow-cyan"}`
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Correcting biases...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Correct & Neutralize
              </>
            )}
          </button>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-5"
            >
              {/* Side-by-side comparison */}
              <div className="grid md:grid-cols-2 gap-5">
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Original (Biased)</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">"{result.original}"</p>
                </div>

                <div className="glass-card rounded-2xl p-6 border-primary/30">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-4 h-4 text-secondary" />
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Corrected (Neutral)</h3>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">"{result.corrected}"</p>
                </div>
              </div>

              {/* Objectivity Scores */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">Objectivity Score</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <ScoreBar label="Before correction" score={result.objectivity_score_before} color="hsl(0, 84%, 60%)" />
                  <ScoreBar label="After correction" score={result.objectivity_score_after} color="hsl(142, 71%, 45%)" />
                </div>
              </div>

              {/* Changes breakdown */}
              {result.changes.length > 0 && (
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">
                    Changes Made ({result.changes.length})
                  </h3>
                  <div className="space-y-3">
                    {result.changes.map((change, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="border border-border/30 rounded-xl overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedChange(expandedChange === i ? null : i)}
                          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/20 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="text-xs line-through text-destructive/70 truncate">{change.original_phrase}</span>
                            <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                            <span className="text-xs text-secondary font-medium truncate">{change.corrected_phrase}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                              {change.bias_type}
                            </span>
                            {expandedChange === i ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                          </div>
                        </button>
                        <AnimatePresence>
                          {expandedChange === i && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <p className="px-4 pb-3 text-xs text-muted-foreground leading-relaxed border-t border-border/20 pt-3">
                                {change.explanation}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">Analysis Summary</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
              </div>

              {/* PDF Export */}
              <div className="flex justify-end">
                <PDFExport correctionResult={result} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default BiasCorrectionAssistant;