// test/utils/records/validate/validateMainData.spec.ts

import { describe, test, expect } from "vitest";
import {
  validateMainData,
  validateArray,
  validateString,
} from "../../../../src/utils/records/validate/validateMainData";

describe("validateMainData", () => {
  test("Should validate correctly", () => {
    expect(() =>
      validateMainData(
        "12345678Z",
        "123456789",
        [
          {
            nationalCode: "123456",
            units: 2,
            posology: "Cada 8 horas",
          },
        ],
      ),
    ).not.toThrow();
  });

  test("Should throw when idDocument missing", () => {
    expect(() =>
      validateMainData(
        undefined,
        "123456789",
        [],
      ),
    ).toThrow();
  });

  test("Should throw when medicalLicense invalid", () => {
    expect(() =>
      validateMainData(
        "12345678Z",
        123,
        [],
      ),
    ).toThrow();
  });

  test("Should throw when medicationList invalid", () => {
    expect(() =>
      validateMainData(
        "12345678Z",
        "123456789",
        "invalid",
      ),
    ).toThrow();
  });
});

describe("validateArray", () => {
  test("Should push error when medicationList missing", () => {
    const errors: string[] = [];
    validateArray(undefined, errors);
    expect(errors.length).toBeGreaterThan(0);
  });

  test("Should push error when medicationList is not array", () => {
    const errors: string[] = [];
    validateArray("invalid", errors);
    expect(errors.length).toBeGreaterThan(0);
  });

  test("Should push error when medicationList content invalid", () => {
    const errors: string[] = [];
    validateArray(
      [
        {
          nationalCode: "",
          units: 0,
          posology: "",
        },
      ],
      errors,
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  test("Should validate valid medicationList", () => {
    const errors: string[] = [];
    validateArray(
      [
        {
          nationalCode: "123456",
          units: 2,
          posology: "Cada 8 horas",
        },
      ],
      errors,
    );
    expect(errors).toHaveLength(0);
  });
});

describe("validateString", () => {
  test("Should push required error", () => {
    const errors: string[] = [];
    validateString(undefined, errors, true);
    expect(errors.length).toBeGreaterThan(0);
  });

  test("Should push invalid format error", () => {
    const errors: string[] = [];
    validateString(123, errors, false);
    expect(errors.length).toBeGreaterThan(0);
  });

  test("Should push empty string error", () => {
    const errors: string[] = [];
    validateString("   ", errors, true);
    expect(errors.length).toBeGreaterThan(0);
  });

  test("Should validate correct string", () => {
    const errors: string[] = [];
    validateString("12345678Z", errors, true);
    expect(errors).toHaveLength(0);
  });
});