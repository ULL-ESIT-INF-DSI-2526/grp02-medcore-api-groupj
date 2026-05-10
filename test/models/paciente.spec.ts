import { describe, test, expect } from "vitest";
import { Paciente } from "../../src/models/paciente";

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

describe("Paciente Model", () => {
  test("Should fail with invalid IdNumber", async () => {
    const paciente = new Paciente({
      ...validPaciente,
      IdNumber: "abc",
    });
    await expect(paciente.validate()).rejects.toThrow();
  });

  test("Should fail with invalid socialSecurityNum", async () => {
    const paciente = new Paciente({
      ...validPaciente,
      socialSecurityNum: "1234567890A",
    });
    await expect(paciente.validate()).rejects.toThrow();
  });

  test("Should fail with invalid email", async () => {
    const paciente = new Paciente({
      ...validPaciente,
      contact: {
        ...validPaciente.contact,
        email: "invalidEmail",
      },
    });
    await expect(paciente.validate()).rejects.toThrow();
  });

  test("Should fail with invalid phoneNumber", async () => {
    const paciente = new Paciente({
      ...validPaciente,
      contact: {
        ...validPaciente.contact,
        phoneNumber: "123",
      },
    });
    await expect(paciente.validate()).rejects.toThrow();
  });
});