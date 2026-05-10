/**
 * Estados válidos para un miembro del personal sanitario.
 */
export const STAFF_STATUS = [
  "activo",
  "inactivo"
] as const;

/**
 * Tipo unión derivado de los estados permitidos del personal.
 */
export type StaffStatus = typeof STAFF_STATUS[number];