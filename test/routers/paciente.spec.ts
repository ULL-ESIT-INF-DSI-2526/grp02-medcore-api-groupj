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
import mongoose from "mongoose";
import { app } from "../../src/app";
import { connectDB } from "../../src/db/mongoose";
import { Paciente } from "../../src/models/paciente";
import { Record } from "../../src/models/records";
import { Medication } from "../../src/models/medications";

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
  await new Promise((resolve) => setTimeout(resolve, 2000));
  await connectDB();
});

beforeEach(async () => {
  vi.clearAllMocks();
  await Paciente.deleteMany();
  await new Paciente(primerPaciente).save();
});

afterAll(async () => {
  await Paciente.deleteMany();
});

describe("POST /patients", () => {
  test("Should successfully create a new pacient", async () => {
    const response = await request(app)
      .post("/patients")
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
      .post("/patients")
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
      .expect(409);
  });

  test("Pacients cannot have the same social security number", async () => {
    await request(app)
      .post("/patients")
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
      .expect(409);
  });

  test("Error of invalid name", async () => {
    await request(app)
      .post("/patients")
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
      .expect(400);
  });

  test("Error of invalid IdNumber", async () => {
    await request(app)
      .post("/patients")
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
      .expect(400);
  });

  test("Error of invalid socialSecurityNum", async () => {
    await request(app)
      .post("/patients")
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
      .expect(400);
  });

  test("Error of invalid email", async () => {
    await request(app)
      .post("/patients")
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
      .expect(400);
  });

  test("Error of invalid phone number", async () => {
    await request(app)
      .post("/patients")
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
      .expect(400);
  });
  test("Unknown non-error should return 500", async () => {
    vi.spyOn(Paciente.prototype, "save").mockImplementationOnce(() => {
      throw "random string error";
    });
    await request(app)
      .post("/patients")
      .send(primerPaciente)
      .expect(500);
  });
});

describe("Error unknown page", () => {
  test("accessing a page that does not exist", async () => {
    await request(app).get(`/empty`).expect(501);
  });
});

describe("GET /patients", () => {
  test("Getting all patients", async () => {
    const response = await request(app).get(`/patients/`).expect(200);

    expect(response.body).to.be.an("array");
    expect(response.body[0]).to.deep.include({
      name: "Pedro Gonzalez",
      dateOfBirth: "1999-11-20T00:00:00.000Z",
      IdNumber: "12345678",
      socialSecurityNum: "28123456789",
      gender: "hombre",
      contact: {
        address: "Calle los Dragos",
        phoneNumber: "+34612345678",
        email: "pedrogo@gmail.com",
      },
      allergies: [],
      bloodType: "O+",
      status: "activo",
    });
  });

  test("Getting a pacient by their name", async () => {
    const response = await request(app)
      .get(`/patients?name=Pedro Gonzalez`)
      .expect(200);

    expect(response.body).to.be.an("array");
    expect(response.body[0]).to.deep.include({
      name: "Pedro Gonzalez",
      IdNumber: "12345678",
      gender: "hombre",
      bloodType: "O+",
      status: "activo",
    });
    expect(response.body[0]).to.have.property("age");
    expect(response.body[0].age).to.be.a("number");
    expect(response.body[0].age).to.be.greaterThan(0);
    expect(response.body[0].age).toBe(26);
  });

  test("Getting a pacient by their IdNumber", async () => {
    const response = await request(app)
      .get(`/patients?IdNumber=12345678`)
      .expect(200);

    expect(response.body).to.be.an("array");
    expect(response.body[0]).to.deep.include({
      name: "Pedro Gonzalez",
      IdNumber: "12345678",
      gender: "hombre",
      bloodType: "O+",
      status: "activo",
    });
    expect(response.body[0]).to.have.property("age");
    expect(response.body[0].age).to.be.a("number");
    expect(response.body[0].age).to.be.greaterThan(0);
    expect(response.body[0].age).toBe(26);
  });

  test("Error when getting a pacient that does not exist", async () => {
    await request(app).get(`/patients?name=Ana Maria`).expect(404);
  });

  test("Error when getting a pacient that does not exist", async () => {
    await request(app).get("/patients?name=").expect(400);
  });

  test("Error when getting a pacient that does not exist", async () => {
    await request(app).get("/patients?IdNumber=").expect(400);
  });

  test("Internal error", async () => {
    vi.spyOn(Paciente, "find").mockRejectedValueOnce(new Error("Random error"));
    await request(app).get("/patients").expect(500);
  });
});

