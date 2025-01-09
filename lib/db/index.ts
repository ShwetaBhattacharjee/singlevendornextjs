import mongoose, { Connection } from "mongoose";

// Type the global variable directly
if (typeof global.mongoose === "undefined") {
  global.mongoose = { conn: null, promise: null };
}

const cached = global.mongoose as { conn: Connection | null; promise: Promise<typeof mongoose> | null };

export const connectToDatabase = async (MONGODB_URI = process.env.MONGODB_URI) => {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) throw new Error("MONGODB_URI is missing");

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000, // 30 seconds
    });
  }

  const mongooseInstance = await cached.promise; // Resolves to mongoose instance
  cached.conn = mongooseInstance.connection; // Get the actual connection from mongoose instance
  return cached.conn;
};
