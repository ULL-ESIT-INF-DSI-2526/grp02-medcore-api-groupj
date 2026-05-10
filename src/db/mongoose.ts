import { connect } from "mongoose";

/**
 * Establece la conexión con el servidor MongoDB.
 * 
 * La URL de conexión se obtiene desde la variable de entorno
 * `MONGODB_URL`.
 * 
 * @throws {Error} Se lanza si `MONGODB_URL` no está definida
 * o si ocurre un error durante la conexión.
 * 
 * @returns Promesa que se resuelve cuando la conexión
 * con MongoDB se establece correctamente.
 */
export async function connectDB() {
  const URL = process.env.MONGODB_URL;

  if (!URL)
    throw new Error(`MONGODB_URL is not defined in environment variables`);

  try {
    await connect(URL, { connectTimeoutMS: 10000 });
    console.log(`Connection to MongoDB server established`);
  } catch (error) {
    console.log(`Unable to connect to MongoDB server:`, error);
    throw error;
  }
}
