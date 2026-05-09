import { recordDocument } from "../../../models/records.js";
import { ValidationErrors } from "../error/validationErrors.js";

export function validatePatchDates( record: recordDocument,
                                    admissionDateTime: unknown,
                                    dischargeDateTime: unknown,
                                    recordStatus: unknown): void {
  const errors: string[] = [];
  let newAdmission: Date | undefined;
  let newDischarge: Date | undefined;
  if (admissionDateTime !== undefined) {
    if (typeof admissionDateTime !== "string")  errors.push("El formato de la fecha de admisión no es válido");
    else {
      newAdmission = new Date(admissionDateTime);
      if (isNaN(newAdmission.getTime())) errors.push("La fecha de admisión no es válida");
    }
  }
  if (dischargeDateTime !== undefined) {
    if (typeof dischargeDateTime !== "string") errors.push("El formato de la fecha de alta no es válido");
    else {
      newDischarge = new Date(dischargeDateTime);
      if (isNaN(newDischarge.getTime())) errors.push("La fecha de alta no es válida");
    }
  }
  const finalAdmission = newAdmission || record.admissionDateTime;
  let finalDischarge = newDischarge || record.dischargeDateTime;
  const finalStatus = recordStatus || record.recordStatus;
  if (recordStatus !== undefined) {
    if (recordStatus !== "abierto" && recordStatus !== "cerrado") {
      errors.push("El estado del registro no es válido");
    }
  }
  if (finalStatus === "abierto") {
    if (dischargeDateTime !== undefined && recordStatus === undefined) {
      errors.push("Un registro abierto no puede tener fecha de alta");
    }
    if (recordStatus === "abierto") {
      finalDischarge = undefined;
    }
  }
  if (finalStatus === "cerrado") {
    if (!finalDischarge) {
      finalDischarge = new Date();
    }
    if (finalDischarge.getTime() > Date.now()) {
      errors.push("La fecha de alta no puede estar en el futuro");
    }
    if (finalAdmission.getTime() === finalDischarge.getTime()) {
      errors.push("La fecha de admisión y alta no pueden ser iguales");
    }
    if (finalAdmission.getTime() > finalDischarge.getTime()) {
      errors.push("La fecha de alta no puede ser anterior a la fecha de admisión");
    }
  }
  if (errors.length > 0) {
    throw new ValidationErrors(errors);
  }
}