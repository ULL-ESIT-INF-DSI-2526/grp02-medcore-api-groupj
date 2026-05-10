import { Types } from "mongoose";
import { NotFoundError } from "../error/notFoundError.js";
import { Patient } from "../../../models/patient.js";

/**
 * Obtiene el identificador de un paciente a partir de su
 * documento de identidad o número de la seguridad social.
 * 
 * @param identifier Documento de identidad o número de seguridad social.
 * 
 * @throws {NotFoundError} Si no se encuentra ningún paciente
 * con el identificador proporcionado.
 * 
 * @returns Identificador único del paciente.
 */

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