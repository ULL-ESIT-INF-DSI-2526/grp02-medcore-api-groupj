import { ValidationErrors } from "../error/validationErrors.js";

export function validateMainData(idDocument: unknown, 
                                  medicalLicense: unknown, 
                                  medicationList: unknown): void
{
  const errors: string[] = [];
  validateString(idDocument, errors, true);
  validateString(medicalLicense, errors, false);
  validateArray(medicationList, errors);
  if (errors.length > 0) throw new ValidationErrors(errors);
}

export function validateArray (medicationList: unknown, errors: string[]): void {
  if (!medicationList) errors.push("Se requiere la lista de medicamentos con la cantidad correspondiente");
  else if (!Array.isArray(medicationList)) errors.push("El formato de la lista de médicamentos no es válido");
  else {
    const isValid = medicationList.every((medication) => {
      return (
        typeof medication === "object" &&
        medication !== null &&
        typeof medication.nationalCode === "string" &&
        medication.nationalCode.trim().length > 0 &&
        Number.isInteger(medication.units) &&
        medication.units > 0 &&
        typeof medication.posology === "string" &&
        medication.posology.trim().length > 0
      );
    });
    if (!isValid) errors.push("El contenido de la lista de médicamentos no es correcto");
  }
}

export function validateString (data: unknown, errors: string[], option: boolean): void {
  const message: string = (option)? "identificación del paciente" : "licencia médica";
  if (!data) errors.push(`Se requiere la ${message}`);
  else if (typeof data !== "string") errors.push(`El formato de la ${message} no es válido`);
  else if(data.trim().length === 0) errors.push(`La ${message} esta vacia`);
}