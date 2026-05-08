import { RollbackMedication } from "../../../types/consultas/rollbackMedication.js";
import { Medication } from "../../../models/medications.js";
import { NotFoundError } from "../error/notFoundError.js";

export async function rollbackMedicationStock( rollback: RollbackMedication[]): Promise<void> {
  for (const item of rollback) {
    const medication = await Medication.findById(item.medication);
    if (!medication) {
      console.error(`No se encontró el medicamento con id ${item.medication}`);
      continue;
    }
    medication.stockDisponible += item.units;
    await medication.save();
  }
}