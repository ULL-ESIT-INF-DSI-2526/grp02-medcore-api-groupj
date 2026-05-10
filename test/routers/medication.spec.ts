import {
  describe,
  test,
  beforeEach,
  beforeAll,
  expect,
  vi,
  afterAll,
} from "vitest";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../src/app";
import { connectDB } from "../../src/db/mongoose";
import { Medication } from "../../src/models/medications";
import { Record } from "../../src/models/records";

const validMedication = {
  name: "clemamina",
  nombreActivo: "arecolina",
  codigoNacional: "123456",
  formaFarmaceutica: "capsula",
  dosis: "50mg",
  viaAdministracion: "oral",
  stockDisponible: 1,
  precio: 20,
  prescripcion: true,
  fechaCaducidad: "2030-11-20",
  contradicciones: [],
};

beforeAll(async () => {
  await connectDB();
});

beforeEach(async () => {
  await Medication.deleteMany();
});

afterAll(async () => {
  await Medication.deleteMany();
});

describe("POST /medications", () => {
  test("Should create a medication member", async () => {
    const response = await request(app)
      .post("/medications")
      .send(validMedication)
      .expect(201);
    expect(response.body.name).toBe("clemamina");
    const medication = await Medication.findById(response.body._id);
    expect(medication).not.toBeNull();
  });

  test("Medication cant have the same national code", async () => {
    await new Medication(validMedication).save();
    await request(app).post("/medications").send(validMedication).expect(409);
  });

  test("Invalid name", async () => {
    await request(app)
      .post("/medications")
      .send({ ...validMedication, name: "AB12" })
      .expect(400);
  });

  test("Invalid nombreActivo", async () => {
    await request(app)
      .post("/medications")
      .send({ ...validMedication, nombreActivo: "CD34" })
      .expect(400);
  });

  test("Invalid codigoNacional", async () => {
    await request(app)
      .post("/medications")
      .send({ ...validMedication, codigoNacional: "ABCDEFG" })
      .expect(400);
  });

  test("Invalid formaFarmaceutica", async () => {
    await request(app)
      .post("/medications")
      .send({ ...validMedication, formaFarmaceutica: "inyeccion" })
      .expect(400);
  });

  test("Invalid dosis", async () => {
    await request(app)
      .post("/medications")
      .send({ ...validMedication, dosis: "400L" })
      .expect(400);
  });

  test("Invalid viaAdministracion", async () => {
    await request(app)
      .post("/medications")
      .send({ ...validMedication, viaAdministracion: "inyectada" })
      .expect(400);
  });

  test("Invalid stockDisponible", async () => {
    await request(app)
      .post("/medications")
      .send({ ...validMedication, stockDisponible: 1.2 })
      .expect(400);
  });

  test("Invalid dosis", async () => {
    await request(app)
      .post("/medications")
      .send({ ...validMedication, stockDisponible: "-1" })
      .expect(400);
  });

  test("Invalid precio", async () => {
    await request(app)
      .post("/medications")
      .send({ ...validMedication, precio: -1 })
      .expect(400);
  });

  test("Invalid precio", async () => {
    await request(app)
      .post("/medications")
      .send({ ...validMedication, precio: 2.3 })
      .expect(400);
  });

  test("Empty body should fail", async () => {
    await request(app).post("/medications").send({}).expect(400);
  });

  test("Internal server error fallback", async () => {
    vi.spyOn(Medication.prototype, "save").mockImplementationOnce(() => {
      throw new Error("Random error");
    });
    await request(app).post("/medications").send(validMedication).expect(500);
  });

  test("Unknown non-error should return 500", async () => {
    vi.spyOn(Medication.prototype, "save").mockImplementationOnce(() => {
      throw "random string error";
    });
    await request(app).post("/medications").send(validMedication).expect(500);
  });
});

