import { motion } from "framer-motion";
import { useMemo } from "react";
import type { BiasResult } from "@/lib/biasAnalyzer";
import { Radar } from "lucide-react";

const CATEGORIES: Record<string, string[]> = {
  Cognitive: ["Overgeneralization", "Black-and-White Thinking", "Should Statements", "Mind Reading"],
  Emotional: ["Emotional Reasoning", "Catastrophizing"],
  Social: ["Bandwagon Effect", "Ad Hominem", "Mind Reading"],
  Statistical: ["Survivorship Bias", "Anchoring Bias", "Confirmation Bias"],
  Economic: ["Sunk Cost Fallacy", "Anchoring Bias"],
  Logical: ["Confirmation Bias", "Overgeneralization", "Black-and-White Thinking"],
};

interface Props {
  biases: BiasResult[];
}

const BiasRadarChart = ({ biases }: Props) => {
  const data = useMemo(() => {
    const cats = Object.keys(CATEGORIES);
    return cats.map((cat) => {
      const members = CATEGORIES[cat];
      const matched = biases.filter((b) => members.some((m) => b.biasType.toLowerCase().includes(m.toLowerCase()) || m.toLowerCase().includes(b.biasType.toLowerCase())));
      const score = matched.reduce((s, b) => s + b.confidence, 0) / Math.max(members.length, 1);
      return { cat, score: Math.min(score, 1) };
    });
  }, [biases]);

  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const r = 100;
  const n = data.length;

  const point = (i: number, value: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return {
      x: cx + Math.cos(angle) * r * value,
      y: cy + Math.sin(angle) * r * value,
    };
  };

  const polygonPoints = data.map((d, i) => {
    const p = point(i, d.score || 0.05);
    return `${p.x},${p.y}`;
  }).join(" ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Radar className="w-4 h-4 text-primary" />
        <h3 className="font-display font-semibold text-sm">Bias Category Radar</h3>
      </div>
      <div className="flex justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {[0.25, 0.5, 0.75, 1].map((scale, i) => (
            <polygon
              key={i}
              points={data.map((_, j) => {
                const p = point(j, scale);
                return `${p.x},${p.y}`;
              }).join(" ")}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="1"
              opacity={0.3}
            />
          ))}
          {data.map((_, i) => {
            const p = point(i, 1);
            return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="hsl(var(--border))" strokeWidth="1" opacity={0.3} />;
          })}
          <motion.polygon
            points={polygonPoints}
            fill="hsl(var(--primary))"
            fillOpacity={0.2}
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
          {data.map((d, i) => {
            const p = point(i, d.score || 0.05);
            return <circle key={i} cx={p.x} cy={p.y} r="4" fill="hsl(var(--primary))" />;
          })}
          {data.map((d, i) => {
            const labelP = point(i, 1.25);
            return (
              <text
                key={i}
                x={labelP.x}
                y={labelP.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[10px] font-mono fill-muted-foreground"
              >
                {d.cat}
              </text>
            );
          })}
        </svg>
      </div>
      <p className="text-[10px] text-muted-foreground text-center mt-2">
        Distribution of detected biases across cognitive categories
      </p>
    </motion.div>
  );
};

export default BiasRadarChart;
