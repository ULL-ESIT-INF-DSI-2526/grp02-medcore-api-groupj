import { Types } from "mongoose";

export type RollbackMedication = {
  medication: Types.ObjectId;
  units: number;
}