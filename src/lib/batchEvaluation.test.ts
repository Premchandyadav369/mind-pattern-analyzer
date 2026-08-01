import { describe, expect, it } from "vitest";
import {
  parseDataset,
  splitCsvLine,
  summarize,
  buildBatchReport,
  buildBatchCsv,
  toEvaluatedRow,
  SAMPLE_DATASET,
  type EvaluatedRow,
} from "./batchEvaluation";
import type { AnalysisResult } from "./biasAnalyzer";

const row = (
  id: string,
  labels: string[],
  predicted: string[],
  error?: string,
): EvaluatedRow => ({
  id,
  text: `passage ${id}`,
  labels,
  predicted,
  confidences: Object.fromEntries(predicted.map((p) => [p, 0.8])),
  biasCount: predicted.length,
  topConfidence: predicted.length ? 0.8 : 0,
  error,
});

describe("splitCsvLine", () => {
  it("handles quoted fields containing commas and escaped quotes", () => {
    expect(splitCsvLine('a,"b, still b","say ""hi"""')).toEqual(["a", "b, still b", 'say "hi"']);
  });
});

describe("parseDataset", () => {
  it("parses CSV with text and label columns", () => {
    const rows = parseDataset(SAMPLE_DATASET, "sample.csv");
    expect(rows).toHaveLength(8);
    expect(rows[0].text).toContain("interview");
    expect(rows[0].labels).toEqual(["Catastrophizing"]);
  });

  it("splits multi-label cells on semicolons", () => {
    const rows = parseDataset('text,label\n"x is bad","Anchoring; Labeling"', "a.csv");
    expect(rows[0].labels).toEqual(["Anchoring", "Labeling"]);
  });

  it("parses a JSON array", () => {
    const rows = parseDataset('[{"id":"a","text":"hello","labels":["Mind Reading"]}]', "d.json");
    expect(rows).toEqual([{ id: "a", text: "hello", labels: ["Mind Reading"] }]);
  });

  it("parses JSON lines", () => {
    const rows = parseDataset('{"text":"one"}\n{"text":"two","label":"Anchoring"}', "d.jsonl");
    expect(rows.map((r) => r.text)).toEqual(["one", "two"]);
    expect(rows[1].labels).toEqual(["Anchoring"]);
  });

  it("falls back to one passage per line for plain text", () => {
    const rows = parseDataset("first line\nsecond line", "notes.txt");
    expect(rows).toHaveLength(2);
    expect(rows[1]).toEqual({ id: "2", text: "second line", labels: [] });
  });

  it("returns nothing for empty input", () => {
    expect(parseDataset("   ", "e.csv")).toEqual([]);
  });
});

describe("summarize", () => {
  it("computes counts and averages, ignoring failed rows", () => {
    const s = summarize([row("1", [], ["A", "B"]), row("2", [], ["A"]), row("3", [], [], "boom")]);
    expect(s.total).toBe(3);
    expect(s.evaluated).toBe(2);
    expect(s.failed).toBe(1);
    expect(s.avgBiasesPerRow).toBeCloseTo(1.5);
    expect(s.biasFrequency[0]).toMatchObject({ bias: "A", count: 2 });
  });

  it("scores a perfect prediction set at F1 = 1", () => {
    const s = summarize([row("1", ["Anchoring"], ["Anchoring"]), row("2", ["Labeling"], ["Labeling"])]);
    expect(s.macroF1).toBe(1);
    expect(s.microF1).toBe(1);
    expect(s.exactMatch).toBe(1);
  });

  it("counts true/false positives and negatives per label", () => {
    const s = summarize([
      row("1", ["Anchoring"], ["Anchoring"]),
      row("2", ["Anchoring"], ["Labeling"]),
    ]);
    const anchoring = s.perLabel.find((l) => l.label === "anchoring")!;
    expect(anchoring).toMatchObject({ tp: 1, fp: 0, fn: 1, support: 2 });
    expect(anchoring.precision).toBe(1);
    expect(anchoring.recall).toBe(0.5);
    expect(s.exactMatch).toBe(0.5);
  });

  it("matches labels case- and whitespace-insensitively", () => {
    const s = summarize([row("1", ["  anchoring "], ["Anchoring"])]);
    expect(s.macroF1).toBe(1);
  });

  it("reports null supervised metrics when no gold labels exist", () => {
    const s = summarize([row("1", [], ["A"])]);
    expect(s.macroF1).toBeNull();
    expect(s.exactMatch).toBeNull();
    expect(s.labelled).toBe(0);
  });
});

describe("toEvaluatedRow", () => {
  it("maps an analysis result onto the dataset row", () => {
    const result = {
      biases: [
        { biasType: "Anchoring", confidence: 0.9, explanation: "", triggers: [], color: "cyan" },
        { biasType: "Labeling", confidence: 0.4, explanation: "", triggers: [], color: "cyan" },
      ],
      overallText: "t",
      analyzedAt: new Date(),
    } as AnalysisResult;
    const r = toEvaluatedRow({ id: "1", text: "t", labels: [] }, result);
    expect(r.predicted).toEqual(["Anchoring", "Labeling"]);
    expect(r.topConfidence).toBe(0.9);
    expect(r.biasCount).toBe(2);
  });
});

describe("report exports", () => {
  const rows = [row("1", ["Anchoring"], ["Anchoring"]), row("2", [], [], "timeout")];
  const summary = summarize(rows);

  it("markdown report includes summary, metrics and per-passage sections", () => {
    const md = buildBatchReport(rows, summary, "corpus.csv");
    expect(md).toContain("# MindTrace AI — Batch Evaluation Report");
    expect(md).toContain("corpus.csv");
    expect(md).toContain("Supervised Evaluation");
    expect(md).toContain("Macro-F1");
    expect(md).toContain("Passage 1");
    expect(md).toContain("timeout");
  });

  it("markdown report explains missing gold labels", () => {
    const md = buildBatchReport([row("1", [], ["A"])], summarize([row("1", [], ["A"])]), "x.txt");
    expect(md).toContain("No gold labels supplied");
  });

  it("csv export has a header plus one row per passage and escapes quotes", () => {
    const csv = buildBatchCsv([...rows, row("3", [], ['he said "no"'])]);
    const lines = csv.split("\n");
    expect(lines[0]).toBe("id,text,gold_labels,predicted_labels,confidences,bias_count,error");
    expect(lines).toHaveLength(4);
    expect(csv).toContain('""no""');
  });
});
