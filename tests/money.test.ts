import { describe, expect, it } from "vitest";
import { formatCents, parseAmountToCents, splitEqually } from "../src/lib/money";

describe("parseAmountToCents", () => {
  it("parses whole dollars", () => {
    expect(parseAmountToCents("12")).toBe(1200);
  });

  it("parses one decimal place", () => {
    expect(parseAmountToCents("12.5")).toBe(1250);
  });

  it("parses two decimal places", () => {
    expect(parseAmountToCents("12.34")).toBe(1234);
  });

  it("ignores surrounding whitespace and commas", () => {
    expect(parseAmountToCents("  1,234.56 ")).toBe(123456);
  });

  it("parses zero", () => {
    expect(parseAmountToCents("0")).toBe(0);
    expect(parseAmountToCents("0.00")).toBe(0);
  });

  it("rejects empty input", () => {
    expect(parseAmountToCents("")).toBeNull();
    expect(parseAmountToCents("   ")).toBeNull();
  });

  it("rejects non-numeric input", () => {
    expect(parseAmountToCents("abc")).toBeNull();
    expect(parseAmountToCents("12.3.4")).toBeNull();
    expect(parseAmountToCents("-5")).toBeNull();
  });

  it("rejects more than two decimal places", () => {
    expect(parseAmountToCents("12.345")).toBeNull();
  });
});

describe("formatCents", () => {
  it("formats USD with dollar sign", () => {
    expect(formatCents(1234, "USD")).toBe("$12.34");
  });

  it("formats EUR with euro sign", () => {
    expect(formatCents(100, "EUR")).toBe("€1.00");
  });

  it("formats GBP with pound sign", () => {
    expect(formatCents(550, "GBP")).toBe("£5.50");
  });

  it("falls back to currency code for unknown currency", () => {
    expect(formatCents(1000, "JPY")).toBe("10.00 JPY");
  });

  it("formats negative values with a leading minus", () => {
    expect(formatCents(-1234, "USD")).toBe("-$12.34");
  });

  it("groups thousands with commas", () => {
    expect(formatCents(123456789, "USD")).toBe("$1,234,567.89");
  });

  it("formats zero", () => {
    expect(formatCents(0, "USD")).toBe("$0.00");
  });
});

describe("splitEqually", () => {
  it("splits evenly when divisible", () => {
    expect(splitEqually(1000, 4)).toEqual([250, 250, 250, 250]);
  });

  it("distributes remainder to the first sharers", () => {
    expect(splitEqually(1001, 3)).toEqual([334, 334, 333]);
  });

  it("sum always equals the original amount", () => {
    for (let amount = 0; amount < 200; amount++) {
      for (let n = 1; n < 10; n++) {
        const shares = splitEqually(amount, n);
        const sum = shares.reduce((a, b) => a + b, 0);
        expect(sum).toBe(amount);
      }
    }
  });

  it("returns empty for zero sharers", () => {
    expect(splitEqually(100, 0)).toEqual([]);
  });
});
