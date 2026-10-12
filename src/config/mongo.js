import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectMongo() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGODB_URI);
}

export async function checkMongo() {
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    throw new Error("MongoDB is not connected. Start the MongoDB service and check MONGODB_URI.");
  }
  await mongoose.connection.db.command({ ping: 1 });
}