describe("GET /patients/:id", () => {
  test("Should successfully retrieve a pacient by ID", async () => {
    const paciente = await Paciente.findOne({ name: "Pedro Gonzalez" });

    const response = await request(app)
      .get(`/patients/${paciente?._id}`)
      .expect(200);

    expect(response.body).to.include({
      name: "Pedro Gonzalez",
      IdNumber: "12345678",
      gender: "hombre",
      bloodType: "O+",
      status: "activo",
    });
    expect(response.body).to.have.property("age");
    expect(response.body.age).to.be.a("number");
    expect(response.body.age).to.be.greaterThan(0);
    expect(response.body.age).toBe(26);
  });

  test("Should return 404 if pacient not found", async () => {
    const fakeId = "507f1f77bcf86cd799439011";

    await request(app).get(`/patients/${fakeId}`).expect(404);
  });

  test("Internal error", async () => {
    vi.spyOn(Paciente, "findById").mockRejectedValueOnce(
      new Error("Random error"),
    );
    const fakeId = "507f1f77bcf86cd799439011";
    await request(app).get(`/patients/${fakeId}`).expect(500);
  });
});

describe("PATCH /patients", () => {
  test("Correct modification of a pacient", async () => {
    await request(app)
      .patch(`/patients?IdNumber=12345678`)
      .send({ status: "baja temporal" })
      .expect(200);
  });

  test("Correct modification of a pacient", async () => {
    await request(app)
      .patch(`/patients?name=Pedro Gonzalez`)
      .send({ status: "fallecido" })
      .expect(200);
    const response = await request(app).get(`/patients?name=Pedro Gonzalez`);
    expect(response.body[0]).to.deep.include({
      name: "Pedro Gonzalez",
      IdNumber: "12345678",
      gender: "hombre",
      bloodType: "O+",
      status: "fallecido",
    });
    expect(response.body[0]).to.have.property("age");
    expect(response.body[0].age).to.be.a("number");
    expect(response.body[0].age).to.be.greaterThan(0);
    expect(response.body[0].age).toBe(26);
  });

  test("Error when no ID is given", async () => {
    await request(app).patch(`/patients?IdNumber=`).expect(400);
  });

  test("Error when no modification is provided", async () => {
    await request(app)
      .patch(`/patients?IdNumber=12345678`)
      .send({})
      .expect(400);
  });

  test("Error when trying to modify an invalid variable", async () => {
    await request(app)
      .patch(`/patients?IdNumber=12345678`)
      .send({ diet: "Fish" })
      .expect(409);
  });

  test("Error when trying to modify a pacient that does not exist", async () => {
    await request(app)
      .patch(`/patients?IdNumber=12345677`)
      .send({ status: "baja temporal" })
      .expect(404);
  });

  test("Error when trying to modify a pacient that does not exist", async () => {
    await request(app)
      .patch(`/patients`)
      .send({ status: "baja temporal" })
      .expect(400);
  });

  test("Internal error", async () => {
    vi.spyOn(Paciente, "findOneAndUpdate").mockRejectedValueOnce(
      new Error("Random error"),
    );
    await request(app)
      .patch(`/patients?IdNumber=12345678`)
      .send({ status: "baja temporal" })
      .expect(500);
  });
});

