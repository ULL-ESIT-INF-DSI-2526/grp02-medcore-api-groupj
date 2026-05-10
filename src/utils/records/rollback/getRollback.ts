import { PrescribedMedication } from "../../../types/consultas/prescribedMedication.js";
import { RollbackMedication } from "../../../types/consultas/rollbackMedication.js";

/**
 * Genera una lista de operaciones rollback a partir
 * de medicamentos prescritos en un registro clínico.
 * 
 * Esta función copia el identificador y las unidades de cada
 * medicamento prescrito en una estructura utilizada posteriormente
 * para restaurar stock en caso de modificación, eliminación y error.
 * 
 * @param medicationList Lista de medicamentos prescritos.
 * @param rollback Lista donde se almacenarán las operaciones rollback.
 */
export function getRollback (medicationList: PrescribedMedication[], rollback: RollbackMedication[]): void {
  for (const medication of medicationList) {
    rollback.push({
      medication: medication.medication, 
      units: medication.units
    });
  }
}