import { ValidationErrors } from "../error/validationErrors.js";

/**
 * Valida que una petición PATCH contenga
 * al menos un campo modificable.
 * 
 * @param body Cuerpo de la petición PATCH.
 * 
 * @throws ValidationErrors Si no se envía ningún campo.
 */
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