describe("PATCH /patients/:id", () => {
  test("Correct modification of pacient through ID", async () => {
    const paciente = await Paciente.findOne({ name: "Pedro Gonzalez" });
    await request(app)
      .patch(`/patients/${paciente?._id}`)
      .send({ status: "baja temporal" })
      .expect(200);
  });

  test("Error when no modification is provided", async () => {
    const paciente = await Paciente.findOne({ name: "Pedro Gonzalez" });
    await request(app).patch(`/patients/${paciente?._id}`).send({}).expect(400);
  });

  test("Error when trying to modify a immutable variable", async () => {
    const paciente = await Paciente.findOne({ name: "Pedro Gonzalez" });
    await request(app)
      .patch(`/patients/${paciente?._id}`)
      .send({ bloodType: "A+" })
      .expect(200);
  });

  test("Error when trying to modify a immutable variable", async () => {
    const paciente = await Paciente.findOne({ name: "Pedro Gonzalez" });
    await request(app)
      .patch(`/patients/${paciente?._id}`)
      .send({ bloodType: "C+" })
      .expect(500);
  });

  test("Error when trying to modify a immutable variable", async () => {
    const paciente = await Paciente.findOne({ name: "Pedro Gonzalez" });
    await request(app)
      .patch(`/patients/${paciente?._id}`)
      .send({ diet: "Fish" })
      .expect(409);
  });

  test("Error when trying to modify a pacient that does not exist", async () => {
    const fakeId = "507f1f77bcf86cd799439011";
    await request(app)
      .patch(`/patients/${fakeId}`)
      .send({ status: "baja temporal" })
      .expect(404);
  });

  test("Internal server error", async () => {
    const paciente = await Paciente.findOne({ name: "Jose Angel" });
    await request(app)
      .patch(`/patients/${paciente?._id}`)
      .send({ status: "baja temporal" })
      .expect(500);
  });
});

describe("DELETE /patients", () => {
  test("Delete a pacient from the system using name", async () => {
    await request(app)
      .delete("/patients?name=Pedro Gonzalez")
      .expect(200);
  });

  test("Delete a pacient from the system using IdNumber", async () => {
    const paciente = await Paciente.findOne({
      name: "Pedro Gonzalez",
    });
    await request(app)
      .delete(`/patients?IdNumber=${paciente!.IdNumber}`)
      .expect(200);
  });

  test("Should restore medication stock when deleting patient", async () => {
    const paciente = await Paciente.findOne({
      name: "Pedro Gonzalez",
    });
    const saveMock = vi.fn();
    vi.spyOn(Medication, "findById").mockResolvedValueOnce({
      stockDisponible: 5,
      save: saveMock,
    } as any);
    await Record.create({
      patient: paciente!._id,
      responsibleStaff: new mongoose.Types.ObjectId(),
      recordType: "consulta_ambulatoria",
      reason: "Dolor",
      diagnosis: "Gripe",
      prescribedMedications: [
        {
          medication: new mongoose.Types.ObjectId(),
          units: 2,
          posology: "Cada 8 horas",
        },
      ],
      amount: 20,
      recordStatus: "cerrado",
    });
    await request(app)
      .delete(`/patients?name=${paciente!.name}`)
      .expect(200);
    expect(saveMock).toHaveBeenCalled();
  });

  test("Delete a pacient with records and restore medication stock", async () => {
    const paciente = await Paciente.findOne({
      name: "Pedro Gonzalez",
    });
    const medication = await Medication.create({
      name: "Paracetamol",
      nombreActivo: "Paracetamol",
      codigoNacional: "999999",
      formaFarmaceutica: "capsula",
      dosis: "10mg",
      viaAdministracion: "oral",
      stockDisponible: 5,
      precio: 10,
      prescripcion: true,
      fechaCaducidad: "2030-10-10",
      contradicciones: [],
    });
    const record = await Record.create({
      patient: paciente!._id,
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
      recordStatus: "cerrado",
    });
    await request(app)
      .delete(`/patients?name=${paciente!.name}`)
      .expect(200);
    const deletedRecord = await Record.findById(record._id);
    expect(deletedRecord).toBeNull();
  });

  test("Error when no name or IdNumber is provided", async () => {
    await request(app).delete("/patients").expect(400);
  });

  test("Error when a pacient is not found", async () => {
    await request(app)
      .delete("/patients?name=Ana Gonzalez")
      .expect(404);
  });

  test("Internal server error", async () => {
    vi.spyOn(Paciente, "deleteMany").mockRejectedValueOnce(
      new Error("Random Error"),
    );
    await request(app)
      .delete("/patients?name=Pedro Gonzalez")
      .expect(500);
  });
});

