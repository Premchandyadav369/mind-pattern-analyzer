import { describe, it, expect } from "vitest";
import { computeTextStats } from "@/lib/textStats";

describe("computeTextStats", () => {
  it("returns zeros for empty input", () => {
    const s = computeTextStats("");
    expect(s.words).toBe(0);
    expect(s.sentences).toBe(0);
    expect(s.chars).toBe(0);
    expect(s.lexDensity).toBe(0);
    expect(s.flesch).toBe(0);
  });

  it("counts words and sentences", () => {
    const s = computeTextStats("Hello world. This is a test! Is it?");
    expect(s.words).toBe(8);
    expect(s.sentences).toBe(3);
  });

  it("computes char counts including and excluding whitespace", () => {
    const s = computeTextStats("ab cd");
    expect(s.chars).toBe(5);
    expect(s.charsNoSpace).toBe(4);
  });

  it("clamps Flesch reading ease into [0, 100]", () => {
    const easy = computeTextStats("The cat sat on the mat. The dog ran.");
    const hard = computeTextStats(
      "Notwithstanding interdisciplinary epistemological controversies, phenomenological hermeneutics elucidates incommensurable paradigmatic transformations."
    );
    expect(easy.flesch).toBeGreaterThanOrEqual(0);
    expect(easy.flesch).toBeLessThanOrEqual(100);
    expect(hard.flesch).toBeGreaterThanOrEqual(0);
    expect(hard.flesch).toBeLessThanOrEqual(100);
    expect(easy.flesch).toBeGreaterThan(hard.flesch);
  });

  it("reading and speaking times have minimum of 1 minute", () => {
    const s = computeTextStats("one two three");
    expect(s.readingMin).toBeGreaterThanOrEqual(1);
    expect(s.speakingMin).toBeGreaterThanOrEqual(1);
  });

  it("scales reading time roughly with word count", () => {
    const long = "word ".repeat(600);
    const s = computeTextStats(long);
    expect(s.readingMin).toBe(3); // 600 / 200
  });

  it("lexical density: all unique = 100%, all duplicate = low", () => {
    const unique = computeTextStats("alpha beta gamma delta");
    expect(unique.lexDensity).toBe(100);

    const dup = computeTextStats("same same same same same same same same same same");
    expect(dup.lexDensity).toBe(10);
  });

  it("ignores leading and trailing whitespace for word counting", () => {
    expect(computeTextStats("   hello   world   ").words).toBe(2);
  });

  it("avgWord is a fixed-1 decimal string", () => {
    const s = computeTextStats("ab cd ef");
    expect(s.avgWord).toMatch(/^\d+\.\d$/);
  });
});
