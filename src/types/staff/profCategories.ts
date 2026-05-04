export const PROFESSIONAL_CATEGORIES = [
  "medico_adjunto",
  "medico_residente",
  "enfermero",
  "auxiliar_enfermeria",
  "jefe_servicio"
] as const;

export type ProfessionalCategory = typeof PROFESSIONAL_CATEGORIES[number];