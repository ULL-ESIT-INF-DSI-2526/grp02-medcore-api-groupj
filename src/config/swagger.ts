import swaggerJSDoc, { Options } from "swagger-jsdoc";

const options: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MedCore API",
      version: "1.0.0",
      description: "API REST para gestión hospitalaria",
    },
    servers: [
      {
        url: process.env.API_URL || "http://localhost:3000",
        description: process.env.API_URL
          ? "Servidor producción"
          : "Servidor local",
      },
    ],
    components: {
      schemas: {
        Patient: {
          type: "object",
          required: [
            "name",
            "dateOfBirth",
            "IdNumber",
            "socialSecurityNum",
            "gender",
            "contact",
            "bloodType",
            "status",
          ],
          properties: {
            _id: {
              type: "string",
              example: "684a1234abcd5678ef901234",
            },
            name: {
              type: "string",
              example: "Juan Pérez",
            },
            dateOfBirth: {
              type: "string",
              format: "date",
              example: "2000-05-12",
            },
            IdNumber: {
              type: "string",
              example: "12345678Z",
            },
            socialSecurityNum: {
              type: "string",
              example: "12345678901",
            },
            gender: {
              type: "string",
              enum: ["hombre", "mujer", "otro"],
            },
            contact: {
              type: "object",
              required: ["address", "phoneNumber", "email"],
              properties: {
                address: {
                  type: "string",
                  example: "Calle Mayor 12",
                },
                phoneNumber: {
                  type: "string",
                  example: "612345678",
                },
                email: {
                  type: "string",
                  example: "juan@example.com",
                },
              },
            },
            allergies: {
              type: "array",
              items: {
                type: "string",
              },
              example: ["penicilina"],
            },
            bloodType: {
              type: "string",
              enum: [
                "A+",
                "A-",
                "B+",
                "B-",
                "AB+",
                "AB-",
                "O+",
                "O-",
              ],
            },
            status: {
              type: "string",
              enum: [
                "activo",
                "baja temporal",
                "fallecido",
              ],
            },
            age: {
              type: "number",
              example: 24,
            },
          },
        },
        Staff: {
          type: "object",
          required: [
            "name",
            "medicalLicenseNum",
            "medicalSpecialty",
            "professionalCategory",
            "shift",
            "roomNumber",
            "experience",
            "contact",
            "status",
          ],
          properties: {
            _id: {
              type: "string",
              example: "684a1234abcd5678ef901235",
            },
            name: {
              type: "string",
              example: "María Rodríguez",
            },
            medicalLicenseNum: {
              type: "string",
              example: "123456789",
            },
            medicalSpecialty: {
              type: "string",
              enum: [
                "medicina_general",
                "medicina_interna",
                "cardiologia",
                "dermatologia",
                "endocrinologia",
                "gastroenterologia",
                "hematologia",
                "nefrologia",
                "neumologia",
                "neurologia",
                "oncologia",
                "pediatria",
                "psiquiatria",
                "reumatologia",
                "traumatologia",
                "urologia",
                "ginecologia",
                "oftalmologia",
                "otorrinolaringologia",
                "radiologia",
                "anestesiologia",
                "urgencias",
                "medicina_familiar",
                "geriatria",
                "cirugia_general",
                "medicina_intensiva",
              ],
            },
            professionalCategory: {
              type: "string",
              enum: [
                "medico_adjunto",
                "medico_residente",
                "enfermero",
                "auxiliar_enfermeria",
                "jefe_servicio",
              ],
            },
            shift: {
              type: "string",
              enum: [
                "mañana",
                "tarde",
                "noche",
                "rotatorio",
              ],
            },
            roomNumber: {
              type: "string",
              example: "2-A12",
            },
            experience: {
              type: "number",
              example: 12,
            },
            contact: {
              type: "object",
              required: ["phoneNumber", "email"],
              properties: {
                phoneNumber: {
                  type: "string",
                  example: "612345678",
                },
                email: {
                  type: "string",
                  example: "maria@hospital.com",
                },
              },
            },
            status: {
              type: "string",
              enum: [
                "activo",
                "inactivo",
              ],
            },
          },
        },
        Medication: {
          type: "object",
          required: [
            "name",
            "nombreActivo",
            "codigoNacional",
            "formaFarmaceutica",
            "dosis",
            "viaAdministracion",
            "stockDisponible",
            "precio",
            "prescripcion",
            "fechaCaducidad",
          ],
          properties: {
            _id: {
              type: "string",
              example: "684a1234abcd5678ef901236",
            },
            name: {
              type: "string",
              example: "Paracetamol",
            },
            nombreActivo: {
              type: "string",
              example: "Paracetamol",
            },
            codigoNacional: {
              type: "string",
              example: "123456",
            },
            formaFarmaceutica: {
              type: "string",
              enum: [
                "comprimido",
                "capsula",
                "solucion oral",
                "solucion inyectable",
                "pomada",
                "parche transdermico",
                "inhalador",
                "otro",
              ],
            },
            dosis: {
              type: "string",
              example: "500mg",
            },
            viaAdministracion: {
              type: "string",
              enum: [
                "oral",
                "intravenosa",
                "intramuscular",
                "subcutanea",
                "topica",
                "inhalatoria",
              ],
            },
            stockDisponible: {
              type: "number",
              example: 120,
            },
            precio: {
              type: "number",
              example: 15,
            },
            prescripcion: {
              type: "boolean",
              example: true,
            },
            fechaCaducidad: {
              type: "string",
              format: "date",
              example: "2027-12-31",
            },
            contradicciones: {
              type: "array",
              items: {
                type: "string",
              },
              example: ["embarazo", "hipertension"],
            },
          },
        },
        MedicationInput: {
          type: "object",
          required: [
            "nationalCode",
            "units",
            "posology",
          ],
          properties: {
            nationalCode: {
              type: "string",
              example: "123456",
            },
            units: {
              type: "number",
              example: 2,
            },
            posology: {
              type: "string",
              example: "Tomar una cápsula cada 8 horas",
            },
          },
        },
        PrescribedMedication: {
          type: "object",
          properties: {
            medication: {
              type: "string",
              example: "684a1234abcd5678ef901236",
            },
            units: {
              type: "number",
              example: 2,
            },
            posology: {
              type: "string",
              example: "Tomar una cápsula cada 8 horas",
            },
          },
        },
        RecordInput: {
          type: "object",
          required: [
            "idDocument",
            "medicalLicense",
            "medicationList",
            "recordType",
            "reason",
            "diagnosis",
          ],
          properties: {
            idDocument: {
              type: "string",
              example: "12345678Z",
            },
            medicalLicense: {
              type: "string",
              example: "123456789",
            },
            medicationList: {
              type: "array",
              items: {
                $ref: "#/components/schemas/MedicationInput",
              },
            },
            recordType: {
              type: "string",
              enum: [
                "consulta_ambulatoria",
                "ingreso_hospitalario",
              ],
            },
            admissionDateTime: {
              type: "string",
              format: "date-time",
              example: "2026-05-10T12:00:00.000Z",
            },
            dischargeDateTime: {
              type: "string",
              format: "date-time",
              example: "2026-05-15T10:00:00.000Z",
            },
            reason: {
              type: "string",
              example: "Dolor torácico",
            },
            diagnosis: {
              type: "string",
              example: "Angina de pecho",
            },
            recordStatus: {
              type: "string",
              enum: [
                "abierto",
                "cerrado",
              ],
            },
          },
        },
        Record: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "684a1234abcd5678ef901299",
            },
            patient: {
              type: "string",
              example: "684a1234abcd5678ef901200",
            },
            responsibleStaff: {
              type: "string",
              example: "684a1234abcd5678ef901201",
            },
            recordType: {
              type: "string",
              enum: [
                "consulta_ambulatoria",
                "ingreso_hospitalario",
              ],
            },
            admissionDateTime: {
              type: "string",
              format: "date-time",
            },
            dischargeDateTime: {
              type: "string",
              format: "date-time",
            },
            reason: {
              type: "string",
            },
            diagnosis: {
              type: "string",
            },
            prescribedMedications: {
              type: "array",
              items: {
                $ref: "#/components/schemas/PrescribedMedication",
              },
            },
            amount: {
              type: "number",
              example: 120,
            },
            recordStatus: {
              type: "string",
              enum: [
                "abierto",
                "cerrado",
              ],
            },
          },
        },
      },
    },
  },
  apis: [
    "./src/routers/*.ts",
    "./dist/routers/*.js",
  ],
};

export const swaggerSpec = swaggerJSDoc(options);