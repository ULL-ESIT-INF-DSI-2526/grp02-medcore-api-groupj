import { ValidationErrors } from "../error/validationErrors.js";
import { RECORD_TYPE } from "../../../types/consultas/recordType.js";

export function validateGetData(idDocument: unknown,
                                startDate: unknown,
                                endDate: unknown,
                                recordType: unknown): void {
  const errors: string[] = [];
  if (!idDocument && !startDate && !endDate) {
    errors.push("Se debe pasar un documento de identidad o un rango de fechas");
  }
  if (idDocument && (startDate || endDate || recordType)) {
    errors.push("No se puede combinar documento de identidad con filtros de fechas");
  }
  if (idDocument) {
    if (typeof idDocument !== "string")
      errors.push("El formato del documento de identidad no es válido");
    else if (idDocument.trim().length === 0)
      errors.push("El documento de identidad no puede estar vacio");
  }
  if (startDate || endDate) {
    if (!startDate || !endDate) {
      errors.push("El rango de fechas esta incompleto");
    }
    else {
      if (typeof startDate !== "string" || typeof endDate !== "string") {
        errors.push("El formato del rango de fechas no es correcto");
      }
      else {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          errors.push("El rango de fechas no es válido");
        }
        else {
          if (start.getTime() === end.getTime()) {
            errors.push("La fecha inicial y final no pueden ser iguales");
          }
          if (start.getTime() > end.getTime()) {
            errors.push("La fecha inicial no puede ser posterior a la final");
          }
        }
      }
    }
    if (recordType !== undefined) {
      if (typeof recordType !== "string") {
        errors.push("El formato del tipo de registro no es válido");
      }
      else if (recordType.trim().length === 0) {
        errors.push("El tipo de registro no puede estar vacio");
      }
      else if (!RECORD_TYPE.includes(recordType as any)) {
        errors.push("El tipo de registro no es válido");
      }
    }
  }
  if (errors.length > 0)
    throw new ValidationErrors(errors);
}