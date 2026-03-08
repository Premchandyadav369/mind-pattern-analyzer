import { motion } from "framer-motion";
import type { BiasResult } from "@/lib/biasAnalyzer";
import { useEffect, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const COLORS: Record<string, string> = {
  cyan: "#38BDF8",
  green: "#22C55E",
  red: "#EF4444",
  orange: "#F97316",
  purple: "#8B5CF6",
};

interface GraphNode {
  id: string;
  label: string;
  type: "event" | "inference" | "prediction" | "bias";
  x: number;
  y: number;
  color: string;
}

interface GraphEdge {
  from: string;
  to: string;
  label?: string;
  biasColor?: string;
}

function buildReasoningGraph(text: string, biases: BiasResult[]): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const sentences = text.match(/[^.!?]+[.!?]*/g)?.map((s) => s.trim()).filter(Boolean) || [text];
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  const connectors = ["so", "therefore", "because", "thus", "hence", "means", "must be", "will never", "always"];

  // Parse sentences into event → inference → prediction chain
  let yPos = 40;
  const xCenter = 250;

  sentences.forEach((sentence, si) => {
    const lower = sentence.toLowerCase();

    // Check if sentence contains causal connectors
    let parts: string[] = [sentence];
    for (const conn of connectors) {
      if (lower.includes(conn)) {
        const idx = lower.indexOf(conn);
        const before = sentence.slice(0, idx).trim();
        const after = sentence.slice(idx + conn.length).trim();
        if (before && after) {
          parts = [before, after];
          break;
        }
      }
    }

    // Find relevant bias
    const matchedBias = biases.find((b) =>
      b.triggers.some((t) => lower.includes(t.toLowerCase()))
    );
    const biasColor = matchedBias ? COLORS[matchedBias.color] : "#64748B";

    if (parts.length === 2) {
      // Causal chain: Event → Inference
      const eventId = `event-${si}`;
      const inferenceId = `inference-${si}`;

      nodes.push({
        id: eventId,
        label: parts[0].length > 40 ? parts[0].slice(0, 40) + "…" : parts[0],
        type: "event",
        x: xCenter - 80,
        y: yPos,
        color: "#94A3B8",
      });

      yPos += 70;

      nodes.push({
        id: inferenceId,
        label: parts[1].length > 40 ? parts[1].slice(0, 40) + "…" : parts[1],
        type: "inference",
        x: xCenter + 80,
        y: yPos,
        color: biasColor,
      });

      edges.push({
        from: eventId,
        to: inferenceId,
        label: matchedBias?.biasType || "inference",
        biasColor,
      });

      // Add bias node if detected
      if (matchedBias) {
        const biasId = `bias-${si}`;
        nodes.push({
          id: biasId,
          label: matchedBias.biasType,
          type: "bias",
          x: xCenter + 200,
          y: yPos - 20,
          color: biasColor,
        });
        edges.push({ from: inferenceId, to: biasId, biasColor });
      }

      yPos += 70;
    } else {
      // Single statement
      const nodeId = `statement-${si}`;
      nodes.push({
        id: nodeId,
        label: sentence.length > 50 ? sentence.slice(0, 50) + "…" : sentence,
        type: matchedBias ? "inference" : "event",
        x: xCenter,
        y: yPos,
        color: matchedBias ? biasColor : "#94A3B8",
      });

      // Connect to previous if exists
      if (nodes.length > 1) {
        const prevNode = nodes[nodes.length - 2];
        if (prevNode.id !== nodeId) {
          edges.push({ from: prevNode.id, to: nodeId, biasColor: "#475569" });
        }
      }

      yPos += 70;
    }
  });

  return { nodes, edges };
}

const ReasoningGraph = ({ biases, text }: { biases: BiasResult[]; text: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isQuantum } = useTheme();
  const { nodes, edges } = buildReasoningGraph(text, biases);

  const canvasHeight = Math.max(300, nodes.length * 60 + 80);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let tick = 0;
    let animId: number;

    const draw = () => {
      tick++;
      ctx.clearRect(0, 0, 500, canvasHeight);

      // Draw edges
      for (const edge of edges) {
        const fromNode = nodes.find((n) => n.id === edge.from);
        const toNode = nodes.find((n) => n.id === edge.to);
        if (!fromNode || !toNode) continue;

        const pulse = 0.4 + Math.sin(tick * 0.03) * 0.2;

        ctx.beginPath();
        // Curved bezier
        const midX = (fromNode.x + toNode.x) / 2;
        const midY = (fromNode.y + toNode.y) / 2;
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.quadraticCurveTo(midX + 20, midY, toNode.x, toNode.y);
        ctx.strokeStyle = (edge.biasColor || "#475569") + Math.floor(pulse * 255).toString(16).padStart(2, "0");
        ctx.lineWidth = 2;
        ctx.stroke();

        // Arrow head
        const angle = Math.atan2(toNode.y - midY, toNode.x - midX);
        const arrowLen = 8;
        ctx.beginPath();
        ctx.moveTo(toNode.x, toNode.y);
        ctx.lineTo(toNode.x - arrowLen * Math.cos(angle - 0.4), toNode.y - arrowLen * Math.sin(angle - 0.4));
        ctx.lineTo(toNode.x - arrowLen * Math.cos(angle + 0.4), toNode.y - arrowLen * Math.sin(angle + 0.4));
        ctx.fillStyle = edge.biasColor || "#475569";
        ctx.fill();

        // Edge label
        if (edge.label) {
          ctx.fillStyle = (edge.biasColor || "#94A3B8") + "CC";
          ctx.font = "9px JetBrains Mono, monospace";
          ctx.textAlign = "center";
          ctx.fillText(edge.label, midX + 20, midY - 6);
        }
      }

      // Draw nodes
      for (const node of nodes) {
        const isEvent = node.type === "event";
        const isBias = node.type === "bias";
        const size = isBias ? 6 : 8;

        // Glow
        if (!isEvent) {
          const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 25);
          gradient.addColorStop(0, node.color + "30");
          gradient.addColorStop(1, node.color + "00");
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 25, 0, Math.PI * 2);
          ctx.fill();
        }

        // Shape
        if (isBias) {
          // Diamond for bias
          ctx.save();
          ctx.translate(node.x, node.y);
          ctx.rotate(Math.PI / 4);
          ctx.fillStyle = node.color;
          ctx.fillRect(-size / 2, -size / 2, size, size);
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
          ctx.fillStyle = node.color;
          ctx.fill();

          if (!isEvent) {
            ctx.strokeStyle = node.color + "60";
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }

        // Label
        ctx.fillStyle = isEvent ? "#94A3B8" : "#E2E8F0";
        ctx.font = `${isBias ? "bold " : ""}10px Space Grotesk, sans-serif`;
        ctx.textAlign = node.x > 250 ? "left" : "right";
        const labelX = node.x > 250 ? node.x + 14 : node.x - 14;
        ctx.fillText(node.label, labelX, node.y + 4);
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [nodes, edges, canvasHeight]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-2xl p-6`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🧠</span>
        <h3 className="font-display font-semibold text-foreground">Thought Reasoning Graph</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Event → Inference → Prediction chain with bias detection at reasoning edges.
      </p>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-muted-foreground/50" />
          <span>Event/Fact</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span>Inference</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-destructive rotate-45 scale-75" />
          <span>Bias Detected</span>
        </div>
      </div>

      <div className="flex justify-center overflow-x-auto">
        <canvas ref={canvasRef} width={500} height={canvasHeight} className="max-w-full" />
      </div>
    </motion.div>
  );
};

export default ReasoningGraph;
