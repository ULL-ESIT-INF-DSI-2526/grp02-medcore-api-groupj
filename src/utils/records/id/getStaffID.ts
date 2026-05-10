import { Types } from "mongoose";
import { Staff } from "../../../models/staff.js";
import { NotFoundError } from "../error/notFoundError.js";
import { ForbiddenError } from "../error/forbiddenError.js";

/**
 * Obtiene el identificador de un miembro del personal sanitario
 * a partir de su número de colegiado.
 * 
 * @param medicalLicense Número de colegiado del profesional.
 * 
 * @throws {NotFoundError} Si no se encuentra ningún miembro del personal.
 * @throws {ForbiddenError} Si el miembro del personal está inactivo.
 * 
 * @returns Identificador único del miembro del personal.
 */

export async function getStaffID(medicalLicense: string): Promise<Types.ObjectId> {
  const value: string = medicalLicense.trim();
  const member = await Staff.findOne({ medicalLicenseNum: value })
  if (!member) throw new NotFoundError("No se encontró a ningun miembro del personal");
  else {
    if (member.status === "inactivo") throw new ForbiddenError("El miembro del personal esta inactivo");
  }
  return member._id;
}