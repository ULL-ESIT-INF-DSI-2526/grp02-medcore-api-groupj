import { describe, test, expect } from "vitest";
import { validateDates } from "../../../../src/utils/records/validate/validateDate";

describe("validateDates", () => {
  test("Should throw invalid admission date", () => {
    expect(() =>
      validateDates("abc", undefined, undefined),
    ).toThrow();
  });

  test("Should throw invalid admission format", () => {
    expect(() =>
      validateDates(123, undefined, undefined),
    ).toThrow();
  });

  test("Should throw invalid discharge date", () => {
    expect(() =>
      validateDates("2024-01-01", "abc", undefined),
    ).toThrow();
  });

  test("Should throw invalid discharge format", () => {
    expect(() =>
      validateDates("2024-01-01", 123, undefined),
    ).toThrow();
  });

  test("Should throw discharge without admission", () => {
    expect(() =>
      validateDates(undefined, "2024-01-01", undefined),
    ).toThrow();
  });

  test("Should throw open record with discharge", () => {
    expect(() =>
      validateDates("2024-01-01", "2024-01-02", "abierto"),
    ).toThrow();
  });

  test("Should throw equal dates", () => {
    expect(() =>
      validateDates("2024-01-01", "2024-01-01", "cerrado"),
    ).toThrow();
  });

  test("Should throw discharge before admission", () => {
    expect(() =>
      validateDates("2024-01-02", "2024-01-01", "cerrado"),
    ).toThrow();
  });

  test("Should throw closed record without discharge", () => {
    expect(() =>
      validateDates("2024-01-01", undefined, "cerrado"),
    ).toThrow();
  });

  test("Should throw future discharge", () => {
    expect(() =>
      validateDates(
        "2024-01-01",
        "2999-01-01",
        "cerrado",
      ),
    ).toThrow();
  });

  test("Should validate correct dates", () => {
    expect(() =>
      validateDates(
        "2024-01-01",
        "2024-01-02",
        "cerrado",
      ),
    ).not.toThrow();
  });
});