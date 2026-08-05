import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, Download, TrendingDown, TrendingUp, Minus, RefreshCw } from "lucide-react";
import { buildCognitiveProfile, profileToMarkdown, type ProfileEntry } from "@/lib/cognitiveProfile";
import { useTheme } from "@/contexts/ThemeContext";

const STORAGE_KEY = "mindtrace-history";

function readHistory(): ProfileEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const trendIcon = {
  improving: TrendingDown,
  worsening: TrendingUp,
  stable: Minus,
};

const CognitiveProfile = () => {
  const { isQuantum } = useTheme();
  const [entries, setEntries] = useState<ProfileEntry[]>([]);
  const refresh = useCallback(() => setEntries(readHistory()), []);

  useEffect(() => {
    refresh();
    window.addEventListener("mindtrace:analysis", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("mindtrace:analysis", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  const profile = buildCognitiveProfile(entries);
  const TrendIcon = trendIcon[profile.trendLabel];

  const exportProfile = () => {
    const url = URL.createObjectURL(
      new Blob([profileToMarkdown(profile)], { type: "text/markdown" })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "mindtrace-cognitive-profile.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    { label: "Analyses", value: profile.totalAnalyses },
    { label: "Detections", value: profile.totalDetections },
    { label: "Avg / analysis", value: profile.avgBiasesPerAnalysis },
    { label: "Bias-free", value: `${Math.round(profile.cleanRate * 100)}%` },
  ];

  return (
    <section id="profile" className="py-20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-5xl mx-auto"
      >
        <div className="flex items-center gap-3 mb-3">
          <Brain className="w-5 h-5 text-primary" />
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Your Cognitive Profile
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-8 max-w-2xl">
          A longitudinal view built from your local analysis history — dominant patterns, severity mix,
          and whether your bias density is trending up or down over time.
        </p>

        <div className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-2xl p-6`}>
          {profile.totalAnalyses === 0 ? (
            <p className="text-sm text-muted-foreground">
              Run a few analyses in the detector and your profile will build here automatically.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-xl bg-muted/20 border border-border/30 p-4">
                    <div className="text-2xl font-display font-bold text-foreground">{s.value}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${
                    profile.trendLabel === "improving"
                      ? "bg-secondary/10 text-secondary border-secondary/30"
                      : profile.trendLabel === "worsening"
                        ? "bg-destructive/10 text-destructive border-destructive/30"
                        : "bg-muted/30 text-muted-foreground border-border/40"
                  }`}
                >
                  <TrendIcon className="w-3.5 h-3.5" /> Trend: {profile.trendLabel}
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  volatility {profile.volatility} · mean conf {(profile.avgConfidence * 100).toFixed(0)}%
                </span>
                <button
                  onClick={refresh}
                  className="ml-auto text-[11px] px-2.5 py-1.5 rounded-lg border border-border/40 text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
                <button
                  onClick={exportProfile}
                  className="text-[11px] px-2.5 py-1.5 rounded-lg border border-primary/40 text-primary hover:bg-primary/10 flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> Export .md
                </button>
              </div>

              <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Dominant patterns
              </h3>
              <div className="space-y-2 mb-6">
                {profile.dominant.slice(0, 6).map((d) => (
                  <div key={d.biasType} className="flex items-center gap-3">
                    <span className="text-xs text-foreground w-44 shrink-0 truncate">{d.biasType}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted/40 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${d.share * 100}%` }}
                        viewport={{ once: true }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground w-20 text-right">
                      {d.count} · {Math.round(d.share * 100)}%
                    </span>
                  </div>
                ))}
              </div>

              <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Recommendations
              </h3>
              <ul className="space-y-2">
                {profile.recommendations.map((r) => (
                  <li key={r} className="text-sm text-muted-foreground leading-relaxed flex gap-2">
                    <span className="text-primary">→</span>
                    {r}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </motion.div>
    </section>
  );
};

export default CognitiveProfile;
