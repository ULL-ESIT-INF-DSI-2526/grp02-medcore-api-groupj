import { Types } from "mongoose";
import { NotFoundError } from "../error/notFoundError.js";
import { Paciente } from "../../../models/paciente.js";

export async function getPatientID(identifier: string): Promise<Types.ObjectId> {
  const value: string = identifier.trim();
  const patient = await Paciente.findOne({
    $or: [
      {IdNumber: value},
      {socialSecurityNum: value}
    ]
  })
  if (!patient) throw new NotFoundError("No se encontró a ningun paciente");
  return patient._id;
}