describe("DELETE /patients/:id", () => {
  test("Delete a pacient with records by ID", async () => {
    const paciente = await Paciente.findOne({
      name: "Pedro Gonzalez",
    });
    const medication = await Medication.create({
      name: "Ibuprofeno",
      nombreActivo: "Ibuprofeno",
      codigoNacional: "888888",
      formaFarmaceutica: "capsula",
      dosis: "20mg",
      viaAdministracion: "oral",
      stockDisponible: 10,
      precio: 15,
      prescripcion: true,
      fechaCaducidad: "2030-10-10",
      contradicciones: [],
    });
    const record = await Record.create({
      patient: paciente!._id,
      responsibleStaff: new mongoose.Types.ObjectId(),
      recordType: "consulta_ambulatoria",
      reason: "Dolor",
      diagnosis: "Migraña",
      prescribedMedications: [
        {
          medication: medication._id,
          units: 3,
          posology: "Cada 12 horas",
        },
      ],
      amount: 45,
      recordStatus: "cerrado",
    });
    await request(app)
      .delete(`/patients/${paciente?._id}`)
      .expect(200);
    const deletedRecord = await Record.findById(record._id);
    expect(deletedRecord).toBeNull();
  });

  test("Should restore medication stock when deleting patient by ID", async () => {
    const paciente = await Paciente.findOne({
      name: "Pedro Gonzalez",
    });
    const saveMock = vi.fn();
    vi.spyOn(Medication, "findById").mockResolvedValueOnce({
      stockDisponible: 10,
      save: saveMock,
    } as any);
    await Record.create({
      patient: paciente!._id,
      responsibleStaff: new mongoose.Types.ObjectId(),
      recordType: "consulta_ambulatoria",
      reason: "Dolor",
      diagnosis: "Gripe",
      prescribedMedications: [
        {
          medication: new mongoose.Types.ObjectId(),
          units: 5,
          posology: "Cada 8 horas",
        },
      ],
      amount: 20,
      recordStatus: "cerrado",
    });
    await request(app)
      .delete(`/patients/${paciente!._id}`)
      .expect(200);
    expect(saveMock).toHaveBeenCalled();
  });

  test("Should continue deleting patient if medication does not exist", async () => {
    const paciente = await Paciente.findOne({
      name: "Pedro Gonzalez",
    });
    await Record.create({
      patient: paciente!._id,
      responsibleStaff: new mongoose.Types.ObjectId(),
      recordType: "consulta_ambulatoria",
      reason: "Dolor",
      diagnosis: "Gripe",
      prescribedMedications: [
        {
          medication: new mongoose.Types.ObjectId(),
          units: 5,
          posology: "Cada 8 horas",
        },
      ],
      amount: 20,
      recordStatus: "cerrado",
    });
    vi.spyOn(Medication, "findById").mockResolvedValueOnce(null);
    await request(app)
      .delete(`/patients/${paciente!._id}`)
      .expect(200);
  });

  test("Invalid ID should return 400", async () => {
    await request(app)
      .delete("/patients/invalidID")
      .expect(400);
  });

  test("Error when a pacient is not found", async () => {
    const fakeId = "507f1f77bcf86cd799439011";
    await request(app)
      .delete(`/patients/${fakeId}`)
      .expect(404);
  });

  test("Internal server error", async () => {
    vi.spyOn(Paciente, "findByIdAndDelete").mockRejectedValueOnce(
      new Error("Random Error"),
    );
    const paciente = await Paciente.findOne({
      name: "Pedro Gonzalez",
    });
    await request(app)
      .delete(`/patients/${paciente?._id}`)
      .expect(500);
  });
});