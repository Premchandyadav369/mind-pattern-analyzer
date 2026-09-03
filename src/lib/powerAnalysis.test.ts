import { describe, it, expect } from "vitest";
import {
  normalCdf,
  normalQuantile,
  sampleSizePerGroup,
  achievedPower,
  minDetectableEffect,
  wilsonInterval,
} from "./powerAnalysis";

describe("power analysis", () => {
  it("normal CDF is calibrated at known points", () => {
    expect(normalCdf(0)).toBeCloseTo(0.5, 4);
    expect(normalCdf(1.96)).toBeCloseTo(0.975, 3);
    expect(normalCdf(-1.96)).toBeCloseTo(0.025, 3);
  });

  it("normal quantile inverts the CDF", () => {
    expect(normalQuantile(0.975)).toBeCloseTo(1.96, 2);
    expect(normalQuantile(0.5)).toBeCloseTo(0, 6);
    expect(normalCdf(normalQuantile(0.8))).toBeCloseTo(0.8, 3);
  });

  it("returns infinite n when there is no effect", () => {
    expect(sampleSizePerGroup({ p1: 0.8, p2: 0.8, alpha: 0.05, power: 0.8, twoSided: true })).toBe(Infinity);
  });

  it("needs more samples for smaller effects", () => {
    const small = sampleSizePerGroup({ p1: 0.8, p2: 0.82, alpha: 0.05, power: 0.8, twoSided: true });
    const large = sampleSizePerGroup({ p1: 0.8, p2: 0.9, alpha: 0.05, power: 0.8, twoSided: true });
    expect(small).toBeGreaterThan(large);
  });

  it("needs more samples for higher power", () => {
    const p80 = sampleSizePerGroup({ p1: 0.7, p2: 0.78, alpha: 0.05, power: 0.8, twoSided: true });
    const p95 = sampleSizePerGroup({ p1: 0.7, p2: 0.78, alpha: 0.05, power: 0.95, twoSided: true });
    expect(p95).toBeGreaterThan(p80);
  });

  it("achieved power rises with sample size", () => {
    const cfg = { p1: 0.75, p2: 0.82, alpha: 0.05, twoSided: true };
    expect(achievedPower(cfg, 1000)).toBeGreaterThan(achievedPower(cfg, 100));
    expect(achievedPower(cfg, 100000)).toBeGreaterThan(0.99);
  });

  it("achieved power at the planned n is near the target", () => {
    const cfg = { p1: 0.75, p2: 0.85, alpha: 0.05, twoSided: true };
    const n = sampleSizePerGroup({ ...cfg, power: 0.8 });
    expect(achievedPower(cfg, n)).toBeGreaterThan(0.78);
    expect(achievedPower(cfg, n)).toBeLessThan(0.92);
  });

  it("MDE shrinks as n grows", () => {
    expect(minDetectableEffect(0.8, 2000, 0.05, 0.8)).toBeLessThan(minDetectableEffect(0.8, 200, 0.05, 0.8));
  });

  it("Wilson interval brackets the estimate and stays in [0,1]", () => {
    const [lo, hi] = wilsonInterval(0.82, 400);
    expect(lo).toBeLessThan(0.82);
    expect(hi).toBeGreaterThan(0.82);
    expect(lo).toBeGreaterThanOrEqual(0);
    expect(hi).toBeLessThanOrEqual(1);
  });

  it("Wilson interval never goes below zero at p=0", () => {
    const [lo, hi] = wilsonInterval(0, 30);
    expect(lo).toBe(0);
    expect(hi).toBeGreaterThan(0);
  });
});
