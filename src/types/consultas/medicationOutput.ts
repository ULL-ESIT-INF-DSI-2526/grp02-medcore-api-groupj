import { Types } from "mongoose";

export type MedicationOutput = {
  ID: Types.ObjectId;
  amount: number;
  posology: string
}