/**
 * Vías de administración válidas para los medicamentos.
 */
export const VIA = [
  "oral",
  "intravenosa",
  "intramuscular",
  "subcutanea",
  "topica",
  "inhalatoria",
];

/**
 * Tipo unión derivado de las vías de administración permitidas.
 */
export type Via = typeof VIA[number];