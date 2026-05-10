import { app } from "./app.js";
import "./db/mongoose.js";
import { connectDB } from "./db/mongoose.js";

/**
 * Puerto donde se ejecutará el servidor HTTP.
 */
const port = process.env.PORT || 3000;

/**
 * Inicializa la conexión con la base de datos y arranca el servidor.
 * 
 * Si la conexión con MongoDB falla, el proceso termina con código `1`.
 */
(async () => {
  try {
    await connectDB();
    app.listen(port, () => console.log(`Server is up on port ${port}`));
  } catch (error) {
    console.error(`DB connection failed`, error);
    process.exit(1);
  }
})();