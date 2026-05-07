import { MedicationInput } from "../../../types/consultas/medicationInput.js";
import { Types } from "mongoose";
import { Medication } from "../../../models/medications.js";
import { ForbiddenError } from "../error/forbiddenError.js";
import { ConflictError } from "../error/conflictError.js";
import { NotFoundError } from "../error/notFoundError.js";

export async function getIDMedicationList(medicationList: MedicationInput[]): Promise<Map<string, Types.ObjectId>> {
  const medicationUnits = calculateMedicationUnits(medicationList);
  const medicationMap = new Map<string, Types.ObjectId>();
  for (const [nationalCode, totalUnits] of medicationUnits) {
    const medication = await Medication.findOne({ codigoNacional: nationalCode });
    if (!medication)
      throw new NotFoundError(`No se encontró el medicamento con código nacional ${nationalCode}` );
    checkMedication(medication, totalUnits);
    medicationMap.set( nationalCode, medication._id);
  }
  return medicationMap;
}

function calculateMedicationUnits( medicationList: MedicationInput[]): Map<string, number> {
  const medicationMap = new Map<string, number>();
  for (const medication of medicationList) {
    const currentUnits = medicationMap.get(medication.nationalCode) || 0;
    medicationMap.set( medication.nationalCode, currentUnits + medication.units
    );
  }
  return medicationMap;
}

function checkMedication( medication: any, requiredUnits: number): void {
  if (medication.stockDisponible < requiredUnits)
    throw new ConflictError(`No hay suficiente stock para el medicamento con código nacional ${medication.codigoNacional}`);
  if (medication.fechaCaducidad.getTime() < Date.now())
    throw new ForbiddenError(`El medicamento con código nacional ${medication.codigoNacional} está caducado`);
}