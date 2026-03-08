import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Users, Mic, Upload, Brain, Atom } from "lucide-react";
import { analyzeText, type AnalysisResult, type BiasResult } from "@/lib/biasAnalyzer";
import { useTheme } from "@/contexts/ThemeContext";

interface SpeakerResult {
  name: string;
  text: string;
  analysis: AnalysisResult | null;
  logicalScore: number;
  emotionalScore: number;
}

const EXAMPLE_DEBATE = `Speaker A: Climate change is the most pressing issue of our time. Every scientist agrees with this. If we don't act now, we're all doomed. There's no middle ground here.

Speaker B: I knew the climate alarmists would say that. My uncle runs a factory and business is great, so the economy is clearly fine. Successful companies never worried about emissions, so why should we? I feel like this is all overblown, so it must be.`;

const DebateAnalyzer = () => {
  const { isQuantum } = useTheme();
  const [debateText, setDebateText] = useState("");
  const [speakers, setSpeakers] = useState<SpeakerResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const parseSpeakers = (text: string): { name: string; text: string }[] => {
    const speakerRegex = /(?:^|\n)\s*(Speaker\s*[A-Z]|[A-Z][a-zA-Z]*)\s*:\s*/gi;
    const parts: { name: string; text: string }[] = [];
    let lastIdx = 0;
    let lastName = "";
    let match: RegExpExecArray | null;

    // Reset regex
    speakerRegex.lastIndex = 0;

    while ((match = speakerRegex.exec(text)) !== null) {
      if (lastName && lastIdx < match.index) {
        parts.push({ name: lastName, text: text.slice(lastIdx, match.index).trim() });
      }
      lastName = match[1].trim();
      lastIdx = match.index + match[0].length;
    }

    if (lastName && lastIdx < text.length) {
      parts.push({ name: lastName, text: text.slice(lastIdx).trim() });
    }

    // If no speakers found, split in half
    if (parts.length === 0) {
      const mid = Math.floor(text.length / 2);
      const splitIdx = text.indexOf(".", mid);
      parts.push(
        { name: "Speaker A", text: text.slice(0, splitIdx > 0 ? splitIdx + 1 : mid).trim() },
        { name: "Speaker B", text: text.slice(splitIdx > 0 ? splitIdx + 1 : mid).trim() }
      );
    }

    return parts;
  };

  const computeScores = (biases: BiasResult[]) => {
    const emotional = biases.filter((b) =>
      ["Emotional Reasoning", "Black-and-White Thinking"].includes(b.biasType)
    );
    const logical = biases.filter((b) =>
      ["Confirmation Bias", "Survivorship Bias", "Overgeneralization"].includes(b.biasType)
    );

    const emotionalScore = emotional.length > 0
      ? emotional.reduce((s, b) => s + b.confidence, 0) / emotional.length * 100
      : 0;
    const logicalScore = Math.max(0, 100 - (biases.reduce((s, b) => s + b.confidence, 0) / Math.max(biases.length, 1)) * 100);

    return { logicalScore: Math.round(logicalScore), emotionalScore: Math.round(emotionalScore) };
  };

  const handleAnalyze = async () => {
    if (!debateText.trim()) return;
    setIsAnalyzing(true);
    setSpeakers([]);

    try {
      const parsed = parseSpeakers(debateText);
      const results: SpeakerResult[] = [];

      for (const speaker of parsed) {
        const analysis = await analyzeText(speaker.text);
        const scores = computeScores(analysis.biases);
        results.push({
          name: speaker.name,
          text: speaker.text,
          analysis,
          ...scores,
        });
      }

      setSpeakers(results);
    } catch (err) {
      console.error("Debate analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section id="debate" className="py-28 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.01] to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-xs font-mono text-primary/70 uppercase tracking-widest mb-3 block">Advanced Mode</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            AI <span className={isQuantum ? "text-gradient-quantum" : "text-gradient-cyan"}>Debate Analyzer</span>
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Upload debate transcripts. Detect logical vs emotional arguments, cognitive biases per speaker.
          </p>
        </motion.div>

        {/* Input */}
        <div className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-2xl p-6 mb-6`}>
          <div className="flex items-center gap-2 mb-4">
            <Mic className="w-4 h-4 text-primary" />
            <span className="text-sm font-display font-semibold text-foreground">Debate Transcript</span>
            <span className="text-[10px] font-mono-code text-muted-foreground/50">Format: "Speaker A: text..."</span>
          </div>

          <textarea
            value={debateText}
            onChange={(e) => setDebateText(e.target.value)}
            placeholder={"Speaker A: Your argument here...\n\nSpeaker B: Counter argument here..."}
            rows={6}
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/30 resize-none outline-none font-sans text-sm leading-relaxed"
          />

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
            <button
              onClick={() => setDebateText(EXAMPLE_DEBATE)}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Load example debate
            </button>
            <button
              onClick={handleAnalyze}
              disabled={!debateText.trim() || isAnalyzing}
              className={`px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-display font-semibold hover:scale-105 transition-transform disabled:opacity-50 flex items-center gap-2 ${isQuantum ? "glow-quantum" : "glow-cyan"}`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing Speakers...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  Analyze Debate
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        <AnimatePresence>
          {speakers.length > 0 && !isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Comparison header */}
              <div className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-2xl p-6`}>
                <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Speaker Comparison
                </h3>
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${speakers.length}, 1fr)` }}>
                  {speakers.map((speaker, i) => (
                    <motion.div
                      key={speaker.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.15 }}
                      className="text-center p-4 rounded-xl bg-muted/20 border border-border/30"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-3">
                        <span className="font-display font-bold text-primary text-lg">
                          {speaker.name.replace(/Speaker\s?/i, "").charAt(0)}
                        </span>
                      </div>
                      <p className="font-display font-semibold text-foreground text-sm">{speaker.name}</p>
                      <div className="mt-3 space-y-2">
                        <div>
                          <div className="flex items-center justify-between text-[10px] mb-1">
                            <span className="text-secondary">Logical</span>
                            <span className="font-mono-code text-secondary font-bold">{speaker.logicalScore}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-secondary"
                              initial={{ width: 0 }}
                              animate={{ width: `${speaker.logicalScore}%` }}
                              transition={{ delay: 0.5 + i * 0.15 }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-[10px] mb-1">
                            <span className="text-destructive">Emotional</span>
                            <span className="font-mono-code text-destructive font-bold">{speaker.emotionalScore}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-destructive"
                              initial={{ width: 0 }}
                              animate={{ width: `${speaker.emotionalScore}%` }}
                              transition={{ delay: 0.6 + i * 0.15 }}
                            />
                          </div>
                        </div>
                        <div className="pt-2 border-t border-border/20">
                          <p className="text-[10px] text-muted-foreground">
                            {speaker.analysis?.biases.length || 0} bias{(speaker.analysis?.biases.length || 0) !== 1 ? "es" : ""} detected
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Individual speaker breakdowns */}
              {speakers.map((speaker, si) => (
                <motion.div
                  key={speaker.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: si * 0.2 }}
                  className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-2xl p-6`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                      <span className="font-display font-bold text-primary text-sm">
                        {speaker.name.replace(/Speaker\s?/i, "").charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-sm text-foreground">{speaker.name}</h4>
                      <p className="text-[10px] text-muted-foreground">{speaker.analysis?.biases.length || 0} biases detected</p>
                    </div>
                  </div>

                  {/* Quoted text */}
                  <div className="bg-muted/10 rounded-xl p-3 mb-4 border border-border/20">
                    <p className="text-xs text-muted-foreground italic leading-relaxed">"{speaker.text}"</p>
                  </div>

                  {/* Biases found */}
                  {speaker.analysis?.biases && speaker.analysis.biases.length > 0 && (
                    <div className="space-y-2">
                      {speaker.analysis.biases.map((bias, bi) => (
                        <div key={bi} className="flex items-center justify-between p-2 rounded-lg bg-muted/10 border border-border/20">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-xs font-medium text-foreground">{bias.biasType}</span>
                          </div>
                          <span className="text-xs font-mono-code text-primary font-bold">{(bias.confidence * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {speaker.analysis?.overallInsight && (
                    <p className="mt-3 text-xs text-muted-foreground/70 italic">{speaker.analysis.overallInsight}</p>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default DebateAnalyzer;
