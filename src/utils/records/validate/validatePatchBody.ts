import { ValidationErrors } from "../error/validationErrors.js";

export function validatePatchBody(body: any): void {
  const {
    idDocument,
    medicalLicense,
    medicationList,
    recordType,
    admissionDateTime,
    dischargeDateTime,
    reason,
    diagnosis,
    recordStatus,
  } = body;

  if (
    idDocument === undefined &&
    medicalLicense === undefined &&
    medicationList === undefined &&
    recordType === undefined &&
    admissionDateTime === undefined &&
    dischargeDateTime === undefined &&
    reason === undefined &&
    diagnosis === undefined &&
    recordStatus === undefined
  ) {
    throw new ValidationErrors(["No se enviaron campos para modificar"]);
  }
}