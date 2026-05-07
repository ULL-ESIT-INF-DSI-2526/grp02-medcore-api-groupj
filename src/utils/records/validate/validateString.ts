export function validateString (data: unknown, errors: string[], option: boolean): void {
  const message: string = (option)? "identificación del paciente" : "licencia médica";
  if (!data) errors.push(`Se requiere la ${message}`);
  else if (typeof data !== "string") errors.push(`El formato de la ${message} no es válido`);
  else if (typeof data === "string")
    if(data.trim().length === 0) errors.push(`La ${message} esta vacia`);
}