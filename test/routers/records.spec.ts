import {
  describe,
  test,
  beforeAll,
  beforeEach,
  afterAll,
  expect,
  vi
} from "vitest";

import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../src/app";
import { connectDB } from "../../src/db/mongoose";

import { Record } from "../../src/models/records";
import { Paciente } from "../../src/models/paciente";
import { Staff } from "../../src/models/staff";
import { Medication } from "../../src/models/medications";

const validPatient = {
  name: "Juan Perez",
  dateOfBirth: "1990-05-10",
  IdNumber: "12345678Z",
  socialSecurityNum: "12345678901",
  gender: "hombre",
  contact: {
    address: "Calle Falsa 123",
    phoneNumber: "612345678",
    email: "juan@test.com"
  },
  allergies: [],
  bloodType: "A+",
  status: "activo"
};

const validStaff = {
  name: "Maria Lopez",
  medicalLicenseNum: "123456789",
  medicalSpecialty: "cardiologia",
  professionalCategory: "medico_adjunto",
  shift: "mañana",
  roomNumber: "2-A12",
  experience: 12,
  contact: {
    phoneNumber: "612345679",
    email: "maria@test.com"
  },
  status: "activo"
};

const validMedication = {
  name: "Paracetamol",
  nombreActivo: "Paracetamol",
  codigoNacional: "123456",
  formaFarmaceutica: "comprimido",
  dosis: "500mg",
  viaAdministracion: "oral",
  stockDisponible: 20,
  precio: 10,
  prescripcion: true,
  fechaCaducidad: new Date("2030-12-31"),
  contradicciones: []
};

const validRecord = {
  idDocument: "12345678Z",
  medicalLicense: "123456789",
  medicationList: [
    {
      nationalCode: "123456",
      units: 2,
      posology: "Tomar cada 8 horas"
    }
  ],
  recordType: "consulta_ambulatoria",
  reason: "Dolor fuerte",
  diagnosis: "Gripe",
  recordStatus: "abierto"
};

beforeAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  await connectDB();
});

beforeEach(async () => {
  await Record.deleteMany({});
  await Paciente.deleteMany({});
  await Staff.deleteMany({});
  await Medication.deleteMany({});

  await new Paciente(validPatient).save();
  await new Staff(validStaff).save();
  await new Medication(validMedication).save();
});

afterAll(async () => {
  await Record.deleteMany({});
  await Paciente.deleteMany({});
  await Staff.deleteMany({});
  await Medication.deleteMany({});
  await mongoose.connection.close();
});

