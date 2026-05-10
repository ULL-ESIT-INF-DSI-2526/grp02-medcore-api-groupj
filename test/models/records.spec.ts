import { describe, test, expect } from "vitest";
import mongoose from "mongoose";
import { Record } from "../../src/models/records";

const validRecord = {
  patient: new mongoose.Types.ObjectId(),
  responsibleStaff: new mongoose.Types.ObjectId(),
  recordType: "consulta_ambulatoria",
  reason: "Dolor fuerte",
  diagnosis: "Gripe fuerte",
  prescribedMedications: [
    {
      medication: new mongoose.Types.ObjectId(),
      units: 2,
      posology: "Cada 8 horas",
    },
  ],
  amount: 20,
  recordStatus: "abierto",
};

describe("Record Model", () => {
  test("Should fail with empty prescribedMedications", async () => {
    const record = new Record({
      ...validRecord,
      prescribedMedications: [],
    });
    await expect(record.validate()).rejects.toThrow();
  });

  test("Should fail with decimal medication units", async () => {
    const record = new Record({
      ...validRecord,
      prescribedMedications: [
        {
          medication: new mongoose.Types.ObjectId(),
          units: 1.5,
          posology: "Cada 8 horas",
        },
      ],
    });
    await expect(record.validate()).rejects.toThrow();
  });

  test("Should fail with short reason", async () => {
    const record = new Record({
      ...validRecord,
      reason: "ab",
    });
    await expect(record.validate()).rejects.toThrow();
  });

  test("Should fail with invalid recordType", async () => {
    const record = new Record({
      ...validRecord,
      recordType: "random",
    });
    await expect(record.validate()).rejects.toThrow();
  });
});