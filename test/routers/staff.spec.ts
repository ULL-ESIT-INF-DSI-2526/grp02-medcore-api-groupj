import { describe, test, beforeEach, beforeAll, expect, afterAll, vi } from "vitest";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../src/app";
import { connectDB } from "../../src/db/mongoose";
import { Staff } from "../../src/models/staff";
import { Record } from "../../src/models/records";

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

describe("PATCH /staff", () => {

  test("Should update a staff member by medicalLicenseNum", async () => {
    const staff = await new Staff(validStaff).save();
    const response = await request(app)
      .patch(`/staff?medicalLicenseNum=${staff.medicalLicenseNum}`)
      .send({ shift: "tarde" })
      .expect(200);
    expect(response.body.shift).toBe("tarde");
  });

  test("Should return 400 if medicalLicenseNum is missing", async () => {
    await request(app)
      .patch("/staff")
      .send({ shift: "tarde" })
      .expect(400);
  });

  test("Should return 400 if medicalLicenseNum is empty", async () => {
    await request(app)
      .patch("/staff?medicalLicenseNum=")
      .send({ shift: "tarde" })
      .expect(400);
  });

  test("Should return 400 if medicalLicenseNum is not a string (array case)", async () => {
    await request(app)
      .patch("/staff?medicalLicenseNum[]=123&medicalLicenseNum[]=456")
      .send({ shift: "tarde" })
      .expect(400);
  });

  test("Should return 400 if body is empty", async () => {
    const staff = await new Staff(validStaff).save();

    await request(app)
      .patch(`/staff?medicalLicenseNum=${staff.medicalLicenseNum}`)
      .send({})
      .expect(400);
  });

  test("Should return 404 if staff not found", async () => {
    await request(app)
      .patch("/staff?medicalLicenseNum=000000000")
      .send({ shift: "tarde" })
      .expect(404);
  });

  test("Should return 400 on validation error", async () => {
    const staff = await new Staff(validStaff).save();
    await request(app)
      .patch(`/staff?medicalLicenseNum=${staff.medicalLicenseNum}`)
      .send({ experience: -10 })
      .expect(400);
  });

  test("Should return 409 on duplicate medicalLicenseNum", async () => {
    const staff1 = await new Staff(validStaff).save();
    const staff2 = await new Staff({
      ...validStaff,
      medicalLicenseNum: "999999999"
    }).save();
    await request(app)
      .patch(`/staff?medicalLicenseNum=${staff1.medicalLicenseNum}`)
      .send({ medicalLicenseNum: "999999999" })
      .expect(409);
  });

  test("Should return 500 on internal error", async () => {
    const staff = await new Staff(validStaff).save();
    vi.spyOn(Staff, "findOneAndUpdate").mockImplementationOnce(() => {
      throw new Error("Random error");
    });
    await request(app)
      .patch(`/staff?medicalLicenseNum=${staff.medicalLicenseNum}`)
      .send({ shift: "tarde" })
      .expect(500);
  });

  test("Should return 500 if non-error is thrown", async () => {
    const staff = await new Staff(validStaff).save();
    vi.spyOn(Staff, "findOneAndUpdate").mockImplementationOnce(() => {
      throw "random string";
    });
    await request(app)
      .patch(`/staff?medicalLicenseNum=${staff.medicalLicenseNum}`)
      .send({ shift: "tarde" })
      .expect(500);
  });

});

describe("PATCH /staff/:id", () => {

  test("Should update a staff member by ID", async () => {
    const staff = await new Staff(validStaff).save();
    const response = await request(app)
      .patch(`/staff/${staff._id}`)
      .send({ shift: "tarde" })
      .expect(200);
    expect(response.body.shift).toBe("tarde");
  });

  test("Should return 400 if ID is invalid", async () => {
    await request(app)
      .patch("/staff/invalidID")
      .send({ shift: "tarde" })
      .expect(400);
  });

  test("Should return 400 if body is empty", async () => {
    const staff = await new Staff(validStaff).save();
    await request(app)
      .patch(`/staff/${staff._id}`)
      .send({})
      .expect(400);
  });

  test("Should return 404 if staff not found", async () => {
    const fakeId = "507f1f77bcf86cd799439011";
    await request(app)
      .patch(`/staff/${fakeId}`)
      .send({ shift: "tarde" })
      .expect(404);
  });

  test("Should return 400 on validation error", async () => {
    const staff = await new Staff(validStaff).save();
    await request(app)
      .patch(`/staff/${staff._id}`)
      .send({ experience: -5 })
      .expect(400);
  });

  test("Should return 409 on duplicate medicalLicenseNum", async () => {
    const staff1 = await new Staff(validStaff).save();
    const staff2 = await new Staff({
      ...validStaff,
      medicalLicenseNum: "999999999"
    }).save();

    await request(app)
      .patch(`/staff/${staff1._id}`)
      .send({ medicalLicenseNum: "999999999" })
      .expect(409);
  });

  test("Should return 500 on internal error", async () => {
    const staff = await new Staff(validStaff).save();
    vi.spyOn(Staff, "findOneAndUpdate").mockRejectedValueOnce(
      new Error("Random error")
    );
    await request(app)
      .patch(`/staff/${staff._id}`)
      .send({ shift: "tarde" })
      .expect(500);
  });

  test("Should return 500 if non-error is thrown", async () => {
    const staff = await new Staff(validStaff).save();
    vi.spyOn(Staff, "findOneAndUpdate").mockRejectedValueOnce(
      "random string"
    );
    await request(app)
      .patch(`/staff/${staff._id}`)
      .send({ shift: "tarde" })
      .expect(500);
  });
});

