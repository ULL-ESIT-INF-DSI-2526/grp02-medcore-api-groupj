import { ValidationErrors } from "../error/validationErrors.js";

/**
 * Valida las fechas y el estado de un registro clínico
 * durante la creación de un nuevo registro.
 * 
 * Comprueba:
 * - Formato válido de fechas.
 * - Coherencia entre fechas de admisión y alta.
 * - Compatibilidad entre estado y fecha de alta.
 * - Que la fecha de alta no esté en el futuro.
 * 
 * @param admissionDateTime Fecha de admisión.
 * @param dischargeDateTime Fecha de alta.
 * @param recordStatus Estado del registro clínico.
 * 
 * @throws ValidationErrors Si alguna validación falla.
 */
export function validateDates( admissionDateTime: unknown, dischargeDateTime: unknown, recordStatus: unknown ): void {
  const errors: string[] = [];
  let admission: Date | undefined;
  if (admissionDateTime !== undefined && typeof admissionDateTime === "string") {
    admission = new Date(admissionDateTime as string);
    if (isNaN(admission.getTime())) errors.push("La fecha de admisión no es válida");
  }
  else if (admissionDateTime !== undefined) {
    errors.push("El formato de la fecha de admisión no es válido");
  }
  let discharge: Date | undefined;
  if (dischargeDateTime !== undefined && typeof dischargeDateTime === "string") {
    discharge = new Date(dischargeDateTime as string);
    if (isNaN(discharge.getTime())) errors.push("La fecha de alta no es válida");
  }
  else if (dischargeDateTime !== undefined) {
    errors.push("El formato de la fecha de alta no es válido");
  }
  if (admissionDateTime === undefined && dischargeDateTime !== undefined) {
    errors.push( "No se puede indicar una fecha de alta sin una fecha de admisión");
  }
  if (recordStatus === "abierto" && dischargeDateTime !== undefined ) {
    errors.push( "Un registro abierto no puede tener fecha de alta" );
  }
  if (admission && discharge && admission.getTime() === discharge.getTime()) {
    errors.push( "La fecha de admisión y alta no pueden ser iguales");
  }
  if (admission && discharge && discharge.getTime() < admission.getTime()) {
    errors.push( "La fecha de alta no puede ser anterior a la fecha de admisión");
  }
  if (recordStatus === "cerrado" && dischargeDateTime === undefined) {
    errors.push( "Un registro cerrado debe tener fecha de alta");
  }
  if (discharge && discharge.getTime() > Date.now()) {
    errors.push("La fecha de alta no puede estar en el futuro");
  }
  if (errors.length > 0) {
    throw new ValidationErrors(errors);
  }
}