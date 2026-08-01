import type { AnalysisResult } from "./biasAnalyzer";

export interface DatasetRow {
  id: string;
  text: string;
  /** Optional gold-standard bias labels for supervised evaluation. */
  labels: string[];
}

export interface EvaluatedRow extends DatasetRow {
  predicted: string[];
  confidences: Record<string, number>;
  biasCount: number;
  topConfidence: number;
  error?: string;
}

export interface LabelScore {
  label: string;
  tp: number;
  fp: number;
  fn: number;
  precision: number;
  recall: number;
  f1: number;
  support: number;
}

export interface BatchSummary {
  total: number;
  evaluated: number;
  failed: number;
  labelled: number;
  avgBiasesPerRow: number;
  avgTopConfidence: number;
  biasFrequency: { bias: string; count: number; share: number }[];
  perLabel: LabelScore[];
  macroF1: number | null;
  microF1: number | null;
  exactMatch: number | null;
}

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

/** Split a CSV line honouring double-quoted fields. */
export const splitCsvLine = (line: string): string[] => {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
      } else cur += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out.map((v) => v.trim());
};

const toLabels = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof v === "string")
    return v
      .split(/[;|]/)
      .map((s) => s.trim())
      .filter(Boolean);
  return [];
};

/**
 * Parse an uploaded dataset. Supports CSV (with a `text` column and optional
 * `label`/`labels` column), JSON arrays, JSON Lines, and plain text
 * (one passage per line).
 */
export const parseDataset = (raw: string, filename = ""): DatasetRow[] => {
  const content = raw.replace(/^\uFEFF/, "").trim();
  if (!content) return [];
  const ext = filename.split(".").pop()?.toLowerCase();

  const fromObject = (o: Record<string, unknown>, i: number): DatasetRow | null => {
    const text = String(o.text ?? o.passage ?? o.content ?? o.sentence ?? "").trim();
    if (!text) return null;
    return {
      id: String(o.id ?? i + 1),
      text,
      labels: toLabels(o.labels ?? o.label ?? o.bias ?? o.biases),
    };
  };

  // JSON array
  if (content.startsWith("[")) {
    try {
      const arr = JSON.parse(content) as Record<string, unknown>[];
      return arr.map(fromObject).filter((r): r is DatasetRow => !!r);
    } catch {
      /* fall through */
    }
  }

  // JSON Lines
  if (content.startsWith("{") || ext === "jsonl" || ext === "ndjson") {
    const rows = content
      .split(/\r?\n/)
      .filter((l) => l.trim())
      .map((l, i) => {
        try {
          return fromObject(JSON.parse(l), i);
        } catch {
          return null;
        }
      })
      .filter((r): r is DatasetRow => !!r);
    if (rows.length) return rows;
  }

  const lines = content.split(/\r?\n/).filter((l) => l.trim());

  // CSV with a recognisable header
  const header = splitCsvLine(lines[0]).map(norm);
  const textIdx = header.findIndex((h) => ["text", "passage", "content", "sentence"].includes(h));
  if (textIdx !== -1) {
    const labelIdx = header.findIndex((h) => ["label", "labels", "bias", "biases"].includes(h));
    const idIdx = header.findIndex((h) => h === "id");
    return lines
      .slice(1)
      .map((line, i) => {
        const cells = splitCsvLine(line);
        const text = (cells[textIdx] ?? "").trim();
        if (!text) return null;
        return {
          id: idIdx !== -1 && cells[idIdx] ? cells[idIdx] : String(i + 1),
          text,
          labels: labelIdx !== -1 ? toLabels(cells[labelIdx]) : [],
        };
      })
      .filter((r): r is DatasetRow => !!r);
  }

  // Plain text: one passage per line
  return lines.map((text, i) => ({ id: String(i + 1), text: text.trim(), labels: [] }));
};

