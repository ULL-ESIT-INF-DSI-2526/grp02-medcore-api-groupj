import { describe, test, beforeEach, beforeAll, expect, afterAll, vi } from "vitest";
import mongoose from "mongoose";
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

test("Unknown non-error should return 500", async () => {
  vi.spyOn(Staff.prototype, "save").mockImplementationOnce(() => {
    throw "random string error";
  });
  await request(app)
    .post("/staff")
    .send(validStaff)
    .expect(500);
});

});

describe("GET /staff", () => {

  test("Should return all staff (no filters)", async () => {
    await new Staff(validStaff).save();
    const res = await request(app)
      .get("/staff")
      .expect(200);
    expect(res.body.length).toBe(1);
  });

  test("Should filter by name", async () => {
    await new Staff(validStaff).save();
    const res = await request(app)
      .get("/staff?name=Juan Perez")
      .expect(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe("Juan Perez");
  });

  test("Should filter by specialty", async () => {
    await new Staff(validStaff).save();
    const res = await request(app)
      .get("/staff?medicalSpecialty=cardiologia")
      .expect(200);
    expect(res.body.length).toBe(1);
  });

  test("Should return 404 if no results", async () => {
    await new Staff(validStaff).save();
    await request(app)
      .get("/staff?name=NoExiste")
      .expect(404);
  });

  test("Should return 400 for invalid specialty", async () => {
    await request(app)
      .get("/staff?medicalSpecialty=pizza")
      .expect(400);
  });

  test("Should return 400 for empty filter", async () => {
    await request(app)
      .get("/staff?name=")
      .expect(400);
  });

  test("Should return 400 if name is not a string", async () => {
    await request(app)
      .get("/staff?name=Juan Perez&name=Juan Perez")
      .expect(400);
  });

  test("Should return 500 on internal error (GET /staff)", async () => {
    vi.spyOn(Staff, "find").mockImplementationOnce(() => {
      throw new Error("DB error");
    });
    await request(app)
      .get("/staff")
      .expect(500);
  });

});

describe("GET /staff/:id", () => {

  test("Should return a staff by id", async () => {
    const saved = await new Staff(validStaff).save();
    const res = await request(app)
      .get(`/staff/${saved._id}`)
      .expect(200);
    expect(res.body.name).toBe("Juan Perez");
  });

  test("Should return 404 if staff not found", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await request(app)
      .get(`/staff/${fakeId}`)
      .expect(404);
  });

  test("Should return 400 if id is invalid", async () => {
    await request(app)
      .get("/staff/123")
      .expect(400);
  });

  test("Should return 500 on internal error", async () => {
    vi.spyOn(Staff, "findById").mockImplementationOnce(() => {
      throw new Error("DB error");
    });
    const id = new mongoose.Types.ObjectId();
    await request(app)
      .get(`/staff/${id}`)
      .expect(500);
  });

});