describe("GET /medications", () => {
  test("Should return all medication", async () => {
    await new Medication(validMedication).save();
    const res = await request(app).get("/medications").expect(200);
    expect(res.body.length).toBe(1);
  });

  test("Should filter by medication name", async () => {
    await new Medication(validMedication).save();
    const res = await request(app)
      .get("/medications?name=clemamina")
      .expect(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe("clemamina");
  });

  test("Should filter by name of active component", async () => {
    await new Medication(validMedication).save();
    const res = await request(app)
      .get("/medications?nombreActivo=arecolina")
      .expect(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe("clemamina");
  });

  test("Should filter by national code", async () => {
    await new Medication(validMedication).save();
    const res = await request(app)
      .get("/medications?codigoNacional=123456")
      .expect(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe("clemamina");
  });

  test("Should return 404 if no results", async () => {
    await new Medication(validMedication).save();
    await request(app).get("/medications?name=NoExiste").expect(404);
  });

  test("Should return 400 for empty filter", async () => {
    await request(app).get("/medications?name=").expect(400);
  });

  test("Should return 400 for empty filter", async () => {
    await request(app).get("/medications?nombreActivo=").expect(400);
  });

  test("Should return 400 for empty filter", async () => {
    await request(app).get("/medications?codigoNacional=").expect(400);
  });

  test("Should return 400 if name is not a string", async () => {
    await request(app)
      .get("/medications?name=Juan Perez&name=Juan Perez")
      .expect(400);
  });

  test("Should return 400 if nombreActivo is not a string", async () => {
    await request(app)
      .get("/medications?nombreActivo=Clarine&nombreActivo=Morine")
      .expect(400);
  });

  test("Should return 400 if codigoNacional is not a string", async () => {
    await request(app)
      .get("/medications?codigoNacional=123456&codigoNacional=654321")
      .expect(400);
  });

  test("Should return 500 on internal error (GET /medications)", async () => {
    vi.spyOn(Medication, "find").mockImplementationOnce(() => {
      throw new Error("DB error");
    });
    await request(app).get("/medications").expect(500);
  });
});

describe("GET /medications/:id", () => {
  test("Should return a medication by id", async () => {
    const saved = await new Medication(validMedication).save();
    const res = await request(app).get(`/medications/${saved._id}`).expect(200);
    expect(res.body.name).toBe("clemamina");
  });

  test("Should return 404 if medication not found", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await request(app).get(`/medications/${fakeId}`).expect(404);
  });

  test("Should return 400 if id is invalid", async () => {
    await request(app).get(`/medications/123`).expect(400);
  });

  test("Should return 500 on internal error", async () => {
    vi.spyOn(Medication, "findById").mockImplementationOnce(() => {
      throw new Error("DB error");
    });
    const id = new mongoose.Types.ObjectId();
    await request(app).get(`/medications/${id}`).expect(500);
  });
});

describe("PATCH /medications", () => {
  test("Should update a medication by national code", async () => {
    const medication = await new Medication(validMedication).save();
    const response = await request(app)
      .patch(`/medications?codigoNacional=${medication.codigoNacional}`)
      .send({ stockDisponible: 3 })
      .expect(200);
    expect(response.body.stockDisponible).toBe(3);
  });

  test("Should update a medication by name", async () => {
    await new Medication(validMedication).save();
    const res = await request(app)
      .patch("/medications?name=clemamina")
      .send({ stockDisponible: 8 })
      .expect(200);
    expect(res.body.stockDisponible).toBe(8);
  });

test("Should update a medication by active component", async () => {
  await new Medication(validMedication).save();
  const res = await request(app)
    .patch("/medications?nombreActivo=arecolina")
    .send({ stockDisponible: 5 })
    .expect(200);
  expect(res.body.stockDisponible).toBe(5);
});

  test("Should return 400 if national code is missing", async () => {
    await request(app)
      .patch("/medications")
      .send({ stockDisponible: 3 })
      .expect(400);
  });

  test("Should return 400 if national code is empty", async () => {
    await request(app)
      .patch("/medications?codigoNacional=")
      .send({ stockDisponible: 3 })
      .expect(400);
  });

  test("Should return 400 if body is empty", async () => {
    const medicamento = await new Medication(validMedication).save();

    await request(app)
      .patch(`/medications?codigoNacional=${medicamento.codigoNacional}`)
      .send({})
      .expect(400);
  });

  test("Should return 404 if medication not found", async () => {
    await request(app)
      .patch(`/medications?codigoNacional=000000`)
      .send({ stockDisponible: 3 })
      .expect(404);
  });

  test("Should return 400 on validation error", async () => {
    const medicamento = await new Medication(validMedication).save();

    await request(app)
      .patch(`/medications?codigoNacional=${medicamento.codigoNacional}`)
      .send({ precio: -2 })
      .expect(400);
  });

  test("Should return 409 on duplicate codigoNacional", async () => {
    const medicamento1 = await new Medication(validMedication).save();
    const medicamento2 = await new Medication({
      ...validMedication,
      codigoNacional: "111111",
    }).save();

    await request(app)
      .patch(`/medications?codigoNacional=${medicamento1.codigoNacional}`)
      .send({ codigoNacional: "111111" })
      .expect(409);
  });

  test("Should return 500 on internal error", async () => {
    const medications = await new Medication(validMedication).save();
    vi.spyOn(Medication, "findOneAndUpdate").mockImplementationOnce(() => {
      throw new Error("Random error");
    });
    await request(app)
      .patch(`/medications?codigoNacional=${medications.codigoNacional}`)
      .send({ stockDisponible: 3 })
      .expect(500);
  });

  test("Should return 500 if non-error is thrown", async () => {
    const medications = await new Medication(validMedication).save();
    vi.spyOn(Medication, "findOneAndUpdate").mockImplementationOnce(() => {
      throw "random string";
    });
    await request(app)
      .patch(`/medications?codigoNacional=${medications.codigoNacional}`)
      .send({ stockDisponible: 3 })
      .expect(500);
  });
});

describe("PATCH /medications/:id", () => {
  test("Should update a medication by ID", async () => {
    const medication = await new Medication(validMedication).save();
    const response = await request(app)
      .patch(`/medications/${medication._id}`)
      .send({ stockDisponible: 3 })
      .expect(200);
    expect(response.body.stockDisponible).toBe(3);
  });

  test("Should return 400 if ID is invalid", async () => {
    await request(app)
      .patch("/medications/invalidID")
      .send({ shift: "tarde" })
      .expect(400);
  });

  test("Should return 400 if body is empty", async () => {
    const medication = await new Medication(validMedication).save();
    await request(app)
      .patch(`/medications/${medication._id}`)
      .send({})
      .expect(400);
  });

  test("Should return 404 if medication not found", async () => {
    const fakeId = "507f1f77bcf86cd799439011";
    await request(app)
      .patch(`/medications/${fakeId}`)
      .send({ stockDisponible: 3 })
      .expect(404);
  });

  test("Should return 400 on validation error", async () => {
    const medication = await new Medication(validMedication).save();
    await request(app)
      .patch(`/medications/${medication._id}`)
      .send({ precio: -5 })
      .expect(400);
  });

  test("Should return 409 on duplicate codigoNacional", async () => {
    const staff1 = await new Medication(validMedication).save();
    const staff2 = await new Medication({
      ...validMedication,
      codigoNacional: "112233",
    }).save();

    await request(app)
      .patch(`/medications/${staff1._id}`)
      .send({ codigoNacional: "112233" })
      .expect(409);
  });

  test("Should return 500 on internal error", async () => {
    const medication = await new Medication(validMedication).save();
    vi.spyOn(Medication, "findOneAndUpdate").mockRejectedValueOnce(
      new Error("Random error"),
    );
    await request(app)
      .patch(`/medications/${medication._id}`)
      .send({ stockDisponible: 3 })
      .expect(500);
  });

  test("Should return 500 if non-error is thrown", async () => {
    const medication = await new Medication(validMedication).save();
    vi.spyOn(Medication, "findOneAndUpdate").mockRejectedValueOnce(
      "random string",
    );
    await request(app)
      .patch(`/medications/${medication._id}`)
      .send({ stockDisponible: 3 })
      .expect(500);
  });
});

describe("DELETE /medications", () => {
  test("Should delete medication by name", async () => {
    await new Medication(validMedication).save();
    const response = await request(app)
      .delete("/medications?name=clemamina")
      .expect(200);
    expect(response.body.name).toBe("clemamina");
  });

  test("Should delete medication by nombreActivo", async () => {
    await new Medication(validMedication).save();
    const response = await request(app)
      .delete("/medications?nombreActivo=arecolina").expect(200);
    expect(response.body.nombreActivo).toBe("arecolina");
  });

  test("Should delete medication by codigoNacional", async () => {
    await new Medication(validMedication).save();
    const response = await request(app)
      .delete("/medications?codigoNacional=123456").expect(200);
    expect(response.body.codigoNacional).toBe("123456");
  });

  test("Should return 400 if no filters are provided", async () => {
    await request(app)
      .delete("/medications")
      .expect(400);
  });

  test("Should return 404 if medication does not exist", async () => {
    await request(app)
      .delete("/medications?codigoNacional=999999").expect(404);
  });

  test("Should return 409 if medication is used in records", async () => {
    const medication = await new Medication(validMedication).save();
    await Record.create({
      patient: new mongoose.Types.ObjectId(),
      responsibleStaff: new mongoose.Types.ObjectId(),
      recordType: "consulta_ambulatoria",
      reason: "Dolor",
      diagnosis: "Gripe",
      prescribedMedications: [
        {
          medication: medication._id,
          units: 2,
          posology: "Cada 8 horas",
        },
      ],
      amount: 20,
      recordStatus: "abierto",
    });
    await request(app)
      .delete(`/medications?codigoNacional=${medication.codigoNacional}`)
      .expect(409);
  });

  test("Should return 500 on internal error", async () => {
    vi.spyOn(Medication, "findOne").mockImplementationOnce(() => {
      throw new Error("DB error");
    });
    await request(app)
      .delete("/medications?codigoNacional=123456")
      .expect(500);
  });
});

describe("DELETE /medications/:id", () => {
  test("Should delete medication by id", async () => {
    const medication = await new Medication(validMedication).save();
    const response = await request(app)
      .delete(`/medications/${medication._id}`)
      .expect(200);
    expect(response.body._id).toBe(medication.id);
  });

  test("Should return 400 if id is invalid", async () => {
    await request(app)
      .delete("/medications/123")
      .expect(400);
  });

  test("Should return 404 if medication does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await request(app)
      .delete(`/medications/${fakeId}`)
      .expect(404);
  });

  test("Should return 409 if medication is used in records", async () => {
    const medication = await new Medication(validMedication).save();
    await Record.create({
      patient: new mongoose.Types.ObjectId(),
      responsibleStaff: new mongoose.Types.ObjectId(),
      recordType: "consulta_ambulatoria",
      reason: "Dolor",
      diagnosis: "Gripe",
      prescribedMedications: [
        {
          medication: medication._id,
          units: 2,
          posology: "Cada 8 horas",
        },
      ],
      amount: 20,
      recordStatus: "abierto",
    });
    await request(app)
      .delete(`/medications/${medication._id}`)
      .expect(409);
  });

  test("Should return 500 on internal error", async () => {
    vi.spyOn(Medication, "findById").mockImplementationOnce(() => {
      throw new Error("DB error");
    });
    const id = new mongoose.Types.ObjectId();
    await request(app)
      .delete(`/medications/${id}`)
      .expect(500);
  });
});