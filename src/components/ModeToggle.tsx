import { Sparkles, FlaskConical } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAppMode } from "@/contexts/AppModeContext";

const ModeToggle = ({ compact = false }: { compact?: boolean }) => {
  const { mode, setMode } = useAppMode();

  const options = [
    { key: "user" as const, label: "Simple", icon: Sparkles, hint: "Guided, everyday view" },
    { key: "research" as const, label: "Research", icon: FlaskConical, hint: "Full metrics & evaluation" },
  ];

  const handleSelect = (key: "user" | "research") => {
    if (key === mode) return;
    setMode(key);
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.success(
      key === "research" ? "Research mode on" : "Simple mode on",
      {
        description:
          key === "research"
            ? "Architecture, benchmarks, calibration and batch evaluation are now visible."
            : "Streamlined view: quick start, detector and everyday tools.",
      }
    );
  };


  return (
    <div
      className={`relative flex items-center gap-1 rounded-lg border border-border/50 bg-muted/20 p-0.5 ${
        compact ? "w-full" : ""
      }`}
      role="group"
      aria-label="Application mode"
    >
      {options.map((opt) => {
        const active = mode === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => setMode(opt.key)}
            title={opt.hint}
            aria-pressed={active}
            className={`relative flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {active && (
              <motion.span
                layoutId="mode-pill"
                className="absolute inset-0 rounded-md bg-primary"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <opt.icon className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ModeToggle;
