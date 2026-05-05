import { app } from "./app.js";
import "./db/mongoose.js";
import { connectDB } from "./db/mongoose.js";

const port = process.env.PORT || 3000;

(async () => {
  try {
    await connectDB();
    app.listen(port, () => console.log(`Server is up on port ${port}`));
  } catch (error) {
    console.error(`DB connection failed`, error);
    process.exit(1);
  }
})();