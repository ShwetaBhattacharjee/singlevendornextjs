import mongoose from "mongoose";

// Cache for MongoDB connection
const cached = (global as any).mongoose || { conn: null, promise: null };

export const connectToDatabase = async (MONGODB_URI = process.env.MONGODB_URI) => {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) throw new Error("MONGODB_URI is missing");

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000, // 30 seconds
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};
