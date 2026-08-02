// Human-in-the-loop feedback store (localStorage).
// Captures annotator judgements on model predictions so the system can report
// agreement rates, surface weak classes, and export a re-training corpus.

export type FeedbackVerdict = "correct" | "incorrect" | "partial";

export interface FeedbackRecord {
  id: string;
  biasType: string;
  verdict: FeedbackVerdict;
  confidence: number;
  correctedLabel?: string;
  note?: string;
  excerpt: string;
  createdAt: string;
}

const KEY = "mindtrace:feedback:v1";

function safeParse(raw: string | null): FeedbackRecord[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FeedbackRecord[]) : [];
  } catch {
    return [];
  }
}

export function loadFeedback(): FeedbackRecord[] {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(KEY));
}

export function saveFeedback(records: FeedbackRecord[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(records));
}

export function makeFeedbackId(biasType: string, excerpt: string): string {
  return `${biasType}::${excerpt.slice(0, 60).trim().toLowerCase()}`;
}

/** Adds or replaces the feedback for a given (bias, excerpt) pair. */
export function recordFeedback(
  input: Omit<FeedbackRecord, "id" | "createdAt"> & { createdAt?: string },
  existing: FeedbackRecord[] = loadFeedback()
): FeedbackRecord[] {
  const id = makeFeedbackId(input.biasType, input.excerpt);
  const record: FeedbackRecord = {
    ...input,
    id,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
  const next = [record, ...existing.filter((r) => r.id !== id)];
  saveFeedback(next);
  return next;
}

export function removeFeedback(id: string, existing: FeedbackRecord[] = loadFeedback()): FeedbackRecord[] {
  const next = existing.filter((r) => r.id !== id);
  saveFeedback(next);
  return next;
}

export function clearFeedback(): void {
  saveFeedback([]);
}

export interface ClassAgreement {
  biasType: string;
  total: number;
  correct: number;
  partial: number;
  incorrect: number;
  agreement: number;
}

export interface FeedbackStats {
  total: number;
  correct: number;
  partial: number;
  incorrect: number;
  /** correct + 0.5 * partial over total */
  agreement: number;
  /** Cohen's-kappa-style chance-corrected agreement against a 50% baseline. */
  kappa: number;
  perClass: ClassAgreement[];
  corrections: { from: string; to: string; count: number }[];
}

export function computeFeedbackStats(records: FeedbackRecord[]): FeedbackStats {
  const total = records.length;
  const count = (v: FeedbackVerdict) => records.filter((r) => r.verdict === v).length;
  const correct = count("correct");
  const partial = count("partial");
  const incorrect = count("incorrect");
  const agreement = total === 0 ? 0 : (correct + partial * 0.5) / total;
  const pe = 0.5;
  const kappa = total === 0 ? 0 : (agreement - pe) / (1 - pe);

  const byClass = new Map<string, ClassAgreement>();
  for (const r of records) {
    const entry =
      byClass.get(r.biasType) ??
      { biasType: r.biasType, total: 0, correct: 0, partial: 0, incorrect: 0, agreement: 0 };
    entry.total += 1;
    entry[r.verdict] += 1;
    entry.agreement = (entry.correct + entry.partial * 0.5) / entry.total;
    byClass.set(r.biasType, entry);
  }

  const corrMap = new Map<string, { from: string; to: string; count: number }>();
  for (const r of records) {
    if (!r.correctedLabel || r.correctedLabel === r.biasType) continue;
    const key = `${r.biasType}->${r.correctedLabel}`;
    const entry = corrMap.get(key) ?? { from: r.biasType, to: r.correctedLabel, count: 0 };
    entry.count += 1;
    corrMap.set(key, entry);
  }

  return {
    total,
    correct,
    partial,
    incorrect,
    agreement,
    kappa,
    perClass: [...byClass.values()].sort((a, b) => b.total - a.total),
    corrections: [...corrMap.values()].sort((a, b) => b.count - a.count),
  };
}

/** JSONL export suitable for supervised re-training. */
export function feedbackToJsonl(records: FeedbackRecord[]): string {
  return records
    .map((r) =>
      JSON.stringify({
        text: r.excerpt,
        predicted_label: r.biasType,
        gold_label: r.correctedLabel ?? (r.verdict === "correct" ? r.biasType : null),
        verdict: r.verdict,
        model_confidence: r.confidence,
        annotator_note: r.note ?? "",
        annotated_at: r.createdAt,
      })
    )
    .join("\n");
}

function csvCell(value: string | number): string {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function feedbackToCsv(records: FeedbackRecord[]): string {
  const head = ["excerpt", "predicted_label", "verdict", "corrected_label", "confidence", "note", "annotated_at"];
  const rows = records.map((r) =>
    [r.excerpt, r.biasType, r.verdict, r.correctedLabel ?? "", r.confidence, r.note ?? "", r.createdAt]
      .map(csvCell)
      .join(",")
  );
  return [head.join(","), ...rows].join("\n");
}
