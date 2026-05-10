import { MedicationInput } from "../../../types/consultas/medicationInput.js";
import { PrescribedMedication } from "../../../types/consultas/prescribedMedication.js";
import { RollbackMedication } from "../../../types/consultas/rollbackMedication.js";
import { Medication } from "../../../models/medications.js";
import { ForbiddenError } from "../error/forbiddenError.js";
import { ConflictError } from "../error/conflictError.js";
import { NotFoundError } from "../error/notFoundError.js";

/**
 * Procesa una lista de medicamentos prescritos.
 * 
 * La función:
 * - Agrupa unidades repetidas por código nacional.
 * - Verifica existencia, stock y caducidad.
 * - Actualiza el stock disponible.
 * - Genera información para rollback en caso de error.
 * - Calcula el importe total del registro.
 * 
 * @param medicationList Lista de medicamentos recibidos desde la petición.
 * @param rollback Lista utilizada para almacenar operaciones reversibles.
 * 
 * @throws {NotFoundError} Si un medicamento no existe.
 * @throws {ConflictError} Si no hay stock suficiente.
 * @throws {ForbiddenError} Si un medicamento está caducado.
 * 
 * @returns Objeto con los medicamentos prescritos y el importe total.
 */

export async function processMedications( medicationList: MedicationInput[],
                                          rollback: RollbackMedication[]
                                        ): Promise<{prescribedMedications: PrescribedMedication[],
                                                    amount: number}> {
  const medicationUnits = calculateMedicationUnits(medicationList);
  const medicationMap = new Map<string, any>();
  for (const [nationalCode, totalUnits] of medicationUnits) {
    const medication = await Medication.findOne({ codigoNacional: nationalCode });
    if (!medication)
      throw new NotFoundError(`No se encontró el medicamento con código nacional ${nationalCode}`);
    checkMedication(medication, totalUnits);
    medication.stockDisponible -= totalUnits;
    await medication.save();
    rollback.push({
      medication: medication._id,
      units: totalUnits
    });
    medicationMap.set(nationalCode, medication);
  }
  const prescribedMedications: PrescribedMedication[] = [];
  let amount = 0;
  for (const medication of medicationList) {
    const medicationData = medicationMap.get(medication.nationalCode);
    prescribedMedications.push({
      medication: medicationData._id,
      units: medication.units,
      posology: medication.posology
    });
    amount += medicationData.precio * medication.units;
  }
  return { prescribedMedications, amount};
}

/**
 * Agrupa las unidades totales requeridas por código nacional.
 * 
 * @param medicationList Lista de medicamentos prescritos.
 * 
 * @returns Mapa con el código nacional y el total de unidades necesarias.
 */
function calculateMedicationUnits( medicationList: MedicationInput[]): Map<string, number> {
  const medicationMap = new Map<string, number>();
  for (const medication of medicationList) {
    const currentUnits = medicationMap.get(medication.nationalCode) || 0;
    medicationMap.set( medication.nationalCode, currentUnits + medication.units
    );
  }
  return medicationMap;
}


/**
 * Verifica si un medicamento puede ser utilizado.
 * 
 * Comprueba:
 * - Que exista stock suficiente.
 * - Que el medicamento no esté caducado.
 * 
 * @param medication Medicamento almacenado en base de datos.
 * @param requiredUnits Unidades necesarias para la operación.
 * 
 * @throws {ConflictError} Si el stock es insuficiente.
 * @throws {ForbiddenError} Si el medicamento está caducado.
 */
function checkMedication( medication: any, requiredUnits: number): void {
  if (medication.stockDisponible < requiredUnits)
    throw new ConflictError(`No hay suficiente stock para el medicamento con código nacional ${medication.codigoNacional}`);
  if (medication.fechaCaducidad.getTime() < Date.now())
    throw new ForbiddenError(`El medicamento con código nacional ${medication.codigoNacional} está caducado`);
}