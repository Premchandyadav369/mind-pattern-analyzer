import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Calendar, Flame, Bookmark, Eye, BookmarkCheck } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import {
  INSIGHTS,
  epochDay,
  insightForDay,
  loadState,
  recordVisit,
  saveState,
  toggleBookmark,
  type InsightState,
} from "@/lib/dailyInsight";

const DailyInsight = () => {
  const { isQuantum } = useTheme();
  const [state, setState] = useState<InsightState | null>(null);

  useEffect(() => {
    const today = epochDay();
    const initial = recordVisit(loadState(), today);
    setState(initial);
    saveState(initial);
  }, []);

  const today = epochDay();
  const insight = insightForDay(today);
  const bookmarked = state?.bookmarks.includes(insight.title) ?? false;

  const handleBookmark = () => {
    if (!state) return;
    const next = toggleBookmark(state, insight.title);
    setState(next);
    saveState(next);
  };

  return (
    <section className="py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <span className="text-xs font-mono text-primary/70 uppercase tracking-widest mb-3 block flex items-center justify-center gap-2">
            <Calendar className="w-3 h-3" /> Daily Insight
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            <span className={isQuantum ? "text-gradient-quantum" : "text-gradient-cyan"}>One Idea</span> Per Day
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-3xl p-8 md:p-10 relative overflow-hidden`}
        >
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="flex items-start justify-between gap-4 mb-4">
            <Lightbulb className="w-8 h-8 text-primary" />
            <button
              onClick={handleBookmark}
              aria-label={bookmarked ? "Remove bookmark" : "Bookmark this insight"}
              className="text-xs font-mono px-3 py-1.5 rounded-lg border border-border/50 hover:border-primary/40 text-muted-foreground hover:text-primary flex items-center gap-1.5 transition"
            >
              {bookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              {bookmarked ? "Saved" : "Save"}
            </button>
          </div>
          <h3 className="font-display text-2xl md:text-3xl font-bold mb-4">{insight.title}</h3>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6">{insight.body}</p>
          <p className="text-xs font-mono text-primary/70 border-t border-border/40 pt-4">
            Source: {insight.source}
          </p>
        </motion.div>

        {state && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-3 mt-5"
          >
            <Stat icon={<Flame className="w-4 h-4" />} label="Day Streak" value={state.streak} />
            <Stat icon={<Eye className="w-4 h-4" />} label="Insights Read" value={`${state.seenTitles.length} / ${INSIGHTS.length}`} />
            <Stat icon={<Bookmark className="w-4 h-4" />} label="Bookmarked" value={state.bookmarks.length} />
          </motion.div>
        )}
      </div>
    </section>
  );
};

const Stat = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
  <div className="rounded-xl border border-border/50 bg-muted/20 p-3 text-center">
    <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-muted-foreground uppercase tracking-wide mb-1">
      {icon}
      {label}
    </div>
    <div className="font-display text-xl font-bold text-primary">{value}</div>
  </div>
);

export default DailyInsight;
