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
import { Paciente } from "../src/models/paciente";
import { Medication } from "../src/models/medications";
import { Staff } from "../src/models/staff";
import { Record } from "../src/models/records";

const validMedication = {
  name: "clemamina",
  nombreActivo: "arecolina",
  codigoNacional: "654321",
  formaFarmaceutica: "capsula",
  dosis: "50mg",
  viaAdministracion: "oral",
  stockDisponible: 3,
  precio: 20,
  prescripcion: true,
  fechaCaducidad: "2030-11-20",
  contradicciones: [],
};

const primerPaciente = {
  name: "Pedro Gonzalez",
  dateOfBirth: "1999-11-20",
  IdNumber: "91827364",
  socialSecurityNum: "28987654321",
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

const validStaff = {
  name: "Juan Perez",
  medicalLicenseNum: "918273645",
  medicalSpecialty: "cardiologia",
  professionalCategory: "medico_adjunto",
  shift: "mañana",
  roomNumber: "2-A12",
  experience: 10,
  contact: {
    phoneNumber: "612345678",
    email: "juan@test.com",
  },
  status: "activo",
};

beforeAll(async () => {
  await connectDB();
  await new Promise(resolve => setTimeout(resolve, 600))
});

beforeEach(async () => {
  vi.clearAllMocks();
  await Paciente.deleteMany();
  await Medication.deleteMany();
  await Staff.deleteMany();
  await Record.deleteMany();
});

describe("POST", () => {
  test("Crear un nuevo record exitosamente", async () => {
    const pacient = await new Paciente(primerPaciente).save();
    const staff = await new Staff(validStaff).save();
    const medication = await new Medication(validMedication).save();
    const validRecord = {
      idDocument: pacient.IdNumber,
      medicalLicense: staff.medicalLicenseNum,
      recordType: "ingreso_hospitalario",
      admissionDateTime: new Date(),
      reason: "strong headaches",
      diagnosis: "migraine",
      medicationList: [
        {
          nationalCode: medication.codigoNacional,
          units: 2,
          posology: "50 mg",
        },
      ],
    };
    const response = await request(app).post("/records").send(validRecord);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.reason).toBe("strong headaches");
    expect(response.body.diagnosis).toBe("migraine");
  });
});

describe("GET", () => {
  test("GET /records/patient", async () => {
    const pacient = await new Paciente(primerPaciente).save();
    const staff = await new Staff(validStaff).save();
    const medication = await new Medication(validMedication).save();
    const validRecord = {
      idDocument: pacient.IdNumber,
      medicalLicense: staff.medicalLicenseNum,
      recordType: "ingreso_hospitalario",
      admissionDateTime: new Date(),
      reason: "strong headaches",
      diagnosis: "migraine",
      medicationList: [
        {
          nationalCode: medication.codigoNacional,
          units: 2,
          posology: "50 mg",
        },
      ],
    };

    // Crear el record primero
    await request(app).post("/records").send(validRecord);

    // Luego hacer el GET
    const response = await request(app)
      .get(`/records/patient?idNumber=${pacient.IdNumber}`)
      .expect(200);
    
    expect(response.body).toHaveLength(1);
    expect(response.body[0].reason).toBe("strong headaches");
  });
});
