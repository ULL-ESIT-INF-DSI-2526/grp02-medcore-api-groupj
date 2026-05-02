import { describe, test, beforeEach, beforeAll, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { connectDB } from "../src/db/mongoose";
import { Paciente } from "../src/models/paciente";

const primerPaciente = {
  name: "Pedro Gonzalez",
  dateOfBirth: "1999-11-20",
  IdNumber: "12345678",
  socialSecurityNum: "28123456789",
  gender: "hombre",
  contact: {
    address: "Calle los Dragos",
    phoneNumber: "+34612345678",
    email: "PedroGo@gmail.com",
  },
  allergies: [],
  bloodType: "O+",
  status: "activo",
};

beforeAll(async () => {
  await connectDB();
});

beforeEach(async () => {
  await Paciente.deleteMany();
  await new Paciente(primerPaciente).save();
});

describe("POST /pacientes", () => {
  test("Should successfully create a new pacient", async () => {
    const response = await request(app)
      .post("/pacientes")
      .send({
        name: "Jose Perez",
        dateOfBirth: "1985-12-21",
        IdNumber: "98765432",
        socialSecurityNum: "28214365879",
        gender: "hombre",
        contact: {
          address: "Avenida La Manzana",
          phoneNumber: "+34687654321",
          email: "joper32@gmail.com",
        },
        allergies: [],
        bloodType: "A-",
        status: "baja temporal",
      })
      .expect(201);

    expect(response.body).to.deep.include({
      name: "Jose Perez",
      dateOfBirth: "1985-12-21T00:00:00.000Z",
      IdNumber: "98765432",
      socialSecurityNum: "28214365879",
      gender: "hombre",
      contact: {
        address: "Avenida La Manzana",
        phoneNumber: "+34687654321",
        email: "joper32@gmail.com",
      },
      allergies: [],
      bloodType: "A-",
      status: "baja temporal",
    });
    const secondPacient = await Paciente.findById(response.body._id);
    expect(secondPacient).not.toBe(null);
    expect(secondPacient!.name).to.equal("Jose Perez");
  });
});

describe("GET /pacientes/:id", () => {
  test("Should successfully retrieve a pacient by ID", async () => {
    const paciente = await Paciente.findOne({ name: "Pedro Gonzalez" });
    
    const response = await request(app)
      .get(`/pacientes/${paciente?._id}`)
      .expect(200);

    expect(response.body).to.include({
      name: "Pedro Gonzalez",
      IdNumber: "12345678",
      gender: "hombre",
      bloodType: "O+",
      status: "activo",
    });
  });

  test("Should return 404 if pacient not found", async () => {
    const fakeId = "507f1f77bcf86cd799439011";
    
    await request(app)
      .get(`/pacientes/${fakeId}`)
      .expect(404);
  });
});