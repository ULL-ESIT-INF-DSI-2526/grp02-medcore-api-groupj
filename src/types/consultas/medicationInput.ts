/**
 * Representa un medicamento recibido desde una petición HTTP
 * antes de ser procesado y almacenado en un registro clínico.
 */
export type MedicationInput = {
  nationalCode: string;
  units: number;
  posology: string;
}