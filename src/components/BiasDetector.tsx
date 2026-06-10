import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertTriangle, CheckCircle2, Sparkles, History, RotateCcw, Brain, Atom, Languages, Download, Copy, Focus, Eye } from "lucide-react";
import { analyzeText, type AnalysisResult } from "@/lib/biasAnalyzer";
import { downloadReport, copyReport } from "@/lib/exportReport";
import { getLiveSuggestions } from "@/lib/liveSuggestions";
import LiveSuggestions from "./LiveSuggestions";
import BiasKnowledgeGraph from "./BiasKnowledgeGraph";
import BiasRadarChart from "./BiasRadarChart";
import StatsDashboard from "./StatsDashboard";
import AchievementBadges from "./AchievementBadges";
import KeyboardShortcuts from "./KeyboardShortcuts";
import ShareButton from "./ShareButton";
import VoiceInputButton from "./VoiceInputButton";
import ClarityScore from "./ClarityScore";
import { toast } from "sonner";
import BiasResultCard from "./BiasResultCard";
import BiasChart from "./BiasChart";
import AnalysisHistory from "./AnalysisHistory";
import QuantumSuperposition from "./QuantumSuperposition";
import BiasEntanglementGraph from "./BiasEntanglementGraph";
import QuantumCollapse from "./QuantumCollapse";
import BiasHeatmap from "./BiasHeatmap";
import BiasEvolutionTimeline from "./BiasEvolutionTimeline";
import ReasoningGraph from "./ReasoningGraph";
import AttentionHighlights from "./AttentionHighlights";
import LanguageSelector from "./LanguageSelector";
import SentimentAnalysis from "./SentimentAnalysis";
import NLPMetricsPanel from "./NLPMetrics";
import { useTheme } from "@/contexts/ThemeContext";

const EXAMPLE_TEXTS: Record<string, string[]> = {
  en: [
    "Everyone in that city is rude. I knew it all along because my friend had one bad experience there.",
    "I failed this exam so I am completely useless. My life is basically over and I'll never succeed at anything.",
    "I feel stupid, so I must be incompetent. Everyone probably thinks I'm a joke.",
    "Successful entrepreneurs dropped out of college, so education is useless. Everyone knows degrees don't matter anymore.",
    "I knew this plan would fail because my ideas are always ignored. They probably think I'm not smart enough.",
    "We've already invested $50,000 in this project. We can't stop now even though it's clearly not working.",
  ],
  hi: [
    "उस शहर में सब लोग बदतमीज़ हैं। मैंने हमेशा से यही सोचा था।",
    "मैं परीक्षा में फेल हो गया तो मैं पूरी तरह बेकार हूँ। मेरी ज़िन्दगी ख़त्म है।",
    "मुझे बेवकूफ़ लगता है, तो मैं नाकाबिल ज़रूर हूँ। सब मुझे मज़ाक समझते हैं।",
    "सफल उद्यमियों ने कॉलेज छोड़ दिया, इसलिए शिक्षा बेकार है।",
  ],
  bn: [
    "ওই শহরের সবাই অভদ্র। আমার বন্ধুর একটি খারাপ অভিজ্ঞতা হয়েছিল।",
    "আমি পরীক্ষায় ফেল করেছি তাই আমি সম্পূর্ণ অকেজো।",
    "আমার বোকা লাগছে, তাই আমি নিশ্চয়ই অযোগ্য।",
  ],
  ta: [
    "அந்த நகரத்தில் எல்லோரும் முரட்டுத்தனமானவர்கள். நான் எப்போதும் இதை நினைத்தேன்.",
    "நான் தேர்வில் தோல்வியடைந்தேன் எனவே நான் முற்றிலும் பயனற்றவன்.",
  ],
  te: [
    "ఆ నగరంలో అందరూ అమర్యాదగా ఉంటారు. నాకు ఎప్పుడూ ఇలా అనిపించింది.",
    "నేను పరీక్షలో ఫెయిల్ అయ్యాను కాబట్టి నేను పూర్తిగా పనికిరానివాడిని.",
  ],
  mr: [
    "त्या शहरातील सगळे लोक उद्धट आहेत. मला नेहमी असं वाटायचं.",
    "मी परीक्षेत नापास झालो म्हणजे मी पूर्णपणे निरुपयोगी आहे.",
  ],
};

const STORAGE_KEY = "mindtrace-history";

