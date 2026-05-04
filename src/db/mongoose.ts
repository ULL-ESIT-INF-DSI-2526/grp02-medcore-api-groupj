import { connect } from "mongoose";

export async function connectDB() {
  const db = process.env.NODE_ENV === "test"
  ? process.env.MONGODB_TEST_URI
  : process.env.MONGODB_URL;
  if (!db)
    throw new Error(`MONGODB_URL is not defined in environment variables`);
  try {
    await connect(db, { connectTimeoutMS: 10000 });
    console.log(`Connection to MongoDB server established`);
  } catch (error) {
    console.log(`Unable to connect to MongoDB server:`, error);
    throw error;
  }
}