describe("POST /records", () => {

  test("Should create a record correctly", async () => {
    const response = await request(app)
      .post("/records")
      .send(validRecord)
      .expect(201);
    expect(response.body.reason).toBe("Dolor fuerte");
    expect(response.body.amount).toBe(20);
    const record = await Record.findById(response.body._id);
    expect(record).not.toBeNull();
    const medication = await Medication.findOne({
      codigoNacional: "123456"
    });
    expect(medication?.stockDisponible).toBe(18);
  });

  test("Should fail if patient does not exist", async () => {
    await request(app)
      .post("/records")
      .send({
        ...validRecord,
        idDocument: "87654321X"
      })
      .expect(404);
  });

  test("Should fail if staff does not exist", async () => {
    await request(app)
      .post("/records")
      .send({
        ...validRecord,
        medicalLicense: "999999999"
      })
      .expect(404);
  });

  test("Should fail if staff is inactive", async () => {
    await Staff.findOneAndUpdate(
      { medicalLicenseNum: "123456789" },
      { status: "inactivo" }
    );
    await request(app)
      .post("/records")
      .send(validRecord)
      .expect(403);
  });

  test("Should fail if medication does not exist", async () => {
    await request(app)
      .post("/records")
      .send({
        ...validRecord,
        medicationList: [
          {
            nationalCode: "999999",
            units: 2,
            posology: "Tomar"
          }
        ]
      })
      .expect(404);
  });

  test("Should fail if stock is insufficient", async () => {
    await request(app)
      .post("/records")
      .send({
        ...validRecord,
        medicationList: [
          {
            nationalCode: "123456",
            units: 999,
            posology: "Tomar"
          }
        ]
      })
      .expect(409);
  });

  test("Should fail if medication is expired", async () => {
    await Medication.findOneAndUpdate(
      { codigoNacional: "123456" },
      {
        fechaCaducidad: new Date("2020-01-01")
      }
    );
    await request(app)
      .post("/records")
      .send(validRecord)
      .expect(403);
  });

  test("Should fail if idDocument is missing", async () => {
    await request(app)
      .post("/records")
      .send({
        ...validRecord,
        idDocument: undefined
      })
      .expect(400);
  });

  test("Should fail if medicalLicense is missing", async () => {
    await request(app)
      .post("/records")
      .send({
        ...validRecord,
        medicalLicense: undefined
      })
      .expect(400);
  });

  test("Should fail if medicationList is missing", async () => {
    await request(app)
      .post("/records")
      .send({
        ...validRecord,
        medicationList: undefined
      })
      .expect(400);
  });

  test("Should fail if medicationList is not an array", async () => {
    await request(app)
      .post("/records")
      .send({
        ...validRecord,
        medicationList: "invalid"
      })
      .expect(400);
  });

  test("Should fail if medicationList content is invalid", async () => {
    await request(app)
      .post("/records")
      .send({
        ...validRecord,
        medicationList: [
          {
            nationalCode: "",
            units: -1,
            posology: ""
          }
        ]
      })
      .expect(400);
  });

  test("Should fail if reason is too short", async () => {
    await request(app)
      .post("/records")
      .send({
        ...validRecord,
        reason: "Hi"
      })
      .expect(400);
  });

  test("Should fail if diagnosis is too short", async () => {
    await request(app)
      .post("/records")
      .send({
        ...validRecord,
        diagnosis: "No"
      })
      .expect(400);
  });

  test("Should fail if prescribed medication units are not integer", async () => {
    await request(app)
      .post("/records")
      .send({
        ...validRecord,
        medicationList: [
          {
            nationalCode: "123456",
            units: 2.5,
            posology: "Tomar"
          }
        ]
      })
      .expect(400);
  });

  test("Should fail if medicationList is empty", async () => {
    await request(app)
      .post("/records")
      .send({
        ...validRecord,
        medicationList: []
      })
      .expect(400);
  });

  test("Should create record with multiple medications", async () => {
    await new Medication({
      name: "Ibuprofeno",
      nombreActivo: "Ibuprofeno",
      codigoNacional: "654321",
      formaFarmaceutica: "comprimido",
      dosis: "600mg",
      viaAdministracion: "oral",
      stockDisponible: 10,
      precio: 5,
      prescripcion: true,
      fechaCaducidad: new Date("2030-12-31"),
      contradicciones: []
    }).save();
    const response = await request(app)
      .post("/records")
      .send({
        ...validRecord,
        medicationList: [
          {
            nationalCode: "123456",
            units: 2,
            posology: "Tomar"
          },
          {
            nationalCode: "654321",
            units: 3,
            posology: "Cada 12 horas"
          }
        ]
      })
      .expect(201);
    expect(response.body.amount).toBe(35);
    const med1 = await Medication.findOne({
      codigoNacional: "123456"
    });
    const med2 = await Medication.findOne({
      codigoNacional: "654321"
    });
    expect(med1?.stockDisponible).toBe(18);
    expect(med2?.stockDisponible).toBe(7);
  });

  test("Should rollback stock if creation fails", async () => {
    await request(app)
      .post("/records")
      .send({
        ...validRecord,
        medicationList: [
          {
            nationalCode: "123456",
            units: 2,
            posology: "Tomar"
          },
          {
            nationalCode: "999999",
            units: 1,
            posology: "Tomar"
          }
        ]
      })
      .expect(404);
    const medication = await Medication.findOne({
      codigoNacional: "123456"
    });
    expect(medication?.stockDisponible).toBe(20);
  });

test("Should execute rollback catch block", async () => {

  const consoleSpy = vi
    .spyOn(console, "error")
    .mockImplementation(() => {});

  const saveSpy = vi.spyOn(Medication.prototype, "save");

  saveSpy
    .mockResolvedValueOnce(undefined as any)
    .mockRejectedValueOnce(new Error("Rollback error"));

  await request(app)
    .post("/records")
    .send({
      ...validRecord,
      medicationList: [
        {
          nationalCode: "123456",
          units: 2,
          posology: "Tomar"
        },
        {
          nationalCode: "999999",
          units: 1,
          posology: "Tomar"
        }
      ]
    })
    .expect(404);

  expect(consoleSpy).toHaveBeenCalled();

  consoleSpy.mockRestore();
});

  test("Unknown non-error should return 500", async () => {
    vi.spyOn(Record.prototype, "save")
      .mockImplementationOnce(() => {
        throw "random string error";
      });
    await request(app)
      .post("/records")
      .send(validRecord)
      .expect(500);
  });
});

