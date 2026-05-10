import { describe, test, expect } from "vitest";
import mongoose from "mongoose";
import { validatePatchDates } from "../../../../src/utils/records/validate/validatePatchDates";

const record: any = {
  patient: new mongoose.Types.ObjectId(),
  responsibleStaff: new mongoose.Types.ObjectId(),
  admissionDateTime: new Date("2024-01-01"),
  dischargeDateTime: undefined,
  recordStatus: "abierto",
};

describe("validatePatchDates", () => {
  test("Should throw invalid admission format", () => {
    expect(() =>
      validatePatchDates(record, 123, undefined, undefined),
    ).toThrow();
  });

  test("Should throw invalid admission date", () => {
    expect(() =>
      validatePatchDates(record, "abc", undefined, undefined),
    ).toThrow();
  });

  test("Should throw invalid discharge format", () => {
    expect(() =>
      validatePatchDates(record, undefined, 123, undefined),
    ).toThrow();
  });

  test("Should throw invalid discharge date", () => {
    expect(() =>
      validatePatchDates(record, undefined, "abc", undefined),
    ).toThrow();
  });

  test("Should throw invalid recordStatus", () => {
    expect(() =>
      validatePatchDates(record, undefined, undefined, "random"),
    ).toThrow();
  });

  test("Should throw open record with discharge", () => {
    expect(() =>
      validatePatchDates(
        record,
        undefined,
        "2024-01-02",
        undefined,
      ),
    ).toThrow();
  });

  test("Should throw future discharge", () => {
    expect(() =>
      validatePatchDates(
        record,
        undefined,
        "2999-01-01",
        "cerrado",
      ),
    ).toThrow();
  });

  test("Should throw equal dates", () => {
    expect(() =>
      validatePatchDates(
        record,
        "2024-01-01",
        "2024-01-01",
        "cerrado",
      ),
    ).toThrow();
  });

  test("Should throw discharge before admission", () => {
    expect(() =>
      validatePatchDates(
        record,
        "2024-01-02",
        "2024-01-01",
        "cerrado",
      ),
    ).toThrow();
  });

  test("Should validate correctly", () => {
    expect(() =>
      validatePatchDates(
        record,
        "2024-01-01",
        "2024-01-02",
        "cerrado",
      ),
    ).not.toThrow();
  });
});