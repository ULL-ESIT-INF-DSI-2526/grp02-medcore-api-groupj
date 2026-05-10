import { Types } from "mongoose";
import { NotFoundError } from "../error/notFoundError.js";
import { Patient } from "../../../models/patient.js";

export async function getPatientID(identifier: string): Promise<Types.ObjectId> {
  const value: string = identifier.trim();
  const patient = await Patient.findOne({
    $or: [
      {IdNumber: value},
      {socialSecurityNum: value}
    ]
  })
  if (!patient) throw new NotFoundError("No se encontró a ningun paciente");
  return patient._id;
}