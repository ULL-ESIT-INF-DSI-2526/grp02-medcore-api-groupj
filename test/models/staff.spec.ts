import { describe, test, expect } from "vitest";
import { Staff } from "../../src/models/staff";

const validStaff = {
  name: "Juan Perez",
  medicalLicenseNum: "123456789",
  medicalSpecialty: "cardiologia",
  professionalCategory: "medico",
  shift: "mañana",
  roomNumber: "2-A12",
  experience: 10,
  contact: {
    phoneNumber: "+34612345678",
    email: "juan@gmail.com",
  },
  status: "activo",
};

describe("Staff Model", () => {
  test("Should fail with invalid medicalLicenseNum", async () => {
    const staff = new Staff({
      ...validStaff,
      medicalLicenseNum: "123",
    });
    await expect(staff.validate()).rejects.toThrow();
  });

  test("Should fail with invalid roomNumber", async () => {
    const staff = new Staff({
      ...validStaff,
      roomNumber: "invalid",
    });
    await expect(staff.validate()).rejects.toThrow();
  });

  test("Should fail with decimal experience", async () => {
    const staff = new Staff({
      ...validStaff,
      experience: 10.5,
    });
    await expect(staff.validate()).rejects.toThrow();
  });

  test("Should fail with invalid email", async () => {
    const staff = new Staff({
      ...validStaff,
      contact: {
        ...validStaff.contact,
        email: "invalidEmail",
      },
    });
    await expect(staff.validate()).rejects.toThrow();
  });

  test("Should fail with invalid phone number", async () => {
    const staff = new Staff({
      ...validStaff,
      contact: {
        ...validStaff.contact,
        phoneNumber: "123",
      },
    });
    await expect(staff.validate()).rejects.toThrow();
  });

  test("Should fail with invalid name characters", async () => {
    const staff = new Staff({
      ...validStaff,
      name: "Juan123",
    });
    await expect(staff.validate()).rejects.toThrow(
      "El nombre solo puede tener letras",
    );
  });

  test("Should fail with invalid spanish phone number", async () => {
    const staff = new Staff({
      ...validStaff,
      contact: {
        ...validStaff.contact,
        phoneNumber: "600000000",
      },
    });
    await expect(staff.validate()).rejects.toThrow();
  });
});