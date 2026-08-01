import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Check, Copy, Quote } from "lucide-react";
import { BIBTEX, APA_CITATION } from "@/lib/researchData";

const CitationExport = () => {
  const { isQuantum } = useTheme();
  const card = isQuantum ? "quantum-glass" : "glass-card";
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Quote className="w-5 h-5 text-primary" />
        <h3 className="font-display font-bold text-lg text-foreground">Cite This Work</h3>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { label: "BibTeX", text: BIBTEX, mono: true },
          { label: "APA 7", text: APA_CITATION, mono: false },
        ].map((c) => (
          <div key={c.label} className={`${card} rounded-2xl p-4 flex flex-col`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                {c.label}
              </span>
              <button
                onClick={() => copy(c.label, c.text)}
                className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
              >
                {copied === c.label ? (
                  <>
                    <Check className="w-3 h-3" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copy
                  </>
                )}
              </button>
            </div>
            <pre
              className={`flex-1 whitespace-pre-wrap break-words text-[10.5px] leading-relaxed text-muted-foreground rounded-lg bg-muted/10 border border-border/20 p-3 ${
                c.mono ? "font-mono" : "font-sans"
              }`}
            >
              {c.text}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CitationExport;
