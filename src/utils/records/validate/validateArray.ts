export function validateArray (medicationList: unknown, errors: string[]): void {
  if (!medicationList) errors.push("Se requiere la lista de medicamentos con la cantidad correspondiente");
  else if (!Array.isArray(medicationList)) errors.push("El formato de la lista de médicamentos no es válido");
  else {
    const isValid = medicationList.every((medication) => {
      return (
        typeof medication === "object" &&
        medication !== null &&
        typeof medication.nacionalCode === "string" &&
        medication.nacionalCode.trim().length > 0 &&
        typeof medication.units === "number" &&
        Number.isInteger(medication.units) &&
        typeof medication.posology === "string" &&
        medication.posology.trim().length > 0
      );
    })
    if (!isValid) errors.push("El contenido de la lista de médicamentos no es correcto");
  }
}