import { AppError } from "./appError.js";

/**
 * Error utilizado para representar accesos prohibidos.
 * 
 * Devuelve el código HTTP 403.
 */
export class ForbiddenError extends AppError {
  /**
   * Crea una nueva instancia de ForbiddenError.
   * 
   * @param message Mensaje descriptivo del error.
   */
  constructor(message: string) {
    super(message, 403);
  }
}