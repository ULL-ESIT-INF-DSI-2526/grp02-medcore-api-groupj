/**
 * Categorías profesionales válidas para el personal sanitario.
 */
export const PROFESSIONAL_CATEGORIES = [
  "medico_adjunto",
  "medico_residente",
  "enfermero",
  "auxiliar_enfermeria",
  "jefe_servicio"
] as const;

/**
 * Tipo unión derivado de las categorías profesionales permitidas.
 */
export type ProfessionalCategory = typeof PROFESSIONAL_CATEGORIES[number];