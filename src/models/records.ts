import { Document, Schema, model } from "mongoose";
import { Types } from "mongoose";
import validator from "validator";
import { RecordType, RECORD_TYPE } from "../types/consultas/recordType.js";
import { PrescribedMedication } from "../types/consultas/prescribedMedication.js";
import { RecordStatus, RECORD_STATUS } from "../types/consultas/recordStatus.js";

/**
 * Representa un documento de historial clínico almacenado en MongoDB.
 */
export interface recordDocument extends Document {
  patient: Types.ObjectId;
  responsibleStaff: Types.ObjectId;
  recordType: RecordType;
  admissionDateTime: Date;
  dischargeDateTime?: Date;
  reason: string;
  diagnosis: string;
  prescribedMedications: PrescribedMedication[];
  amount: number;
  recordStatus: RecordStatus;
}

/**
 * Esquema de Mongoose para registros clínicos.
 */
const recordSchema = new Schema<recordDocument>({
  patient: {
    type: Schema.Types.ObjectId,
    ref: "Paciente",
    required: true
  },
  responsibleStaff: {
    type: Schema.Types.ObjectId,
    ref: "Staff",
    required: true
  },
  recordType: {
    type: String,
    enum: RECORD_TYPE,
    required: true
  },
  admissionDateTime: {
    type: Date,
    default: Date.now,
  },
  dischargeDateTime: {
    type: Date
  },
  reason: {
    type: String,
    required: true,
    trim: true,
    minLength: 3
  },
  diagnosis: {
    type: String,
    required: true,
    trim: true,
    minLength: 3
  },
  prescribedMedications: {
    type: [
      {
        medication: {
          type: Schema.Types.ObjectId,
          ref: "Medication",
          required: true
        },
        units: {
          type: Number,
          required: true,
          min: 1,
          validate(value: number) {
            if (!Number.isInteger(value)) {
              throw new Error("Las unidades deben ser un número entero");
            }
          }
        },
        posology: {
          type: String,
          required: true,
          trim: true,
          minLength: 3
        }
      }
    ],
    validate(value: PrescribedMedication[]) {
      if (value.length === 0) {
        throw new Error("Debe haber al menos un medicamento");
      }
    }
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  recordStatus: {
    type: String,
    enum: RECORD_STATUS,
    default: "abierto"
  }
});

/**
 * Modelo de Mongoose para la colección de registros clínicos.
 */
export const Record = model<recordDocument>(
  "Record",
  recordSchema,
  "records",
);