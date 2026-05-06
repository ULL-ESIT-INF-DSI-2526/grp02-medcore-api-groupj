import { Document, Schema, model } from "mongoose";
import validator from "validator";

export interface pacienteDocumentInterface extends Document {
  name: string;
  dateOfBirth: Date;
  IdNumber: string; // Unico
  socialSecurityNum: string; // Unico
  gender: "hombre" | "mujer" | "otro";
  contact: {
    address: string;
    phoneNumber: string;
    email: string;
  };
  allergies: string[];
  bloodType: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  status: "activo" | "baja temporal" | "fallecido";
}

const pacienteSchema = new Schema<pacienteDocumentInterface>({
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
  dateOfBirth: {
    type: Date,
    required: true,
  },
  IdNumber: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    validate(value: string) {
      if (
        !validator.default.isIdentityCard(value, "ES") &&
        !validator.default.isPassportNumber(value, "ES")
      ) {
        throw new Error("Documento no es valido");
      }
    },
  },
  socialSecurityNum: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    minLength: 11,
    validate(value: string) {
      if (!validator.default.isNumeric(value, { no_symbols: true })) {
        throw new Error(
          "El numero de seguridad social solo puede contener numeros",
        );
      }
    },
  },
  gender: {
    type: String,
    required: true,
    trim: true,
    enum: ["hombre", "mujer", "otro"],
  },
  contact: {
    address: {
      type: String,
      required: true,
      trim: true,
      minLength: 5,
    },
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
      },
    },
  },
  allergies: {
    type: [String],
    default: [],
    minItems: 0,
  },
  bloodType: {
    type: String,
    required: true,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  },
  status: {
    type: String,
    required: true,
    enum: ["activo", "baja temporal", "fallecido"],
  },
});

pacienteSchema.virtual("age").get(function (this: pacienteDocumentInterface) {
  const today = new Date();
  const birth = new Date(this.dateOfBirth);

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
});

pacienteSchema.set("toJSON", { virtuals: true });
pacienteSchema.set("toObject", { virtuals: true });

export const Paciente = model<pacienteDocumentInterface>(
  "Paciente",
  pacienteSchema,
);
