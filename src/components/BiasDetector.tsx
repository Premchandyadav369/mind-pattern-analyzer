import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertTriangle, CheckCircle2, Sparkles, History, RotateCcw } from "lucide-react";
import { analyzeText, type AnalysisResult } from "@/lib/biasAnalyzer";
import BiasResultCard from "./BiasResultCard";
import BiasChart from "./BiasChart";
import AnalysisHistory from "./AnalysisHistory";

const EXAMPLE_TEXTS = [
  "Everyone in that city is rude.",
  "I failed this exam so I am completely useless.",
  "I feel stupid, so I must be incompetent.",
  "Successful entrepreneurs dropped out of college, so education is useless.",
  "I knew this plan would fail because my ideas are always ignored.",
];

const STORAGE_KEY = "mindtrace-history";

const BiasDetector = () => {
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load history
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
  }, []);

  // Save history
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 20)));
    }
  }, [history]);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setResult(null);

    // Simulate processing delay for UX
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));

    const analysis = analyzeText(text);
    setResult(analysis);
    setHistory((prev) => [analysis, ...prev].slice(0, 20));
    setIsAnalyzing(false);

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleHistorySelect = (item: AnalysisResult) => {
    setText(item.overallText);
    setResult(item);
    setShowHistory(false);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
    setShowHistory(false);
  };

  const handleReset = () => {
    setText("");
    setResult(null);
    textareaRef.current?.focus();
  };

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <section id="detector" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient-cyan">Analyze</span> Your Text
          </h2>
          <p className="text-muted-foreground">
            Paste any text to detect cognitive biases in the reasoning.
          </p>
        </motion.div>

        {/* History panel */}
        <AnalysisHistory
          history={history}
          onSelect={handleHistorySelect}
          onClear={handleClearHistory}
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
        />

        {/* Input */}
        <div className="glass-card rounded-xl p-6 mb-6">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAnalyze();
            }}
            placeholder="Enter text to analyze for cognitive biases..."
            rows={5}
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/50 resize-none outline-none font-sans text-base leading-relaxed"
          />
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground font-mono">
                {charCount} chars · {wordCount} words
              </span>
              {history.length > 0 && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  <History className="w-3 h-3" />
                  History ({history.length})
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {text && (
                <button
                  onClick={handleReset}
                  className="px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground border border-border/50 hover:border-border transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
              <button
                onClick={handleAnalyze}
                disabled={!text.trim() || isAnalyzing}
                className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-display font-semibold glow-cyan hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analyze
                  </>
                )}
              </button>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground/50 mt-2">Press ⌘+Enter to analyze</p>
        </div>

        {/* Example prompts */}
        <div className="flex flex-wrap gap-2 mb-10">
          <span className="text-xs text-muted-foreground mr-1 self-center">Try:</span>
          {EXAMPLE_TEXTS.map((ex, i) => (
            <button
              key={i}
              onClick={() => setText(ex)}
              className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary/50 text-muted-foreground hover:text-foreground transition-colors truncate max-w-[220px]"
            >
              {ex}
            </button>
          ))}
        </div>

        {/* Analyzing animation */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card rounded-xl p-8 mb-6"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
                  <div className="absolute inset-2 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-display font-semibold text-foreground">Processing Text</p>
                  <p className="text-xs text-muted-foreground mt-1">Running bias pattern analysis...</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <div ref={resultRef}>
          <AnimatePresence mode="wait">
            {result && !isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Summary */}
                <div className="glass-card rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    {result.biases.length > 0 ? (
                      <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-accent" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-secondary/10 border border-secondary/30 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-secondary" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-display font-semibold text-lg">
                        {result.biases.length > 0
                          ? `${result.biases.length} Bias${result.biases.length > 1 ? "es" : ""} Detected`
                          : "No Clear Bias Detected"}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Analyzed at {new Date(result.analyzedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {/* Highlighted text */}
                  <div className="bg-muted/30 rounded-lg p-4 font-mono text-sm leading-relaxed">
                    <HighlightedText text={result.overallText} triggers={result.biases.flatMap((b) => b.triggers)} />
                  </div>
                </div>

                {/* Bias cards */}
                {result.biases.map((bias, i) => (
                  <BiasResultCard key={i} bias={bias} index={i} />
                ))}

                {/* Chart */}
                {result.biases.length > 0 && <BiasChart biases={result.biases} />}

                {/* No bias message */}
                {result.biases.length === 0 && (
                  <div className="glass-card rounded-xl p-8 text-center">
                    <CheckCircle2 className="w-10 h-10 text-secondary mx-auto mb-4" />
                    <p className="font-display font-semibold mb-2">Clear Reasoning Detected</p>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      The analyzed text doesn't show clear signs of common cognitive biases. Try analyzing text with stronger claims or emotional language.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

function HighlightedText({ text, triggers }: { text: string; triggers: string[] }) {
  if (triggers.length === 0) return <span className="text-foreground">{text}</span>;

  const regex = new RegExp(`(${triggers.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        const isHighlight = triggers.some((t) => t.toLowerCase() === part.toLowerCase());
        return isHighlight ? (
          <span key={i} className="bg-primary/20 text-primary rounded px-1 font-semibold border-b-2 border-primary">
            {part}
          </span>
        ) : (
          <span key={i} className="text-foreground">{part}</span>
        );
      })}
    </>
  );
}

export default BiasDetector;
