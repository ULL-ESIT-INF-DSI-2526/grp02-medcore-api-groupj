import { AppError } from "./appError.js";

/**
 * Error utilizado para representar fallos de validación.
 * 
 * Devuelve el código HTTP 400 e incluye una lista detallada
 * de errores encontrados durante la validación.
 */
export class ValidationErrors extends AppError {
  /**
   * Lista de errores de validación detectados.
   */
  errors: string[];

  /**
   * Crea una nueva instancia de ValidationErrors.
   * 
   * @param errors Lista de mensajes de error de validación.
   */
  constructor(errors: string[]) {
    super("Validation failed", 400);
    this.errors = errors;
  }
}