describe("GET /records", () => {

  test("Should get records by patient idDocument", async () => {
    const patient = await Paciente.findOne({
      IdNumber: "12345678Z",
    });
    await Record.create({
      patient: patient!._id,
      responsibleStaff: new mongoose.Types.ObjectId(),
      recordType: "consulta_ambulatoria",
      reason: "Dolor",
      diagnosis: "Gripe",
      prescribedMedications: [
        {
          medication: new mongoose.Types.ObjectId(),
          units: 1,
          posology: "Cada 8 horas",
        },
      ],
      amount: 10,
      recordStatus: "abierto",
    });
    const response = await request(app)
      .get("/records?idDocument=12345678Z")
      .expect(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0]).toMatchObject({
      reason: "Dolor",
      diagnosis: "Gripe",
      amount: 10,
      recordStatus: "abierto",
    });
  });

  test("Should return 404 if patient has no records", async () => {
    await request(app)
      .get("/records?idDocument=12345678Z")
      .expect(404);
  });

  test("Should get records by date range", async () => {
    const patient = await Paciente.findOne({
      IdNumber: "12345678Z",
    });
    await Record.create({
      patient: patient!._id,
      responsibleStaff: new mongoose.Types.ObjectId(),
      recordType: "consulta_ambulatoria",
      admissionDateTime: new Date("2024-01-10"),
      reason: "Dolor",
      diagnosis: "Gripe",
      prescribedMedications: [
        {
          medication: new mongoose.Types.ObjectId(),
          units: 1,
          posology: "Cada 8 horas",
        },
      ],
      amount: 10,
      recordStatus: "abierto",
    });
    const response = await request(app)
      .get("/records?startDate=2024-01-01&endDate=2024-12-31")
      .expect(200);
    expect(response.body.length).toBe(1);
  });

  test("Should filter records by recordType", async () => {
    const patient = await Paciente.findOne({
      IdNumber: "12345678Z",
    });
    await Record.create({
      patient: patient!._id,
      responsibleStaff: new mongoose.Types.ObjectId(),
      recordType: "ingreso_hospitalario",
      admissionDateTime: new Date("2024-01-10"),
      reason: "Operacion",
      diagnosis: "Cirugia",
      prescribedMedications: [
        {
          medication: new mongoose.Types.ObjectId(),
          units: 1,
          posology: "Cada 8 horas",
        },
      ],
      amount: 20,
      recordStatus: "abierto",
    });
    const response = await request(app)
      .get("/records?startDate=2024-01-01&endDate=2024-12-31&recordType=ingreso_hospitalario")
      .expect(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].recordType)
      .toBe("ingreso_hospitalario");
  });

  test("Should return 404 if no records in date range", async () => {
    await request(app)
      .get("/records?startDate=2020-01-01&endDate=2020-12-31")
      .expect(404);
  });

  test("Should return validation error", async () => {
    await request(app)
      .get("/records?startDate=invalid-date&endDate=2024-01-01")
      .expect(400);
  });

  test("Should return validation error when missing endDate", async () => {
    await request(app)
      .get("/records?startDate=2024-01-01")
      .expect(400);
  });

  test("Should return validation error when missing startDate", async () => {
    await request(app)
      .get("/records?endDate=2024-01-01")
      .expect(400);
  });

  test("Should return 500 on unknown error", async () => {
    vi.spyOn(Record, "find")
      .mockRejectedValueOnce("random string error");
    await request(app)
      .get("/records?startDate=2024-01-01&endDate=2024-12-31")
      .expect(500);
  });

});