export const toEvaluatedRow = (row: DatasetRow, result: AnalysisResult): EvaluatedRow => {
  const confidences: Record<string, number> = {};
  result.biases.forEach((b) => {
    confidences[b.biasType] = b.confidence;
  });
  return {
    ...row,
    predicted: result.biases.map((b) => b.biasType),
    confidences,
    biasCount: result.biases.length,
    topConfidence: result.biases.length ? Math.max(...result.biases.map((b) => b.confidence)) : 0,
  };
};

export const summarize = (rows: EvaluatedRow[]): BatchSummary => {
  const ok = rows.filter((r) => !r.error);
  const labelled = ok.filter((r) => r.labels.length > 0);

  const freq = new Map<string, number>();
  ok.forEach((r) => r.predicted.forEach((p) => freq.set(p, (freq.get(p) ?? 0) + 1)));
  const totalPreds = Array.from(freq.values()).reduce((a, b) => a + b, 0);

  const labelSet = new Set<string>();
  labelled.forEach((r) => {
    r.labels.forEach((l) => labelSet.add(norm(l)));
    r.predicted.forEach((p) => labelSet.add(norm(p)));
  });

  const perLabel: LabelScore[] = Array.from(labelSet)
    .map((label) => {
      let tp = 0;
      let fp = 0;
      let fn = 0;
      labelled.forEach((r) => {
        const gold = r.labels.map(norm).includes(label);
        const pred = r.predicted.map(norm).includes(label);
        if (gold && pred) tp++;
        else if (!gold && pred) fp++;
        else if (gold && !pred) fn++;
      });
      const precision = tp + fp ? tp / (tp + fp) : 0;
      const recall = tp + fn ? tp / (tp + fn) : 0;
      const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
      return { label, tp, fp, fn, precision, recall, f1, support: tp + fn };
    })
    .filter((s) => s.support > 0 || s.fp > 0)
    .sort((a, b) => b.support - a.support);

  const tpAll = perLabel.reduce((a, s) => a + s.tp, 0);
  const fpAll = perLabel.reduce((a, s) => a + s.fp, 0);
  const fnAll = perLabel.reduce((a, s) => a + s.fn, 0);
  const microP = tpAll + fpAll ? tpAll / (tpAll + fpAll) : 0;
  const microR = tpAll + fnAll ? tpAll / (tpAll + fnAll) : 0;

  const exact = labelled.length
    ? labelled.filter((r) => {
        const g = new Set(r.labels.map(norm));
        const p = new Set(r.predicted.map(norm));
        return g.size === p.size && Array.from(g).every((x) => p.has(x));
      }).length / labelled.length
    : null;

  return {
    total: rows.length,
    evaluated: ok.length,
    failed: rows.length - ok.length,
    labelled: labelled.length,
    avgBiasesPerRow: ok.length ? ok.reduce((a, r) => a + r.biasCount, 0) / ok.length : 0,
    avgTopConfidence: ok.length ? ok.reduce((a, r) => a + r.topConfidence, 0) / ok.length : 0,
    biasFrequency: Array.from(freq.entries())
      .map(([bias, count]) => ({ bias, count, share: totalPreds ? count / totalPreds : 0 }))
      .sort((a, b) => b.count - a.count),
    perLabel,
    macroF1: perLabel.length ? perLabel.reduce((a, s) => a + s.f1, 0) / perLabel.length : null,
    microF1: perLabel.length && microP + microR ? (2 * microP * microR) / (microP + microR) : null,
    exactMatch: exact,
  };
};

const pct = (n: number) => (n * 100).toFixed(1) + "%";

