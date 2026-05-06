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
import { app } from "../src/app";
import { connectDB } from "../src/db/mongoose";
import { Medication } from "../src/models/medications";

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

  test("Invalid dosis", async () => {
    await request(app)
      .post("/medications")
      .send({ ...validMedication, stockDisponible: "-1" })
      .expect(400);
  });

  test("Invalid precio", async () => {
    await request(app)
      .post("/medications")
      .send({ ...validMedication, precio: "-1" })
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
      .get("/medications?nombreActivo=arecolina")
      .expect(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe("clemamina");
  });

  test("Should filter by national code", async () => {
    await new Medication(validMedication).save();
    const res = await request(app)
      .get("/medications?codigoNaciona=123456")
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

  test("Should return 400 if name is not a string", async () => {
    await request(app)
      .get("/medications?name=Juan Perez&name=Juan Perez")
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