describe("GET /records/patient", () => {
  test("Should get all records from a patient", async () => {
    const patient = await Paciente.findOne({
      IdNumber: "12345678Z",
    });
    await Record.create({
      patient: patient!._id,
      responsibleStaff: new mongoose.Types.ObjectId(),
      recordType: "consulta_ambulatoria",
      reason: "Dolor fuerte",
      diagnosis: "Gripe",
      prescribedMedications: [
        {
          medication: new mongoose.Types.ObjectId(),
          units: 2,
          posology: "Cada 8 horas",
        },
      ],
      amount: 20,
      recordStatus: "abierto",
    });
    const response = await request(app)
      .get("/records/patient?idNumber=12345678Z")
      .expect(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(1);
    expect(response.body[0]).toMatchObject({
      reason: "Dolor fuerte",
      diagnosis: "Gripe",
      amount: 20,
      recordStatus: "abierto",
    });
  });

  test("Should return 400 if idNumber is missing", async () => {
    await request(app)
      .get("/records/patient")
      .expect(400);
  });

  test("Should return 400 if idNumber is not string", async () => {
    await request(app)
      .get("/records/patient?idNumber[]=12345678Z")
      .expect(400);
  });

  test("Should return 404 if patient has no records", async () => {
    await request(app)
      .get("/records/patient?idNumber=12345678Z")
      .expect(404);
  });

  test("Should return 500 if getPatientID throws", async () => {
    vi.spyOn(Paciente, "findOne")
      .mockRejectedValueOnce(new Error("Random error"));
    await request(app)
      .get("/records/patient?idNumber=12345678Z")
      .expect(500);
  });

  test("Should return AppError from getPatientID", async () => {
    await request(app)
      .get("/records/patient?idNumber=99999999Z")
      .expect(404);
  });

  test("Should return records ordered by admissionDateTime", async () => {
    const patient = await Paciente.findOne({
      IdNumber: "12345678Z",
    });
    await Record.create({
      patient: patient!._id,
      responsibleStaff: new mongoose.Types.ObjectId(),
      recordType: "consulta_ambulatoria",
      admissionDateTime: new Date("2024-01-10"),
      reason: "Segundo",
      diagnosis: "Gripe",
      prescribedMedications: [
        {
          medication: new mongoose.Types.ObjectId(),
          units: 1,
          posology: "Cada 8 horas",
        },
      ],
      amount: 10,
      recordStatus: "abierto",
    });
    await Record.create({
      patient: patient!._id,
      responsibleStaff: new mongoose.Types.ObjectId(),
      recordType: "consulta_ambulatoria",
      admissionDateTime: new Date("2024-01-01"),
      reason: "Primero",
      diagnosis: "Fiebre",
      prescribedMedications: [
        {
          medication: new mongoose.Types.ObjectId(),
          units: 1,
          posology: "Cada 12 horas",
        },
      ],
      amount: 5,
      recordStatus: "cerrado",
    });
    const response = await request(app)
      .get("/records/patient?idNumber=12345678Z")
      .expect(200);
    expect(response.body[0].reason).toBe("Primero");
    expect(response.body[1].reason).toBe("Segundo");
  });
});

describe("GET /records/:id", () => {
  test("Should get a record by ID", async () => {
    const patient = await Paciente.findOne({
      IdNumber: "12345678Z",
    });
    const record = await Record.create({
      patient: patient!._id,
      responsibleStaff: new mongoose.Types.ObjectId(),
      recordType: "consulta_ambulatoria",
      reason: "Dolor fuerte",
      diagnosis: "Gripe",
      prescribedMedications: [
        {
          medication: new mongoose.Types.ObjectId(),
          units: 2,
          posology: "Cada 8 horas",
        },
      ],
      amount: 20,
      recordStatus: "abierto",
    });
    const response = await request(app)
      .get(`/records/${record._id}`)
      .expect(200);
    expect(response.body).toMatchObject({
      reason: "Dolor fuerte",
      diagnosis: "Gripe",
      amount: 20,
      recordStatus: "abierto",
    });
  });

  test("Should return 400 for invalid ID", async () => {
    await request(app)
      .get("/records/invalidID")
      .expect(400);
  });

  test("Should return 404 if record does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await request(app)
      .get(`/records/${fakeId}`)
      .expect(404);
  });

  test("Should return 500 on internal error", async () => {
    vi.spyOn(Record, "findById")
      .mockRejectedValueOnce(new Error("Random error"));
    const fakeId = new mongoose.Types.ObjectId();
    await request(app)
      .get(`/records/${fakeId}`)
      .expect(500);
  });
});

