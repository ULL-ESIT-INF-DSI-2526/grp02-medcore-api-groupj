import { Types } from "mongoose";
import { Staff } from "../../../models/staff.js";
import { NotFoundError } from "../error/notFoundError.js";
import { ForbiddenError } from "../error/forbiddenError.js";

export async function getStaffID(medicalLicense: string): Promise<Types.ObjectId> {
  const value: string = medicalLicense.trim();
  const member = await Staff.findOne({ medicalLicenseNum: value })
  if (!member) throw new NotFoundError("No se encontró a ningun miembro del personal");
  else {
    if (member.status === "inactivo") throw new ForbiddenError("El miembro del personal esta inactivo");
  }
  return member._id;
}