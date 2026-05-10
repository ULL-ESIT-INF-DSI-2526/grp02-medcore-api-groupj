import { RollbackMedication } from "../../../types/consultas/rollbackMedication.js";
import { Medication } from "../../../models/medications.js";

/**
 * Actualiza el stock de una lista de medicamentos.
 * 
 * Dependiendo de la operación indicada:
 * - `1`: incrementa el stock.
 * - `-1`: decrementa el stock.
 * 
 * Esta función se utiliza principalmente en operaciones
 * de rollback y restauración de stock.
 * 
 * @param medications Lista de medicamentos afectados.
 * @param operation Tipo de operación sobre el stock.
 * 
 * @returns Promesa que se resuelve cuando todos los medicamentos
 * han sido procesados.
 */
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