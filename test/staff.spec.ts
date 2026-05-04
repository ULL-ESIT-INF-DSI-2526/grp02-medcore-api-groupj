import { describe, test, beforeEach, beforeAll, expect, afterAll, vi } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { connectDB } from "../src/db/mongoose";
import { Staff } from "../src/models/staff";

const validStaff = {
  name: "Juan Perez",
  medicalLicenseNum: "283499999",
  medicalSpecialty: "cardiologia",
  professionalCategory: "medico_adjunto",
  shift: "mañana",
  roomNumber: "2-A12",
  experience: 10,
  contact: {
    phoneNumber: "612345678",
    email: "juan@test.com"
  },
  status: "activo"
};

beforeAll(async () => {
  await connectDB();
});

beforeEach(async () => {
  await Staff.deleteMany();
});

afterAll(async () => {
  await Staff.deleteMany();
});

describe("POST /staff", () => {

  test("Should create a staff member", async () => {
    const response = await request(app)
      .post("/staff")
      .send(validStaff)
      .expect(201);

    expect(response.body.name).toBe("Juan Perez");

    const staff = await Staff.findById(response.body._id);
    expect(staff).not.toBeNull();
  });

  test("Should not allow duplicate medicalLicenseNum", async () => {
    await new Staff(validStaff).save();

    await request(app)
      .post("/staff")
      .send(validStaff)
      .expect(409);
  });

  test("Invalid medicalLicenseNum format", async () => {
    await request(app)
      .post("/staff")
      .send({
        ...validStaff,
        medicalLicenseNum: "123"
      })
      .expect(400);
  });

  test("Invalid shift enum", async () => {
    await request(app)
      .post("/staff")
      .send({
        ...validStaff,
        shift: "findesemana"
      })
      .expect(400);
  });

  test("Invalid roomNumber format", async () => {
    await request(app)
      .post("/staff")
      .send({
        ...validStaff,
        roomNumber: "A12"
      })
      .expect(400);
  });

  test("Invalid email", async () => {
    await request(app)
      .post("/staff")
      .send({
        ...validStaff,
        contact: {
          ...validStaff.contact,
          email: "invalid"
        }
      })
      .expect(400);
  });

  test("Invalid phone number", async () => {
    await request(app)
      .post("/staff")
      .send({
        ...validStaff,
        contact: {
          ...validStaff.contact,
          phoneNumber: "123"
        }
      })
      .expect(400);
  });

  test("Experience must be integer", async () => {
    await request(app)
      .post("/staff")
      .send({
        ...validStaff,
        experience: 10.5
      })
      .expect(400);
  });

  test("Empty body should fail", async () => {
    await request(app)
      .post("/staff")
      .send({})
      .expect(400);
  });

  test("Internal server error fallback", async () => {
    vi.spyOn(Staff.prototype, "save").mockImplementationOnce(() => {
      throw new Error("Random error");
    });

    await request(app)
      .post("/staff")
      .send(validStaff)
      .expect(500);
  });

});