import {
  describe,
  test,
  beforeEach,
  beforeAll,
  expect,
  vi,
  afterAll,
} from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { connectDB } from "../src/db/mongoose";
import { Medication } from "../src/models/medications";

const validMedication = {
  name: "clemamina",
  nombreActivo: "arecolina",
  codigoNacional: "123456789",
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
});
