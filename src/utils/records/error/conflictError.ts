import { AppError } from "./appError.js";

/**
 * Error utilizado para representar conflictos de recursos.
 * 
 * Devuelve el código HTTP 409.
 */
export class ConflictError extends AppError {
  /**
   * Crea una nueva instancia de ConflictError.
   * 
   * @param message Mensaje descriptivo del conflicto.
   */
  constructor(message: string) {
    super(message, 409);
  }
}