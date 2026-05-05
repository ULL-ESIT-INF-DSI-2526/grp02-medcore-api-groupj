import { Document, Schema, model } from "mongoose";
import validator from "validator";
import { MedicalSpecialty, MEDICAL_SPECIALTIES } from "../types/staff/specialty.js";
import { ProfessionalCategory, PROFESSIONAL_CATEGORIES } from "../types/staff/profCategories.js";
import { StaffStatus, STAFF_STATUS } from "../types/staff/status.js";
import { Shift, SHIFTS } from "../types/staff/shift.js";

export interface StaffDocument extends Document {
  name: string;
  medicalLicenseNum: string;
  medicalSpecialty: MedicalSpecialty;
  professionalCategory: ProfessionalCategory;
  shift: Shift;
  roomNumber: string;
  experience: number;
  contact: {
    phoneNumber: string;
    email: string;
  };
  status: StaffStatus;
}

const staffSchema = new Schema<StaffDocument>({
  name: {
    type: String,
    required: true,
    trim: true,
    minLength: 2,
    maxLength: 100,
    validate(value: string) {
      if (!validator.default.isAlpha(value, "es-ES", { ignore: " '-" })) {
        throw new Error("El nombre solo puede tener letras");
      }
    },
  },
  medicalLicenseNum: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate(value: string) {
      if (!/^\d{9}$/.test(value)) {
        throw new Error("El número de colegiado debe tener exactamente 9 dígitos (XXYYZZZZZ)");
      }
    }
  },
  medicalSpecialty: {
    type: String,
    enum: MEDICAL_SPECIALTIES,
    lowercase: true,
    required: true
  },
  professionalCategory: {
    type: String,
    enum: PROFESSIONAL_CATEGORIES,
    lowercase: true,
    required: true
  },
  shift: {
    type: String,
    enum: SHIFTS,
    required: true
  },
  roomNumber: {
    type: String,
    required: true,
    trim: true,
    validate(value: string) {
      if (!/^\d+-[A-Z]\d+$/.test(value)) {
        throw new Error("Formato inválido. Debe ser tipo 2-A12 (planta, ala, número)");
      }
    }
  },
  experience: {
    type: Number,
    required: true,
    min: 0,
    max: 50,
    validate(value: number) {
      if (!Number.isInteger(value)) {
        throw new Error("La experiencia debe ser un número entero");
      }
    }
  },
  contact: {
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      minLength: 9,
      validate(value: string) {
        if (!validator.default.isMobilePhone(value, "es-ES")) {
          throw new Error("El numero de telefono no es valido");
        }
      },
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate(value: string) {
        if (!validator.default.isEmail(value)) {
          throw new Error("Email no es valido");
        }
      }
    }
  },
  status: {
    type: String,
    enum: STAFF_STATUS,
    lowercase: true,
    required: true
  },
});

export const Staff = model<StaffDocument>(
  "Staff",
  staffSchema,
  "staff"
);