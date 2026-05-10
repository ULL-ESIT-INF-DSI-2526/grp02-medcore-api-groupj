import { Types } from "mongoose";

/**
 * Representa un medicamento ya asociado a un registro clínico.
 */
export type PrescribedMedication = {
  medication: Types.ObjectId;
  units: number;
  posology: string;
}