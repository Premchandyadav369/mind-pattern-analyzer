import { motion } from "framer-motion";
import { useMemo } from "react";
import { BarChart3, TrendingUp, Brain, Target } from "lucide-react";
import type { AnalysisResult } from "@/lib/biasAnalyzer";

interface Props {
  history: AnalysisResult[];
}

const StatsDashboard = ({ history }: Props) => {
  const stats = useMemo(() => {
    if (history.length === 0) return null;
    const all = history.flatMap((h) => h.biases);
    const counts: Record<string, number> = {};
    all.forEach((b) => { counts[b.biasType] = (counts[b.biasType] || 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const avgConfidence = all.length ? all.reduce((s, b) => s + b.confidence, 0) / all.length : 0;
    const avgBiasesPerText = all.length / history.length;
    const trend = history.slice(0, 10).reverse().map((h) => h.biases.length);
    const maxTrend = Math.max(...trend, 1);

    return { top, avgConfidence, avgBiasesPerText, trend, maxTrend, total: history.length };
  }, [history]);

  if (!stats) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card rounded-2xl p-6 mb-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <BarChart3 className="w-4 h-4 text-primary" />
        <h3 className="font-display font-semibold text-sm">Your Cognitive Insights</h3>
        <span className="text-[10px] font-mono text-muted-foreground ml-auto">{stats.total} analyses</span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-muted/20 rounded-xl p-3 border border-border/30">
          <Brain className="w-3.5 h-3.5 text-primary mb-1" />
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Biases</p>
          <p className="text-xl font-display font-bold text-primary">{stats.avgBiasesPerText.toFixed(1)}</p>
        </div>
        <div className="bg-muted/20 rounded-xl p-3 border border-border/30">
          <Target className="w-3.5 h-3.5 text-accent mb-1" />
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Confidence</p>
          <p className="text-xl font-display font-bold text-accent">{(stats.avgConfidence * 100).toFixed(0)}%</p>
        </div>
        <div className="bg-muted/20 rounded-xl p-3 border border-border/30">
          <TrendingUp className="w-3.5 h-3.5 text-secondary mb-1" />
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Found</p>
          <p className="text-xl font-display font-bold text-secondary">{stats.top.reduce((s, [, c]) => s + c, 0)}</p>
        </div>
      </div>

      {/* Trend sparkline */}
      <div className="mb-5">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Bias Count Trend (last 10)</p>
        <div className="flex items-end gap-1 h-12">
          {stats.trend.map((v, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${(v / stats.maxTrend) * 100}%` }}
              transition={{ delay: i * 0.05 }}
              className="flex-1 bg-gradient-to-t from-primary/40 to-primary rounded-t min-h-[2px]"
              title={`${v} biases`}
            />
          ))}
        </div>
      </div>

      {/* Top biases */}
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Your Most Common Biases</p>
        <div className="space-y-1.5">
          {stats.top.map(([name, count], i) => {
            const max = stats.top[0][1];
            return (
              <div key={name} className="flex items-center gap-2">
                <span className="text-xs text-foreground flex-1 truncate">{name}</span>
                <div className="w-24 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / max) * 100}%` }}
                    transition={{ delay: i * 0.1 }}
                    className="h-full bg-gradient-to-r from-primary to-accent"
                  />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground w-6 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default StatsDashboard;
