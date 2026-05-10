/**
 * Clase base para errores personalizados de la aplicación.
 * 
 * Extiende la clase `Error` añadiendo un código de estado HTTP
 * asociado al error.
 */
export class AppError extends Error {
  /**
   * Código de estado HTTP asociado al error.
   */
  statusCode: number;

  /**
   * Crea una nueva instancia de AppError.
   * 
   * @param message Mensaje descriptivo del error.
   * @param statusCode Código de estado HTTP asociado.
   */
  constructor(
    message: string,
    statusCode: number) 
  {
    super(message);
    this.statusCode = statusCode;
  }
}