const BiasDetector = () => {
  const { isQuantum } = useTheme();
  const [text, setText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showCollapse, setShowCollapse] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const liveSuggestions = useMemo(() => getLiveSuggestions(text), [text]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 20)));
    }
  }, [history]);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setResult(null);
    setShowCollapse(false);

    try {
      const analysis = await analyzeText(text, selectedLanguage);
      setResult(analysis);
      if (isQuantum && analysis.biases.length > 1) {
        setShowCollapse(true);
      }
      setHistory((prev) => [analysis, ...prev].slice(0, 20));
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  const handleHistorySelect = (item: AnalysisResult) => {
    setText(item.overallText);
    setResult(item);
    setShowHistory(false);
    setShowCollapse(false);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
    setShowHistory(false);
  };

  const handleReset = () => {
    setText("");
    setResult(null);
    setShowCollapse(false);
    textareaRef.current?.focus();
  };

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <section id="detector" className="py-28 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-transparent pointer-events-none" />

      <div className="max-w-3xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-xs font-mono text-primary/70 uppercase tracking-widest mb-3 block">
            {isQuantum ? "Quantum Analysis Engine" : "Live NLP Demo"}
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            <span className={isQuantum ? "text-gradient-quantum" : "text-gradient-cyan"}>
              {isQuantum ? "Quantum" : "Analyze"}
            </span>{" "}
            {isQuantum ? "Bias Detection" : "Your Text"}
          </h2>
          <p className="text-muted-foreground text-base max-w-lg mx-auto">
            {isQuantum
              ? "Model cognitive biases as quantum superpositions. Observe wavefunction collapse in real-time."
              : "Paste any text to detect 20+ cognitive biases with AI-powered sentiment analysis and NLP metrics."}
          </p>
        </motion.div>

        <AnalysisHistory
          history={history}
          onSelect={handleHistorySelect}
          onClear={handleClearHistory}
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
        />

        {/* Input */}
        <div className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-2xl p-6 mb-6 hover:border-primary/20 transition-colors`}>
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              isQuantum={isQuantum}
            />
            <VoiceInputButton onTranscript={setText} language={selectedLanguage} />
          </div>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAnalyze();
            }}
            placeholder={isQuantum ? "Enter text for quantum cognitive analysis..." : "Enter text to analyze for cognitive biases..."}
            rows={5}
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/40 resize-none outline-none font-sans text-base leading-relaxed"
          />
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
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
                className={`px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-display font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2 ${isQuantum ? "glow-quantum" : "glow-cyan"}`}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isQuantum ? "Measuring..." : "Analyzing..."}
                  </>
                ) : (
                  <>
                    {isQuantum ? <Atom className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    {isQuantum ? "Measure State" : "Analyze"}
                  </>
                )}
              </button>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground/40 mt-2">Press ⌘+Enter to analyze · Powered by Transformer NLP</p>
        </div>

        {/* Live bias suggestions */}
        <LiveSuggestions suggestions={liveSuggestions} />

        {/* Example prompts */}
        <div className="flex flex-wrap gap-2 mb-10">
          <span className="text-xs text-muted-foreground mr-1 self-center">Try:</span>
          {(EXAMPLE_TEXTS[selectedLanguage] || EXAMPLE_TEXTS.en).slice(0, 4).map((ex, i) => (
            <button
              key={i}
              onClick={() => setText(ex)}
              className="text-xs px-3 py-1.5 rounded-full border border-border/50 hover:border-primary/50 text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all truncate max-w-[260px]"
            >
              {ex}
            </button>
          ))}
        </div>

        {/* Analyzing animation */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-2xl p-10 mb-6`}
            >
              <div className="flex flex-col items-center gap-5">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
                  <div className="absolute inset-2 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                  {isQuantum && (
                    <div className="absolute inset-4 rounded-full border-2 border-t-transparent border-r-secondary border-b-transparent border-l-transparent animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {isQuantum ? <Atom className="w-6 h-6 text-primary" /> : <Brain className="w-6 h-6 text-primary" />}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-display font-semibold text-foreground">
                    {isQuantum ? "Preparing Quantum Measurement..." : "Deep NLP Analysis Running..."}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isQuantum
                      ? "Modeling cognitive superposition states"
                      : "Bias detection · Sentiment analysis · NLP metrics · Reasoning extraction"}
                  </p>
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
                <div className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-2xl p-6`}>
                  <div className="flex items-center gap-3 mb-4">
                    {result.biases.length > 0 ? (
                      <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-accent" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/30 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-secondary" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-display font-semibold text-lg">
                        {result.biases.length > 0
                          ? isQuantum
                            ? `${result.biases.length} Quantum State${result.biases.length > 1 ? "s" : ""} Detected`
                            : `${result.biases.length} Cognitive Bias${result.biases.length > 1 ? "es" : ""} Detected`
                          : "No Clear Bias Detected"}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {isQuantum ? "Quantum measurement at " : "Analyzed at "}
                        {new Date(result.analyzedAt).toLocaleTimeString()}
                        {result.biases.length > 0 && (
                          <> · Avg confidence: {(result.biases.reduce((s, b) => s + b.confidence, 0) / result.biases.length * 100).toFixed(0)}%</>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          try {
                            await copyReport(result);
                            toast.success("Report copied to clipboard");
                          } catch {
                            toast.error("Copy failed");
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs border border-border/50 hover:border-primary/40 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                        title="Copy markdown report"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                      <button
                        onClick={() => {
                          downloadReport(result);
                          toast.success("Report downloaded");
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs bg-primary/10 border border-primary/40 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1.5"
                        title="Download markdown report"
                      >
                        <Download className="w-3 h-3" />
                        Export
                      </button>
                    </div>
                  </div>

                  <div className="bg-muted/20 rounded-xl p-4 font-mono text-sm leading-relaxed border border-border/30">
                    <HighlightedText text={result.overallText} triggers={result.biases.flatMap((b) => b.triggers)} />
                  </div>

                  {/* Translation info */}
                  {result.translatedText && (
                    <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Languages className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[10px] font-mono text-primary uppercase tracking-wider">Translated to English for analysis</span>
                      </div>
                      <p className="text-xs text-muted-foreground italic leading-relaxed">{result.translatedText}</p>
                    </div>
                  )}
                </div>

                {/* Cognitive Clarity Score */}
                <ClarityScore result={result} />

                {/* Bias Knowledge Graph */}
                {result.biases.length > 0 && <BiasKnowledgeGraph biases={result.biases} />}

                {/* NLP Metrics */}
                {result.nlpMetrics && (
                  <NLPMetricsPanel metrics={result.nlpMetrics} text={result.overallText} />
                )}

                {/* Sentiment Analysis */}
                {result.sentiment && (
                  <SentimentAnalysis sentiment={result.sentiment} />
                )}

                {/* Quantum visualizations */}
                {isQuantum && result.biases.length > 0 && (
                  <>
                    <QuantumSuperposition biases={result.biases} />
                    {showCollapse && <QuantumCollapse biases={result.biases} />}
                    {result.biases.length > 1 && <BiasEntanglementGraph biases={result.biases} />}
                    <BiasHeatmap biases={result.biases} text={result.overallText} />
                  </>
                )}

                {/* Attention Highlights */}
                {result.biases.length > 0 && (
                  <AttentionHighlights biases={result.biases} text={result.overallText} />
                )}

                {/* Reasoning Graph */}
                {result.biases.length > 0 && (
                  <ReasoningGraph biases={result.biases} text={result.overallText} />
                )}

                {/* Bias Evolution Timeline */}
                {result.biases.length > 0 && (
                  <BiasEvolutionTimeline biases={result.biases} text={result.overallText} />
                )}

                {/* Bias cards */}
                {result.biases.map((bias, i) => (
                  <BiasResultCard key={i} bias={bias} index={i} />
                ))}

                {/* Chart */}
                {result.biases.length > 0 && <BiasChart biases={result.biases} />}

                {/* Overall AI Insight */}
                {result.overallInsight && (
                  <div className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-2xl p-6 border-primary/20`}>
                    <div className="flex items-center gap-2 mb-3">
                      {isQuantum ? <Atom className="w-4 h-4 text-primary" /> : <Brain className="w-4 h-4 text-primary" />}
                      <p className="text-xs font-display font-semibold text-primary">
                        {isQuantum ? "Quantum Psychological Insight" : "AI Psychological Insight"}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{result.overallInsight}</p>
                  </div>
                )}

                {/* No bias message */}
                {result.biases.length === 0 && (
                  <div className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-2xl p-10 text-center`}>
                    <CheckCircle2 className="w-12 h-12 text-secondary mx-auto mb-4" />
                    <p className="font-display font-semibold text-lg mb-2">
                      {isQuantum ? "Quantum State: Neutral" : "Clear Reasoning Detected"}
                    </p>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      {result.overallInsight || "The analyzed text doesn't show clear signs of common cognitive biases."}
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