export const buildBatchReport = (
  rows: EvaluatedRow[],
  summary: BatchSummary,
  datasetName: string,
): string => {
  const L: string[] = [];
  L.push(`# MindTrace AI — Batch Evaluation Report`);
  L.push(`*Dataset: ${datasetName} · Generated: ${new Date().toLocaleString()}*\n`);

  L.push(`## 1. Run Summary\n`);
  L.push(`| Metric | Value |`);
  L.push(`| --- | --- |`);
  L.push(`| Passages submitted | ${summary.total} |`);
  L.push(`| Successfully evaluated | ${summary.evaluated} |`);
  L.push(`| Failed | ${summary.failed} |`);
  L.push(`| Gold-labelled passages | ${summary.labelled} |`);
  L.push(`| Mean biases per passage | ${summary.avgBiasesPerRow.toFixed(2)} |`);
  L.push(`| Mean top confidence | ${pct(summary.avgTopConfidence)} |`);
  L.push("");

  L.push(`## 2. Bias Frequency Distribution\n`);
  L.push(`| Bias | Detections | Share |`);
  L.push(`| --- | --- | --- |`);
  summary.biasFrequency.forEach((b) => L.push(`| ${b.bias} | ${b.count} | ${pct(b.share)} |`));
  L.push("");

  if (summary.perLabel.length) {
    L.push(`## 3. Supervised Evaluation (against gold labels)\n`);
    L.push(
      `Macro-F1: **${pct(summary.macroF1 ?? 0)}** · Micro-F1: **${pct(
        summary.microF1 ?? 0,
      )}** · Exact match: **${pct(summary.exactMatch ?? 0)}**\n`,
    );
    L.push(`| Label | Support | TP | FP | FN | Precision | Recall | F1 |`);
    L.push(`| --- | --- | --- | --- | --- | --- | --- | --- |`);
    summary.perLabel.forEach((s) =>
      L.push(
        `| ${s.label} | ${s.support} | ${s.tp} | ${s.fp} | ${s.fn} | ${pct(s.precision)} | ${pct(
          s.recall,
        )} | ${pct(s.f1)} |`,
      ),
    );
    L.push("");
  } else {
    L.push(`## 3. Supervised Evaluation\n`);
    L.push(
      `No gold labels supplied. Add a \`label\` column (semicolon-separated for multi-label) to compute precision, recall and F1.\n`,
    );
  }

  L.push(`## 4. Per-Passage Results\n`);
  rows.forEach((r) => {
    L.push(`### Passage ${r.id}`);
    L.push(`> ${r.text.replace(/\n/g, " ")}\n`);
    if (r.error) {
      L.push(`- **Status:** failed — ${r.error}\n`);
      return;
    }
    L.push(
      `- **Predicted:** ${
        r.predicted.length
          ? r.predicted.map((p) => `${p} (${pct(r.confidences[p] ?? 0)})`).join(", ")
          : "none"
      }`,
    );
    if (r.labels.length) L.push(`- **Gold:** ${r.labels.join(", ")}`);
    L.push("");
  });

  L.push(`---`);
  L.push(
    `*MindTrace AI · Quantum-Inspired Cognitive Bias Detection · Built by V C Premchand Yadav*`,
  );
  return L.join("\n");
};

const csvCell = (v: string) => `"${v.replace(/"/g, '""')}"`;

export const buildBatchCsv = (rows: EvaluatedRow[]): string => {
  const head = ["id", "text", "gold_labels", "predicted_labels", "confidences", "bias_count", "error"];
  const body = rows.map((r) =>
    [
      r.id,
      r.text,
      r.labels.join("; "),
      r.predicted.join("; "),
      Object.entries(r.confidences)
        .map(([k, v]) => `${k}=${v.toFixed(2)}`)
        .join("; "),
      String(r.biasCount),
      r.error ?? "",
    ]
      .map(csvCell)
      .join(","),
  );
  return [head.join(","), ...body].join("\n");
};

export const downloadFile = (filename: string, content: string, mime: string) => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const SAMPLE_DATASET = `text,label
"If I fail this interview my whole career is over.",Catastrophizing
"She didn't reply, so she clearly hates me.",Mind Reading
"I've already spent two years on this, I can't quit now.",Sunk Cost Fallacy
"Everyone always lets me down, every single time.",Overgeneralization
"Either I get a perfect score or I'm a total failure.",Black-and-White Thinking
"I only read sources that confirm what I already believe.",Confirmation Bias
"The first price I saw was 500, so 400 feels like a bargain.",Anchoring
"I feel worthless, therefore I must be worthless.",Emotional Reasoning`;