describe("PATCH /records/:id", () => {
  test("Should update reason correctly", async () => {
    const patient = await Paciente.findOne({
      IdNumber: "12345678Z",
    });
    const record = await Record.create({
      patient: patient!._id,
      responsibleStaff: new mongoose.Types.ObjectId(),
      recordType: "consulta_ambulatoria",
      reason: "Dolor",
      diagnosis: "Gripe",
      prescribedMedications: [
        {
          medication: new mongoose.Types.ObjectId(),
          units: 1,
          posology: "Cada 8 horas",
        },
      ],
      amount: 10,
      recordStatus: "abierto",
    });
    const response = await request(app)
      .patch(`/records/${record._id}`)
      .send({
        reason: "Dolor intenso"
      })
      .expect(200);
    expect(response.body.reason).toBe("Dolor intenso");
  });

  test("Should return 400 for invalid ID", async () => {
    await request(app)
      .patch("/records/invalidID")
      .send({
        reason: "Nuevo"
      })
      .expect(400);
  });

  test("Should return 404 if record does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await request(app)
      .patch(`/records/${fakeId}`)
      .send({
        reason: "Nuevo"
      })
      .expect(404);
  });

  test("Should return validation error if body is empty", async () => {
    const patient = await Paciente.findOne({
      IdNumber: "12345678Z",
    });
    const record = await Record.create({
      patient: patient!._id,
      responsibleStaff: new mongoose.Types.ObjectId(),
      recordType: "consulta_ambulatoria",
      reason: "Dolor",
      diagnosis: "Gripe",
      prescribedMedications: [
        {
          medication: new mongoose.Types.ObjectId(),
          units: 1,
          posology: "Cada 8 horas",
        },
      ],
      amount: 10,
      recordStatus: "abierto",
    });
    await request(app)
      .patch(`/records/${record._id}`)
      .send({})
      .expect(400);
  });

  test("Should return validation error for invalid idDocument", async () => {
    const patient = await Paciente.findOne({
      IdNumber: "12345678Z",
    });
    const record = await Record.create({
      patient: patient!._id,
      responsibleStaff: new mongoose.Types.ObjectId(),
      recordType: "consulta_ambulatoria",
      reason: "Dolor",
      diagnosis: "Gripe",
      prescribedMedications: [
        {
          medication: new mongoose.Types.ObjectId(),
          units: 1,
          posology: "Cada 8 horas",
        },
      ],
      amount: 10,
      recordStatus: "abierto",
    });
    await request(app)
      .patch(`/records/${record._id}`)
      .send({
        idDocument: 12345
      })
      .expect(400);
  });

  test("Should return validation error for invalid medicalLicense", async () => {
    const patient = await Paciente.findOne({
      IdNumber: "12345678Z",
    });
    const record = await Record.create({
      patient: patient!._id,
      responsibleStaff: new mongoose.Types.ObjectId(),
      recordType: "consulta_ambulatoria",
      reason: "Dolor",
      diagnosis: "Gripe",
      prescribedMedications: [
        {
          medication: new mongoose.Types.ObjectId(),
          units: 1,
          posology: "Cada 8 horas",
        },
      ],
      amount: 10,
      recordStatus: "abierto",
    });
    await request(app)
      .patch(`/records/${record._id}`)
      .send({
        medicalLicense: 12345
      })
      .expect(400);
  });

  test("Should update patient correctly", async () => {
    const secondPatient = await Paciente.create({
      name: "Ana Lopez",
      dateOfBirth: "1995-10-10",
      IdNumber: "87654321X",
      socialSecurityNum: "98765432101",
      gender: "mujer",
      contact: {
        address: "Calle Nueva",
        phoneNumber: "612345679",
        email: "ana@test.com",
      },
      allergies: [],
      bloodType: "A+",
      status: "activo",
    });
    const patient = await Paciente.findOne({
      IdNumber: "12345678Z",
    });
    const record = await Record.create({
      patient: patient!._id,
      responsibleStaff: new mongoose.Types.ObjectId(),
      recordType: "consulta_ambulatoria",
      reason: "Dolor",
      diagnosis: "Gripe",
      prescribedMedications: [
        {
          medication: new mongoose.Types.ObjectId(),
          units: 1,
          posology: "Cada 8 horas",
        },
      ],
      amount: 10,
      recordStatus: "abierto",
    });
    const response = await request(app)
      .patch(`/records/${record._id}`)
      .send({
        idDocument: "87654321X"
      })
      .expect(200);
    expect(response.body.patient).toBe(secondPatient._id.toString());
  });

  test("Should update medications and amount correctly", async () => {
    const patient = await Paciente.findOne({
      IdNumber: "12345678Z",
    });
    const medication = await Medication.findOne({
      codigoNacional: "123456"
    });
    const secondMedication = await Medication.create({
      name: "Ibuprofeno",
      nombreActivo: "Ibuprofeno",
      codigoNacional: "654321",
      formaFarmaceutica: "comprimido",
      dosis: "600mg",
      viaAdministracion: "oral",
      stockDisponible: 20,
      precio: 5,
      prescripcion: true,
      fechaCaducidad: new Date("2030-12-31"),
      contradicciones: [],
    });
    const record = await Record.create({
      patient: patient!._id,
      responsibleStaff: new mongoose.Types.ObjectId(),
      recordType: "consulta_ambulatoria",
      reason: "Dolor",
      diagnosis: "Gripe",
      prescribedMedications: [
        {
          medication: medication!._id,
          units: 2,
          posology: "Cada 8 horas",
        },
      ],
      amount: 20,
      recordStatus: "abierto",
    });
    const response = await request(app)
      .patch(`/records/${record._id}`)
      .send({
        medicationList: [
          {
            nationalCode: "654321",
            units: 3,
            posology: "Cada 12 horas"
          }
        ]
      })
      .expect(200);
    expect(response.body.amount).toBe(15);
    const updatedMedication = await Medication.findById(secondMedication._id);
    expect(updatedMedication!.stockDisponible).toBe(17);
  });

  test("Should rollback medications if processMedications fails", async () => {
    const patient = await Paciente.findOne({
      IdNumber: "12345678Z",
    });
    const medication = await Medication.findOne({
      codigoNacional: "123456"
    });
    const originalStock = medication!.stockDisponible;
    const record = await Record.create({
      patient: patient!._id,
      responsibleStaff: new mongoose.Types.ObjectId(),
      recordType: "consulta_ambulatoria",
      reason: "Dolor",
      diagnosis: "Gripe",
      prescribedMedications: [
        {
          medication: medication!._id,
          units: 2,
          posology: "Cada 8 horas",
        },
      ],
      amount: 20,
      recordStatus: "abierto",
    });
    await request(app)
      .patch(`/records/${record._id}`)
      .send({
        medicationList: [
          {
            nationalCode: "999999",
            units: 5,
            posology: "Cada 12 horas"
          }
        ]
      })
      .expect(404);
    const updatedMedication = await Medication.findById(medication!._id);
    expect(updatedMedication!.stockDisponible).toBe(originalStock);
  });

  test("Should update dischargeDateTime automatically when closing record", async () => {
    const patient = await Paciente.findOne({
      IdNumber: "12345678Z",
    });
    const record = await Record.create({
      patient: patient!._id,
      responsibleStaff: new mongoose.Types.ObjectId(),
      recordType: "consulta_ambulatoria",
      reason: "Dolor",
      diagnosis: "Gripe",
      prescribedMedications: [
        {
          medication: new mongoose.Types.ObjectId(),
          units: 1,
          posology: "Cada 8 horas",
        },
      ],
      amount: 10,
      recordStatus: "abierto",
    });
    const response = await request(app)
      .patch(`/records/${record._id}`)
      .send({
        recordStatus: "cerrado"
      })
      .expect(200);
    expect(response.body.dischargeDateTime).toBeDefined();
  });

  test("Should remove dischargeDateTime when reopening record", async () => {
    const patient = await Paciente.findOne({
      IdNumber: "12345678Z",
    });
    const record = await Record.create({
      patient: patient!._id,
      responsibleStaff: new mongoose.Types.ObjectId(),
      recordType: "consulta_ambulatoria",
      reason: "Dolor",
      diagnosis: "Gripe",
      prescribedMedications: [
        {
          medication: new mongoose.Types.ObjectId(),
          units: 1,
          posology: "Cada 8 horas",
        },
      ],
      amount: 10,
      recordStatus: "cerrado",
      dischargeDateTime: new Date(),
    });
    const response = await request(app)
      .patch(`/records/${record._id}`)
      .send({
        recordStatus: "abierto"
      })
      .expect(200);
    expect(response.body.dischargeDateTime).toBeUndefined();
  });

  test("Should return ValidationError from mongoose", async () => {
    const patient = await Paciente.findOne({
      IdNumber: "12345678Z",
    });
    const record = await Record.create({
      patient: patient!._id,
      responsibleStaff: new mongoose.Types.ObjectId(),
      recordType: "consulta_ambulatoria",
      reason: "Dolor",
      diagnosis: "Gripe",
      prescribedMedications: [
        {
          medication: new mongoose.Types.ObjectId(),
          units: 1,
          posology: "Cada 8 horas",
        },
      ],
      amount: 10,
      recordStatus: "abierto",
    });
    vi.spyOn(Record.prototype, "save")
      .mockRejectedValueOnce(
        new mongoose.Error.ValidationError()
      );
    await request(app)
      .patch(`/records/${record._id}`)
      .send({
        reason: "Nuevo"
      })
      .expect(400);
  });

  test("Should return 500 on unknown error", async () => {
    const patient = await Paciente.findOne({
      IdNumber: "12345678Z",
    });
    const record = await Record.create({
      patient: patient!._id,
      responsibleStaff: new mongoose.Types.ObjectId(),
      recordType: "consulta_ambulatoria",
      reason: "Dolor",
      diagnosis: "Gripe",
      prescribedMedications: [
        {
          medication: new mongoose.Types.ObjectId(),
          units: 1,
          posology: "Cada 8 horas",
        },
      ],
      amount: 10,
      recordStatus: "abierto",
    });
    vi.spyOn(Record.prototype, "save")
      .mockImplementationOnce(() => {
        throw "random string error";
      });
    await request(app)
      .patch(`/records/${record._id}`)
      .send({
        reason: "Nuevo"
      })
      .expect(500);
  });

  test("Should execute rollback2 catch block", async () => {
    const patient = await Paciente.findOne({
      IdNumber: "12345678Z",
    });
    const medication = await Medication.findOne({
      codigoNacional: "123456",
    });
    const record = await Record.create({
      patient: patient!._id,
      responsibleStaff: new mongoose.Types.ObjectId(),
      recordType: "consulta_ambulatoria",
      reason: "Dolor",
      diagnosis: "Gripe",
      prescribedMedications: [
        {
          medication: medication!._id,
          units: 2,
          posology: "Cada 8 horas",
        },
      ],
      amount: 20,
      recordStatus: "abierto",
    });
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const rollbackModule = await import(
      "../../src/utils/records/rollback/updateMedicationStock"
    );
    vi.spyOn(rollbackModule, "updateMedicationStock")
      .mockImplementationOnce(async () => {}) // rollback1
      .mockRejectedValueOnce(new Error("Rollback2 error")); // rollback2
    vi.spyOn(Record.prototype, "save")
      .mockRejectedValueOnce(new Error("Save error"));
    await request(app)
      .patch(`/records/${record._id}`)
      .send({
        medicationList: [
          {
            nationalCode: "123456",
            units: 1,
            posology: "Nueva",
          },
        ],
      })
      .expect(500);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test("Should set custom dischargeDateTime correctly", async () => {
    const patient = await Paciente.findOne({
      IdNumber: "12345678Z",
    });
    const admissionDate = "2024-01-01T10:00:00.000Z";
    const dischargeDate = "2024-01-05T10:00:00.000Z";
    const record = await Record.create({
      patient: patient!._id,
      responsibleStaff: new mongoose.Types.ObjectId(),
      recordType: "consulta_ambulatoria",
      admissionDateTime: admissionDate,
      reason: "Dolor",
      diagnosis: "Gripe",
      prescribedMedications: [
        {
          medication: new mongoose.Types.ObjectId(),
          units: 1,
          posology: "Cada 8 horas",
        },
      ],
      amount: 10,
      recordStatus: "abierto",
    });
    const response = await request(app)
      .patch(`/records/${record._id}`)
      .send({
        admissionDateTime: admissionDate,
        dischargeDateTime: dischargeDate,
        recordStatus: "cerrado",
      })
      .expect(200);
    expect(response.body.recordStatus).toBe("cerrado");
    expect(response.body.dischargeDateTime)
      .toBe(dischargeDate);
  });

  test("Should execute rollback1 catch block", async () => {
    const patient = await Paciente.findOne({
      IdNumber: "12345678Z",
    });
    const medication = await Medication.findOne({
      codigoNacional: "123456",
    });
    const record = await Record.create({
      patient: patient!._id,
      responsibleStaff: new mongoose.Types.ObjectId(),
      recordType: "consulta_ambulatoria",
      reason: "Dolor",
      diagnosis: "Gripe",
      prescribedMedications: [
        {
          medication: medication!._id,
          units: 2,
          posology: "Cada 8 horas",
        },
      ],
      amount: 20,
      recordStatus: "abierto",
    });
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const rollbackModule = await import(
      "../../src/utils/records/rollback/updateMedicationStock"
    );
    vi.spyOn(rollbackModule, "updateMedicationStock")
      .mockResolvedValueOnce()
      .mockRejectedValueOnce(new Error("Rollback1 error"));
    await request(app)
      .patch(`/records/${record._id}`)
      .send({
        medicationList: [
          {
            nationalCode: "999999",
            units: 5,
            posology: "Nueva",
          },
        ],
      })
      .expect(404);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

describe("DELETE /records/:id", () => {
  test("Should delete a record correctly", async () => {
    const patient = await Paciente.findOne({
      IdNumber: "12345678Z",
    });
    const staff = await Staff.findOne({
      medicalLicenseNum: "123456789",
    });
    const medication = await Medication.findOne({
      codigoNacional: "123456",
    });
    const record = await Record.create({
      patient: patient!._id,
      responsibleStaff: staff!._id,
      recordType: "consulta_ambulatoria",
      reason: "Delete test",
      diagnosis: "Delete test",
      prescribedMedications: [
        {
          medication: medication!._id,
          units: 2,
          posology: "Cada 8 horas",
        },
      ],
      amount: 20,
      recordStatus: "abierto",
    });
    await request(app)
      .delete(`/records/${record._id}`)
      .expect(200);
    const deleted = await Record.findById(record._id);
    expect(deleted).toBeNull();
  });

  test("Should restore medication stock when deleting record", async () => {
    const patient = await Paciente.findOne({
      IdNumber: "12345678Z",
    });
    const staff = await Staff.findOne({
      medicalLicenseNum: "123456789",
    });
    const medication = await Medication.findOne({
      codigoNacional: "123456",
    });
    const initialStock = medication!.stockDisponible;
    const record = await Record.create({
      patient: patient!._id,
      responsibleStaff: staff!._id,
      recordType: "consulta_ambulatoria",
      reason: "Restore stock",
      diagnosis: "Restore stock",
      prescribedMedications: [
        {
          medication: medication!._id,
          units: 2,
          posology: "Cada 8 horas",
        },
      ],
      amount: 20,
      recordStatus: "abierto",
    });
    await request(app)
      .delete(`/records/${record._id}`)
      .expect(200);
    const updatedMedication = await Medication.findById(
      medication!._id,
    );
    expect(updatedMedication!.stockDisponible)
      .toBe(initialStock + 2);
  });

  test("Should execute rollback catch block", async () => {
    const patient = await Paciente.findOne({
      IdNumber: "12345678Z",
    });
    const staff = await Staff.findOne({
      medicalLicenseNum: "123456789",
    });
    const medication = await Medication.findOne({
      codigoNacional: "123456",
    });
    const record = await Record.create({
      patient: patient!._id,
      responsibleStaff: staff!._id,
      recordType: "consulta_ambulatoria",
      reason: "Rollback",
      diagnosis: "Rollback",
      prescribedMedications: [
        {
          medication: medication!._id,
          units: 2,
          posology: "Cada 8 horas",
        },
      ],
      amount: 20,
      recordStatus: "abierto",
    });
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const rollbackModule = await import(
      "../../src/utils/records/rollback/updateMedicationStock"
    );
    vi.spyOn(rollbackModule, "updateMedicationStock")
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("Rollback error"));
    vi.spyOn(Record.prototype, "deleteOne")
      .mockRejectedValueOnce(new Error("Delete error"));
    await request(app)
      .delete(`/records/${record._id}`)
      .expect(500);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test("Should return 400 for invalid ID", async () => {
    await request(app)
      .delete("/records/invalidID")
      .expect(400);
  });

  test("Should return 404 if record does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await request(app)
      .delete(`/records/${fakeId}`)
      .expect(404);
  });
});