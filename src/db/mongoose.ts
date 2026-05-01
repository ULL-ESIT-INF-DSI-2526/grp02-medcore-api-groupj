import { connect } from "mongoose";

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
