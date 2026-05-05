import { useMemo, useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Network } from "lucide-react";
import type { BiasResult } from "@/lib/biasAnalyzer";
import { useTheme } from "@/contexts/ThemeContext";

// Curated cognitive-science taxonomy: every bias belongs to a higher-order
// category. We render a 2-layer knowledge graph: detected biases linked to
// their parent categories, plus links between categories that share a bias.
const TAXONOMY: Record<string, string> = {
  "Overgeneralization": "Heuristic Distortion",
  "Hasty Generalization": "Heuristic Distortion",
  "Availability Heuristic": "Heuristic Distortion",
  "Anchoring Bias": "Heuristic Distortion",
  "Confirmation Bias": "Belief Preservation",
  "Appeal to Authority": "Belief Preservation",
  "Bandwagon Effect": "Social Influence",
  "Survivorship Bias": "Selection Effect",
  "Sunk Cost Fallacy": "Decision Trap",
  "Dunning-Kruger Effect": "Self-Assessment",
  "Black-and-White Thinking": "Dichotomous Framing",
  "False Dichotomy": "Dichotomous Framing",
  "Should Statements": "Rigid Schema",
  "Labeling": "Self/Other Schema",
  "Personalization": "Self/Other Schema",
  "Emotional Reasoning": "Affective Distortion",
  "Catastrophizing": "Affective Distortion",
  "Fortune Telling": "Predictive Distortion",
  "Mind Reading": "Predictive Distortion",
  "Ad Hominem": "Argument Fallacy",
};

const COLOR_FOR_CATEGORY: Record<string, string> = {
  "Heuristic Distortion": "#38BDF8",
  "Belief Preservation": "#22C55E",
  "Social Influence": "#8B5CF6",
  "Selection Effect": "#A855F7",
  "Decision Trap": "#F97316",
  "Self-Assessment": "#EAB308",
  "Dichotomous Framing": "#FB923C",
  "Rigid Schema": "#F59E0B",
  "Self/Other Schema": "#EC4899",
  "Affective Distortion": "#EF4444",
  "Predictive Distortion": "#F43F5E",
  "Argument Fallacy": "#DC2626",
};

interface Node {
  id: string;
  type: "bias" | "category";
  x: number;
  y: number;
  color: string;
  weight: number;
}

interface Edge {
  from: string;
  to: string;
}

const BiasKnowledgeGraph = ({ biases }: { biases: BiasResult[] }) => {
  const { isQuantum } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 720, h: 460 });
  const [hover, setHover] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      setSize({ w, h: Math.max(380, Math.min(520, w * 0.6)) });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const { nodes, edges } = useMemo(() => {
    if (biases.length === 0) return { nodes: [] as Node[], edges: [] as Edge[] };

    const categories = new Set<string>();
    biases.forEach((b) => categories.add(TAXONOMY[b.biasType] || "Other Cognitive Bias"));
    const catList = Array.from(categories);

    const cx = size.w / 2;
    const cy = size.h / 2;
    const catRadius = Math.min(size.w, size.h) * 0.22;
    const biasRadius = Math.min(size.w, size.h) * 0.42;

    const nodes: Node[] = [];

    // Place categories on inner ring
    catList.forEach((c, i) => {
      const angle = (i / catList.length) * Math.PI * 2 - Math.PI / 2;
      nodes.push({
        id: c,
        type: "category",
        x: cx + Math.cos(angle) * catRadius,
        y: cy + Math.sin(angle) * catRadius,
        color: COLOR_FOR_CATEGORY[c] || "#94A3B8",
        weight: biases.filter((b) => (TAXONOMY[b.biasType] || "Other") === c).length,
      });
    });

    // Place biases on outer ring, grouped near their category
    biases.forEach((b, i) => {
      const cat = TAXONOMY[b.biasType] || "Other Cognitive Bias";
      const catNode = nodes.find((n) => n.id === cat)!;
      const baseAngle = Math.atan2(catNode.y - cy, catNode.x - cx);
      const sameCatBiases = biases.filter((x) => (TAXONOMY[x.biasType] || "Other") === cat);
      const idxInCat = sameCatBiases.findIndex((x) => x.biasType === b.biasType);
      const spread = (sameCatBiases.length - 1) * 0.18;
      const angle = baseAngle - spread / 2 + idxInCat * 0.18;
      nodes.push({
        id: b.biasType,
        type: "bias",
        x: cx + Math.cos(angle) * biasRadius,
        y: cy + Math.sin(angle) * biasRadius,
        color: catNode.color,
        weight: b.confidence,
      });
    });

    const edges: Edge[] = biases.map((b) => ({
      from: TAXONOMY[b.biasType] || "Other Cognitive Bias",
      to: b.biasType,
    }));

    return { nodes, edges };
  }, [biases, size]);

  if (biases.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-2xl p-6`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-sm">Bias Knowledge Graph</h3>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Taxonomy · {new Set(biases.map((b) => TAXONOMY[b.biasType] || "Other")).size} categories
        </span>
      </div>

      <div ref={containerRef} className="w-full">
        <svg width={size.w} height={size.h} className="overflow-visible">
          {/* Edges */}
          {edges.map((e, i) => {
            const a = nodes.find((n) => n.id === e.from);
            const b = nodes.find((n) => n.id === e.to);
            if (!a || !b) return null;
            const isHot = hover === e.from || hover === e.to;
            return (
              <line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={b.color}
                strokeOpacity={isHot ? 0.9 : 0.35}
                strokeWidth={isHot ? 2 : 1}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((n) => {
            const r = n.type === "category" ? 18 + n.weight * 4 : 8 + n.weight * 12;
            const isHot = hover === n.id;
            return (
              <g
                key={n.id}
                onMouseEnter={() => setHover(n.id)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={r + 6}
                  fill={n.color}
                  opacity={isHot ? 0.25 : 0.08}
                />
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={r}
                  fill={n.type === "category" ? n.color : "hsl(var(--background))"}
                  stroke={n.color}
                  strokeWidth={n.type === "category" ? 0 : 2}
                />
                <text
                  x={n.x}
                  y={n.y + r + 14}
                  textAnchor="middle"
                  fontSize={n.type === "category" ? 11 : 10}
                  fontWeight={n.type === "category" ? 700 : 500}
                  fill="hsl(var(--foreground))"
                  className="select-none pointer-events-none"
                >
                  {n.id.length > 22 ? n.id.slice(0, 20) + "…" : n.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Inner ring: cognitive-science categories · Outer ring: detected biases (size = confidence)</span>
        <span className="font-mono">Hover to highlight</span>
      </div>
    </motion.div>
  );
};

export default BiasKnowledgeGraph;