describe("DELETE /staff", () => {
  test("Should delete a staff member by medicalLicenseNum", async () => {
    await new Staff(validStaff).save();

    await request(app)
      .delete(
        `/staff?medicalLicenseNum=${validStaff.medicalLicenseNum}`,
      )
      .expect(200);
  });

  test("Should return 400 if medicalLicenseNum is missing", async () => {
    await request(app)
      .delete("/staff")
      .expect(400);
  });

  test("Should return 400 if medicalLicenseNum is empty", async () => {
    await request(app)
      .delete("/staff?medicalLicenseNum=")
      .expect(400);
  });

  test("Should return 400 if medicalLicenseNum is not a string", async () => {
    await request(app)
      .delete(
        "/staff?medicalLicenseNum=123456789&medicalLicenseNum=987654321",
      )
      .expect(400);
  });

  test("Should return 404 if staff member does not exist", async () => {
    await request(app)
      .delete("/staff?medicalLicenseNum=000000000")
      .expect(404);
  });

  test("Should return 409 if staff member has assigned records", async () => {
    const staff = await new Staff(validStaff).save();
    await Record.create({
      patient: new mongoose.Types.ObjectId(),
      responsibleStaff: staff._id,
      recordType: "consulta_ambulatoria",
      reason: "Dolor",
      diagnosis: "Gripe",
      prescribedMedications: [
        {
          medication: new mongoose.Types.ObjectId(),
          units: 1,
          posology: "1 al dia",
        },
      ],
      amount: 20,
      recordStatus: "cerrado",
    });
    await request(app)
      .delete(
        `/staff?medicalLicenseNum=${staff.medicalLicenseNum}`,
      )
      .expect(409);
  });

  test("Should return 400 on ValidationError in DELETE /staff", async () => {
    vi.spyOn(Staff, "findOne").mockImplementationOnce(() => {
      const error = new Error("Validation failed");
      error.name = "ValidationError";
      throw error;
    });
    await request(app)
      .delete(`/staff?medicalLicenseNum=${validStaff.medicalLicenseNum}`)
      .expect(400);
  });

  test("Should return 500 on internal error", async () => {
    vi.spyOn(Staff, "findOne").mockImplementationOnce(() => {
      throw new Error("Random error");
    });
    await request(app)
      .delete(
        `/staff?medicalLicenseNum=${validStaff.medicalLicenseNum}`,
      )
      .expect(500);
  });

  test("Should return 500 if non-error is thrown", async () => {
    vi.spyOn(Staff, "findOne").mockImplementationOnce(() => {
      throw "random string";
    });
    await request(app)
      .delete(
        `/staff?medicalLicenseNum=${validStaff.medicalLicenseNum}`,
      )
      .expect(500);
  });
});

describe("DELETE /staff/:id", () => {

  test("Should delete a staff member by ID", async () => {
    const staff = await new Staff(validStaff).save();
    await request(app)
      .delete(`/staff/${staff._id}`)
      .expect(200);
  });

  test("Should return 400 if ID is invalid", async () => {
    await request(app)
      .delete("/staff/invalidID")
      .expect(400);
  });

  test("Should return 404 if staff member does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await request(app)
      .delete(`/staff/${fakeId}`)
      .expect(404);
  });

  test("Should return 409 if staff member has assigned records", async () => {
    const staff = await new Staff(validStaff).save();
    await Record.create({
      patient: new mongoose.Types.ObjectId(),
      responsibleStaff: staff._id,
      recordType: "consulta_ambulatoria",
      reason: "Dolor",
      diagnosis: "Gripe",
      prescribedMedications: [
        {
          medication: new mongoose.Types.ObjectId(),
          units: 1,
          posology: "1 al dia",
        },
      ],
      amount: 20,
      recordStatus: "cerrado",
    });
    await request(app)
      .delete(`/staff/${staff._id}`)
      .expect(409);
  });

  test("Should return deleted staff member by ID", async () => {
    const staff = await new Staff(validStaff).save();
    const response = await request(app)
      .delete(`/staff/${staff._id}`)
      .expect(200);
    expect(response.body.medicalLicenseNum).toBe(
      validStaff.medicalLicenseNum,
    );
  });

  test("Should return 400 on ValidationError", async () => {
    const staff = await new Staff(validStaff).save();
    vi.spyOn(Staff, "findById").mockImplementationOnce(() => {
      const error = new Error("Validation failed");
      error.name = "ValidationError";
      throw error;
    });
    await request(app)
      .delete(`/staff/${staff._id}`)
      .expect(400);
  });

  test("Should return 500 on internal error", async () => {
    const staff = await new Staff(validStaff).save();
    vi.spyOn(Staff, "findById").mockImplementationOnce(() => {
      throw new Error("Random error");
    });
    await request(app)
      .delete(`/staff/${staff._id}`)
      .expect(500);
  });

  test("Should return 500 if non-error is thrown", async () => {
    const staff = await new Staff(validStaff).save();
    vi.spyOn(Staff, "findById").mockImplementationOnce(() => {
      throw "random string";
    });
    await request(app)
      .delete(`/staff/${staff._id}`)
      .expect(500);
  });
});