import { motion } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import type { BiasResult } from "@/lib/biasAnalyzer";

const COLORS: Record<string, string> = {
  cyan: "#38BDF8",
  green: "#22C55E",
  red: "#EF4444",
  orange: "#F97316",
  purple: "#8B5CF6",
};

const BiasChart = ({ biases }: { biases: BiasResult[] }) => {
  const barData = biases.map((b) => ({
    name: b.biasType.length > 15 ? b.biasType.slice(0, 15) + "…" : b.biasType,
    confidence: parseFloat((b.confidence * 100).toFixed(1)),
    color: COLORS[b.color] || COLORS.cyan,
  }));

  const allBiasTypes = ["Overgeneralization", "Confirmation Bias", "Emotional Reasoning", "B&W Thinking", "Survivorship"];
  const radarData = allBiasTypes.map((name, i) => {
    const fullNames = ["Overgeneralization", "Confirmation Bias", "Emotional Reasoning", "Black-and-White Thinking", "Survivorship Bias"];
    const found = biases.find((b) => b.biasType === fullNames[i]);
    return { subject: name, value: found ? found.confidence * 100 : 5 };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card rounded-xl p-6"
    >
      <h3 className="font-display font-semibold text-foreground mb-6">Bias Distribution</h3>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 22%)" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={100} tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "8px", color: "#F1F5F9" }}
              />
              <Bar dataKey="confidence" radius={[0, 6, 6, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(217, 33%, 22%)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#94A3B8", fontSize: 10 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
              <Radar dataKey="value" stroke="#38BDF8" fill="#38BDF8" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export default BiasChart;
