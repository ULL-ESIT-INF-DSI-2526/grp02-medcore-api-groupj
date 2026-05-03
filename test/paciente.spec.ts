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

  test("Pacients cant have the same ID", async () => {
    await request(app)
      .post("/pacientes")
      .send({
        name: "Ana Maria",
        dateOfBirth: "1960-12-5",
        IdNumber: "12345678",
        socialSecurityNum: "12345678901",
        gender: "mujer",
        contact: {
          address: "Camino San Alberto",
          phoneNumber: "+34600123456",
          email: "AniMari12@gmail.com",
        },
        allergies: ["gatos"],
        bloodType: "AB-",
        status: "activo",
      })
      .expect(500);
  });

  test("Pacients cannot have the same social security number", async () => {
    await request(app)
      .post("/pacientes")
      .send({
        name: "Ana Maria",
        dateOfBirth: "1960-12-5",
        IdNumber: "14235867",
        socialSecurityNum: "28123456789",
        gender: "mujer",
        contact: {
          address: "Camino San Alberto",
          phoneNumber: "+34600123456",
          email: "AniMari12@gmail.com",
        },
        allergies: ["gatos"],
        bloodType: "AB-",
        status: "activo",
      })
      .expect(500);
  });

  test("Error of invalid name", async () => {
    await request(app)
      .post("/pacientes")
      .send({
        name: "Ana Maria2",
        dateOfBirth: "1960-12-5",
        IdNumber: "14235867",
        socialSecurityNum: "12345678901",
        gender: "mujer",
        contact: {
          address: "Camino San Alberto",
          phoneNumber: "+34600123456",
          email: "AniMari12@gmail.com",
        },
        allergies: ["gatos"],
        bloodType: "AB-",
        status: "activo",
      })
      .expect(500);
  });

  test("Error of invalid IdNumber", async () => {
    await request(app)
      .post("/pacientes")
      .send({
        name: "Ana Maria",
        dateOfBirth: "1960-12-5",
        IdNumber: "1423586",
        socialSecurityNum: "12345678901",
        gender: "mujer",
        contact: {
          address: "Camino San Alberto",
          phoneNumber: "+34600123456",
          email: "AniMari12@gmail.com",
        },
        allergies: ["gatos"],
        bloodType: "AB-",
        status: "activo",
      })
      .expect(500);
  });

  test("Error of invalid socialSecurityNum", async () => {
    await request(app)
      .post("/pacientes")
      .send({
        name: "Ana Maria",
        dateOfBirth: "1960-12-5",
        IdNumber: "14235867",
        socialSecurityNum: "12345678901a",
        gender: "mujer",
        contact: {
          address: "Camino San Alberto",
          phoneNumber: "+34600123456",
          email: "AniMari12@gmail.com",
        },
        allergies: ["gatos"],
        bloodType: "AB-",
        status: "activo",
      })
      .expect(500);
  });

  test("Error of invalid email", async () => {
    await request(app)
      .post("/pacientes")
      .send({
        name: "Ana Maria",
        dateOfBirth: "1960-12-5",
        IdNumber: "14235867",
        socialSecurityNum: "12345678901",
        gender: "mujer",
        contact: {
          address: "Camino San Alberto",
          phoneNumber: "+34600123456",
          email: "AniMari12",
        },
        allergies: ["gatos"],
        bloodType: "AB-",
        status: "activo",
      })
      .expect(500);
  });

  test("Error of invalid phone number", async () => {
    await request(app)
      .post("/pacientes")
      .send({
        name: "Ana Maria2",
        dateOfBirth: "1960-12-5",
        IdNumber: "14235867",
        socialSecurityNum: "12345678901",
        gender: "mujer",
        contact: {
          address: "Camino San Alberto",
          phoneNumber: "+34123456",
          email: "AniMari12@gmail.com",
        },
        allergies: ["gatos"],
        bloodType: "AB-",
        status: "activo",
      })
      .expect(500);
  });
});

describe("Error unknown page", () => {
  test("accessing a page that does not exist", async () => {
    await request(app).get(`/empty`).expect(501);
  });
});

describe("GET /pacientes", () => {
  test("Getting a pacient by their name", async () => {
    await request(app).get(`/pacientes?name=Pedro Gonzalez`).expect(200);
  });

  test("Error when getting a pacient that does not exist", async () => {
    await request(app).get(`/pacientes?name=Ana Maria`).expect(404);
  });

  test("Error when getting a pacient that does not exist", async () => {
    await request(app).get("/pacientes?name=").expect(400);
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

    await request(app).get(`/pacientes/${fakeId}`).expect(404);
  });
});

describe("PATCH /pacientes", () => {
  test("Correct modification of a pacient", async () => {
    await request(app)
      .patch(`/pacientes?IdNumber=12345678`)
      .send({ status: "baja temporal" })
      .expect(200);
  });

  test("Error when no ID is given", async () => {
    await request(app).patch(`/pacientes?IdNumber=`).expect(400);
  });

  test("Error when no modification is provided", async () => {
    await request(app)
      .patch(`/pacientes?IdNumber=12345678`)
      .send({})
      .expect(400);
  });

  test("Error when trying to modify a immutable variable", async () => {
    await request(app)
      .patch(`/pacientes?IdNumber=12345678`)
      .send({ bloodType: "A+" })
      .expect(400);
  });

  test("Error when trying to modify a pacient that does not exist", async () => {
    await request(app)
      .patch(`/pacientes?IdNumber=12345677`)
      .send({ status: "baja temporal" })
      .expect(404);
  });
});

describe("PATCH /pacientes/:id", () => {
  test("Correct modification of pacient through ID", async () => {
    const paciente = await Paciente.findOne({ name: "Pedro Gonzalez" });

    await request(app)
      .patch(`/pacientes/${paciente?._id}`)
      .send({ status: "baja temporal" })
      .expect(200);
  });

  test("Error when no modification is provided", async () => {
    const paciente = await Paciente.findOne({ name: "Pedro Gonzalez" });

    await request(app)
      .patch(`/pacientes/${paciente?._id}`)
      .send({})
      .expect(400);
  });

  test("Error when trying to modify a immutable variable", async () => {
    const paciente = await Paciente.findOne({ name: "Pedro Gonzalez" });

    await request(app)
      .patch(`/pacientes/${paciente?._id}`)
      .send({ bloodType: "A+" })
      .expect(400);
  });

  test("Error when trying to modify a pacient that does not exist", async () => {
    const fakeId = "507f1f77bcf86cd799439011";
    await request(app)
      .patch(`/pacientes/${fakeId}`)
      .send({ status: "baja temporal" })
      .expect(404);
  });

  test("Internal server error", async () => {
    const paciente = await Paciente.findOne({ name: "Jose Angel" });
    await request(app)
      .patch(`/pacientes/${paciente?._id}`)
      .send({ status: "baja temporal" })
      .expect(500);
  });
});
