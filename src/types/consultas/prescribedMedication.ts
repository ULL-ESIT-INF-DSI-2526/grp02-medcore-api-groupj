import { Types } from "mongoose";

export type PrescribedMedication = {
  medication: Types.ObjectId;
  units: number;
  posology: string
}