import { AppError } from "./appError.js";

/**
 * Error utilizado cuando un recurso no existe.
 * 
 * Devuelve el código HTTP 404.
 */
export class NotFoundError extends AppError {
  /**
   * Crea una nueva instancia de NotFoundError.
   * 
   * @param message Mensaje descriptivo del error.
   */
  constructor(message: string) {
    super(message, 404);
  }
}