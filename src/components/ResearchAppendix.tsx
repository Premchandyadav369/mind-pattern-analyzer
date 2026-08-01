import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { Database, Users, ShieldAlert, FlaskConical } from "lucide-react";
import { DATASET_CARD, REPRODUCIBILITY, LIMITATIONS, ERROR_ANALYSIS } from "@/lib/researchData";

const ResearchAppendix = () => {
  const { isQuantum } = useTheme();
  const card = isQuantum ? "quantum-glass" : "glass-card";

  return (
    <div className="space-y-12">
      {/* Dataset card */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-lg text-foreground">Dataset Card</h3>
        </div>
        <div className={`${card} rounded-2xl p-5 grid md:grid-cols-2 gap-5`}>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Corpus
              </p>
              <p className="text-sm text-foreground font-semibold">{DATASET_CARD.name}</p>
              <p className="text-xs text-muted-foreground">{DATASET_CARD.size}</p>
            </div>
            <div className="flex gap-2">
              {Object.entries(DATASET_CARD.splits).map(([k, v]) => (
                <div
                  key={k}
                  className="flex-1 rounded-lg bg-muted/10 border border-border/20 p-2 text-center"
                >
                  <div className="text-sm font-mono text-primary">{v.toLocaleString()}</div>
                  <div className="text-[9px] uppercase tracking-widest text-muted-foreground">
                    {k}
                  </div>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                Sources
              </p>
              <ul className="space-y-1">
                {DATASET_CARD.sources.map((s) => (
                  <li key={s} className="text-[11px] text-muted-foreground leading-relaxed">
                    · {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                Annotation protocol
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {DATASET_CARD.annotation}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { l: "Cohen's κ", v: DATASET_CARD.agreement.kappa },
                { l: "Krippendorff α", v: DATASET_CARD.agreement.alpha },
                { l: "Span IoU", v: DATASET_CARD.agreement.spanIoU },
              ].map((a) => (
                <div
                  key={a.l}
                  className="rounded-lg bg-primary/5 border border-primary/20 p-2 text-center"
                >
                  <div className="text-sm font-mono text-primary">{a.v}</div>
                  <div className="text-[9px] text-muted-foreground">{a.l}</div>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-2 text-[11px] text-muted-foreground leading-relaxed">
              <Users className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary/60" />
              <span>{DATASET_CARD.pii}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Licence: <span className="text-foreground">{DATASET_CARD.licence}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Reproducibility */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FlaskConical className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-lg text-foreground">
            Reproducibility Checklist
          </h3>
        </div>
        <div className={`${card} rounded-2xl p-5 grid md:grid-cols-2 gap-x-6 gap-y-2`}>
          {REPRODUCIBILITY.map((r) => (
            <div
              key={r.key}
              className="flex items-baseline justify-between gap-3 py-1.5 border-b border-border/15 last:border-0"
            >
              <span className="text-[11px] font-mono uppercase tracking-wide text-muted-foreground shrink-0">
                {r.key}
              </span>
              <span className="text-[11px] text-foreground text-right">{r.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Error analysis */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-lg text-foreground">
            Error Analysis &amp; Limitations
          </h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className={`${card} rounded-2xl p-5 space-y-3`}>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Failure modes (share of errors)
            </p>
            {ERROR_ANALYSIS.map((e) => (
              <div key={e.cause}>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[11px] text-foreground">{e.cause}</span>
                  <span className="text-[10px] font-mono text-accent">
                    {(e.share * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${e.share * 100 * 3}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="h-full rounded-full bg-accent"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className={`${card} rounded-2xl p-5`}>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
              Stated limitations &amp; ethical scope
            </p>
            <ul className="space-y-2.5">
              {LIMITATIONS.map((l) => (
                <li key={l} className="flex gap-2 text-[11px] text-muted-foreground leading-relaxed">
                  <span className="text-destructive/70 mt-0.5">▸</span>
                  <span>{l}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchAppendix;
