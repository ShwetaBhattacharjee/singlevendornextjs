import mongoose, { Connection } from 'mongoose';

// Define a custom interface for caching the connection
interface Cached {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cached: Cached = (global as any).mongoose || { conn: null, promise: null };

export const connectToDatabase = async (MONGODB_URI = process.env.MONGODB_URI): Promise<Connection> => {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is missing in environment variables.');
  }

  // Ensuring that mongoose.connect() is only called once per server start
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Optional: adjust timeout if needed
    }).then((mongooseInstance) => mongooseInstance.connection);  // Use `.then()` to resolve to `mongoose.connection`
  }

  try {
    cached.conn = await cached.promise;
    console.log('MongoDB connected successfully');
    return cached.conn;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw new Error('Failed to connect to MongoDB');
  }
};
