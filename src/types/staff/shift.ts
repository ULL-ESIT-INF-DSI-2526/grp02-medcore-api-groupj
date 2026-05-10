/**
 * Turnos laborales válidos para el personal sanitario.
 */
export const SHIFTS = [
  "mañana",
  "tarde",
  "noche",
  "rotatorio"
] as const;

/**
 * Tipo unión derivado de los turnos permitidos.
 */
export type Shift = typeof SHIFTS[number];