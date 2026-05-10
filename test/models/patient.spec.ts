import { describe, test, expect } from "vitest";
import { Patient } from "../../src/models/patient";

const validPaciente = {
  name: "Pedro Gonzalez",
  dateOfBirth: "2000-12-31",
  IdNumber: "12345678Z",
  socialSecurityNum: "12345678901",
  gender: "hombre",
  contact: {
    address: "Calle Falsa 123",
    phoneNumber: "+34612345678",
    email: "pedro@gmail.com",
  },
  allergies: [],
  bloodType: "O+",
  status: "activo",
};

describe("Patient Model", () => {
  test("Should fail with invalid IdNumber", async () => {
    const patient = new Patient({
      ...validPaciente,
      IdNumber: "abc",
    });
    await expect(patient.validate()).rejects.toThrow();
  });

  test("Should fail with invalid socialSecurityNum", async () => {
    const patient = new Patient({
      ...validPaciente,
      socialSecurityNum: "1234567890A",
    });
    await expect(patient.validate()).rejects.toThrow();
  });

  test("Should fail with invalid email", async () => {
    const patient = new Patient({
      ...validPaciente,
      contact: {
        ...validPaciente.contact,
        email: "invalidEmail",
      },
    });
    await expect(patient.validate()).rejects.toThrow();
  });

  test("Should fail with invalid phoneNumber", async () => {
    const patient = new Patient({
      ...validPaciente,
      contact: {
        ...validPaciente.contact,
        phoneNumber: "123",
      },
    });
    await expect(patient.validate()).rejects.toThrow();
  });
});