/**
 * Formas farmacéuticas válidas para los medicamentos.
 */
export const FORMAFARMACEUTICA = [
  "comprimido",
  "capsula",
  "solucion oral",
  "solucion inyectable",
  "pomada",
  "parche transdermico",
  "inhalador",
  "otro"
];

/**
 * Tipo unión derivado de las formas farmacéuticas permitidas.
 */
export type formaFarmaceutica = typeof FORMAFARMACEUTICA[number];