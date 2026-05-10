import { describe, test, expect } from "vitest";
import { Medication } from "../../src/models/medications";

const validMedication = {
  name: "Paracetamol",
  nombreActivo: "Paracetamol",
  codigoNacional: "123456",
  formaFarmaceutica: "capsula",
  dosis: "10mg",
  viaAdministracion: "oral",
  stockDisponible: 10,
  precio: 5,
  prescripcion: true,
  fechaCaducidad: new Date("2030-01-01"),
  contradicciones: [],
};

describe("Medication Model", () => {
  test("Should fail with invalid name", async () => {
    const medication = new Medication({
      ...validMedication,
      name: "Para123",
    });
    await expect(medication.validate()).rejects.toThrow();
  });

  test("Should fail with invalid codigoNacional", async () => {
    const medication = new Medication({
      ...validMedication,
      codigoNacional: "123",
    });
    await expect(medication.validate()).rejects.toThrow();
  });

  test("Should fail with invalid dosis", async () => {
    const medication = new Medication({
      ...validMedication,
      dosis: "abc",
    });
    await expect(medication.validate()).rejects.toThrow();
  });

  test("Should fail with decimal stockDisponible", async () => {
    const medication = new Medication({
      ...validMedication,
      stockDisponible: 10.5,
    });
    await expect(medication.validate()).rejects.toThrow();
  });

  test("Should fail with decimal precio", async () => {
    const medication = new Medication({
      ...validMedication,
      precio: 10.5,
    });
    await expect(medication.validate()).rejects.toThrow();
  });

  test("Should fail with invalid formaFarmaceutica", async () => {
    const medication = new Medication({
      ...validMedication,
      formaFarmaceutica: "random",
    });
    await expect(medication.validate()).rejects.toThrow();
  });
});