export const STAFF_STATUS = [
  "activo",
  "inactivo"
] as const;

export type StaffStatus = typeof STAFF_STATUS[number];