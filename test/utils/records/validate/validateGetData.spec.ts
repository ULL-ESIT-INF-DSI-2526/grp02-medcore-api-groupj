import { describe, test, expect } from "vitest";
import { validateGetData } from "../../../../src/utils/records/validate/validateGetData";

describe("validateGetData", () => {
  test("Should throw when no filters provided", () => {
    expect(() =>
      validateGetData(undefined, undefined, undefined, undefined),
    ).toThrow();
  });

  test("Should throw when combining idDocument and dates", () => {
    expect(() =>
      validateGetData(
        "12345678Z",
        "2024-01-01",
        "2024-01-02",
        undefined,
      ),
    ).toThrow();
  });

  test("Should throw when idDocument invalid type", () => {
    expect(() =>
      validateGetData(123, undefined, undefined, undefined),
    ).toThrow();
  });

  test("Should throw when idDocument empty", () => {
    expect(() =>
      validateGetData("   ", undefined, undefined, undefined),
    ).toThrow();
  });

  test("Should throw when date range incomplete", () => {
    expect(() =>
      validateGetData(undefined, "2024-01-01", undefined, undefined),
    ).toThrow();
  });

  test("Should throw when dates invalid type", () => {
    expect(() =>
      validateGetData(undefined, 123, 456, undefined),
    ).toThrow();
  });

  test("Should throw when dates invalid", () => {
    expect(() =>
      validateGetData(undefined, "abc", "def", undefined),
    ).toThrow();
  });

  test("Should throw when dates equal", () => {
    expect(() =>
      validateGetData(
        undefined,
        "2024-01-01",
        "2024-01-01",
        undefined,
      ),
    ).toThrow();
  });

  test("Should throw when startDate after endDate", () => {
    expect(() =>
      validateGetData(
        undefined,
        "2025-01-01",
        "2024-01-01",
        undefined,
      ),
    ).toThrow();
  });

  test("Should throw when recordType invalid type", () => {
    expect(() =>
      validateGetData(
        undefined,
        "2024-01-01",
        "2024-01-02",
        123,
      ),
    ).toThrow();
  });

  test("Should throw when recordType empty", () => {
    expect(() =>
      validateGetData(
        undefined,
        "2024-01-01",
        "2024-01-02",
        "   ",
      ),
    ).toThrow();
  });

  test("Should throw when recordType invalid", () => {
    expect(() =>
      validateGetData(
        undefined,
        "2024-01-01",
        "2024-01-02",
        "random",
      ),
    ).toThrow();
  });

  test("Should validate correct data", () => {
    expect(() =>
      validateGetData(
        undefined,
        "2024-01-01",
        "2024-01-02",
        "consulta_ambulatoria",
      ),
    ).not.toThrow();
  });
});