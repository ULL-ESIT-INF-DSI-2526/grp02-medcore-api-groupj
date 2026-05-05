import { Document, Schema, model } from "mongoose";
import validator from "validator";
import { Via, VIA } from "../types/medication/viaAdministracion.js";
import {
  formaFarmaceutica,
  FORMAFARMACEUTICA,
} from "../types/medication/formaFarmaceutica.js";

export interface medicationDocument extends Document {
  name: string;
  nombreActivo: string;
  codigoNacional: string;
  formaFarmaceutica: formaFarmaceutica;
  dosis: string;
  viaAdministracion: Via;
  stockDisponible: number;
  precio: number;
  prescripcion: boolean;
  fechaCaducidad: Date;
  contradicciones: string[];
}

const medicationSchema = new Schema<medicationDocument>({
  name: {
    type: String,
    required: true,
    trim: true,
    minLength: 2,
    validate(value: string) {
      if (!validator.default.isAlpha(value, "es-ES", { ignore: " '-" })) {
        throw new Error("El nombre solo puede tener letras");
      }
    },
  },
  nombreActivo: {
    type: String,
    required: true,
    trim: true,
    minLength: 2,
    validate(value: string) {
      if (!validator.default.isAlpha(value, "es-ES", { ignore: " '-" })) {
        throw new Error("El nombre solo puede tener letras");
      }
    },
  },
  codigoNacional: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minLength: 2,
    validate(value: string) {
      if (!/^\d{9}$/.test(value)) {
        throw new Error(
          "El número de colegiado debe tener exactamente 9 dígitos (XXYYZZZZZ)",
        );
      }
    },
  },
  formaFarmaceutica: {
    type: String,
    enum: FORMAFARMACEUTICA,
    lowercase: true,
    required: true,
  },
  dosis: {
    type: String,
    required: true,
    validate(value: string) {
      if (!/^\d+(?:mg|ml|gr)$/.test(value)) {
        throw new Error("Dosis invalida, formato debe ser: <numero><mg|ml|gr>");
      }
    },
  },
  viaAdministracion: {
    type: String,
    required: true,
    enum: VIA,
    lowercase: true,
  },
  stockDisponible: {
    type: Number,
    required: true,
    min: 0,
    validate(value: number) {
      if (!Number.isInteger(value)) {
        throw new Error("Stock tiene que ser un numero entero");
      }
    },
  },
  precio: {
    type: Number,
    required: true,
    min: 0,
    validate(value: number) {
      if (!Number.isInteger(value)) {
        throw new Error("Precio debe de ser en euros redondeado");
      }
    },
  },
  prescripcion: {
    type: Boolean,
    required: true,
  },
  fechaCaducidad: {
    type: Date,
    required: true,
  },
  contradicciones: {
    type: [String],
    default: [],
    minItems: 0,
  },
});

export const Medication = model<medicationDocument>(
  "Medication",
  medicationSchema,
  "medication",
);
