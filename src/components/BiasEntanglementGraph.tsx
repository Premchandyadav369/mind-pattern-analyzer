import { motion } from "framer-motion";
import type { BiasResult } from "@/lib/biasAnalyzer";
import { useEffect, useRef, useState } from "react";

const COLORS: Record<string, string> = {
  cyan: "#38BDF8",
  green: "#22C55E",
  red: "#EF4444",
  orange: "#F97316",
  purple: "#8B5CF6",
};

interface EntanglementLink {
  from: string;
  to: string;
  strength: number;
}

function computeEntanglement(biases: BiasResult[]): EntanglementLink[] {
  const links: EntanglementLink[] = [];
  for (let i = 0; i < biases.length; i++) {
    for (let j = i + 1; j < biases.length; j++) {
      // Entanglement strength: based on overlapping triggers + confidence proximity
      const sharedTriggers = biases[i].triggers.filter((t) =>
        biases[j].triggers.some((t2) => t.toLowerCase().includes(t2.toLowerCase()) || t2.toLowerCase().includes(t.toLowerCase()))
      );
      const confProximity = 1 - Math.abs(biases[i].confidence - biases[j].confidence);
      const strength = Math.min((sharedTriggers.length * 0.3 + confProximity * 0.5 + 0.2), 1);
      links.push({ from: biases[i].biasType, to: biases[j].biasType, strength: parseFloat(strength.toFixed(2)) });
    }
  }
  return links.sort((a, b) => b.strength - a.strength);
}

const BiasEntanglementGraph = ({ biases }: { biases: BiasResult[] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [links] = useState(() => computeEntanglement(biases));

  // Simple force-directed positions
  const positions = biases.map((_, i) => {
    const angle = (i / biases.length) * Math.PI * 2 - Math.PI / 2;
    const radius = 120;
    return {
      x: 200 + Math.cos(angle) * radius,
      y: 160 + Math.sin(angle) * radius,
    };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    let tick = 0;

    const draw = () => {
      tick++;
      ctx.clearRect(0, 0, 400, 320);

      // Draw entanglement lines
      for (const link of links) {
        const fromIdx = biases.findIndex((b) => b.biasType === link.from);
        const toIdx = biases.findIndex((b) => b.biasType === link.to);
        if (fromIdx === -1 || toIdx === -1) continue;

        const from = positions[fromIdx];
        const to = positions[toIdx];

        // Pulsing line
        const pulse = 0.3 + Math.sin(tick * 0.03 + fromIdx) * 0.2;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);

        // Curved line for visual interest
        const midX = (from.x + to.x) / 2 + Math.sin(tick * 0.02) * 10;
        const midY = (from.y + to.y) / 2 + Math.cos(tick * 0.02) * 10;
        ctx.quadraticCurveTo(midX, midY, to.x, to.y);

        ctx.strokeStyle = `rgba(139, 92, 246, ${link.strength * pulse + 0.1})`;
        ctx.lineWidth = link.strength * 3 + 0.5;
        ctx.stroke();

        // Strength label
        ctx.fillStyle = `rgba(139, 92, 246, ${link.strength * 0.7 + 0.2})`;
        ctx.font = "10px JetBrains Mono, monospace";
        ctx.textAlign = "center";
        ctx.fillText(link.strength.toFixed(2), midX, midY - 8);
      }

      // Draw nodes
      biases.forEach((bias, i) => {
        const pos = positions[i];
        const color = COLORS[bias.color] || COLORS.cyan;
        const pulse = 1 + Math.sin(tick * 0.05 + i) * 0.15;

        // Glow
        const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 30 * pulse);
        gradient.addColorStop(0, color + "40");
        gradient.addColorStop(1, color + "00");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 30 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = color + "80";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.fillStyle = "#E2E8F0";
        ctx.font = "11px Space Grotesk, sans-serif";
        ctx.textAlign = "center";
        const shortName = bias.biasType.length > 14 ? bias.biasType.slice(0, 14) + "…" : bias.biasType;
        ctx.fillText(shortName, pos.x, pos.y + 24);
      });

      animFrame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrame);
  }, [biases, links, positions]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="quantum-glass rounded-2xl p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🔗</span>
        <h3 className="font-display font-semibold text-foreground">Bias Entanglement Graph</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Co-occurring biases that influence each other, modeled as quantum entanglement.
      </p>
      <div className="flex justify-center">
        <canvas ref={canvasRef} width={400} height={320} className="max-w-full" />
      </div>

      {/* Entanglement table */}
      {links.length > 0 && (
        <div className="mt-4 space-y-2">
          {links.slice(0, 5).map((link, i) => (
            <div key={i} className="flex items-center gap-2 text-xs font-mono-code">
              <span className="text-foreground">{link.from}</span>
              <span className="text-primary">──</span>
              <motion.div
                className="h-1.5 rounded-full bg-primary/60"
                initial={{ width: 0 }}
                animate={{ width: `${link.strength * 80}px` }}
                transition={{ delay: 0.5 + i * 0.1 }}
              />
              <span className="text-primary font-bold">{link.strength}</span>
              <span className="text-primary">──</span>
              <span className="text-foreground">{link.to}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default BiasEntanglementGraph;
