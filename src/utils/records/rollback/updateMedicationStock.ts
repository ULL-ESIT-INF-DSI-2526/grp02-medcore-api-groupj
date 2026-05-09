import { RollbackMedication } from "../../../types/consultas/rollbackMedication.js";
import { Medication } from "../../../models/medications.js";

export async function updateMedicationStock(medications: RollbackMedication[],
                                            operation: 1 | -1): Promise<void> {
  for (const item of medications) {
    const medication = await Medication.findById(item.medication);
    if (!medication) {
      console.error(`No se encontró el medicamento con id ${item.medication}`);
      continue;
    }
    medication.stockDisponible += item.units * operation;
    await medication.save();
  }
}