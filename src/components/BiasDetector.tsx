import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { analyzeText, type AnalysisResult } from "@/lib/biasAnalyzer";
import BiasResultCard from "./BiasResultCard";
import BiasChart from "./BiasChart";

const EXAMPLE_TEXTS = [
  "Everyone in that city is rude.",
  "I failed this exam so I am completely useless.",
  "I feel stupid, so I must be incompetent.",
  "Successful entrepreneurs dropped out of college, so education is useless.",
  "I knew this plan would fail because my ideas are always ignored.",
];

const BiasDetector = () => {
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setResult(null);

    // Simulate processing delay for UX
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));

    const analysis = analyzeText(text);
    setResult(analysis);
    setIsAnalyzing(false);

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

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

        {/* Input */}
        <div className="glass-card rounded-xl p-6 mb-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to analyze for cognitive biases..."
            rows={5}
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/50 resize-none outline-none font-sans text-base leading-relaxed"
          />
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
            <div className="text-xs text-muted-foreground">
              {text.length} characters
            </div>
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

        {/* Example prompts */}
        <div className="flex flex-wrap gap-2 mb-10">
          <span className="text-xs text-muted-foreground mr-1 self-center">Try:</span>
          {EXAMPLE_TEXTS.map((ex, i) => (
            <button
              key={i}
              onClick={() => setText(ex)}
              className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary/50 text-muted-foreground hover:text-foreground transition-colors truncate max-w-[200px]"
            >
              {ex}
            </button>
          ))}
        </div>

        {/* Results */}
        <div ref={resultRef}>
          <AnimatePresence mode="wait">
            {result && (
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
                      <AlertTriangle className="w-5 h-5 text-accent" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-secondary" />
                    )}
                    <h3 className="font-display font-semibold text-lg">
                      {result.biases.length > 0
                        ? `${result.biases.length} Bias${result.biases.length > 1 ? "es" : ""} Detected`
                        : "No Clear Bias Detected"}
                    </h3>
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
