import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careerpilot-x';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500, // Quick timeout if Mongo isn't running locally
    });
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[Database] Local MongoDB unavailable (${msg}). Starting in resilient in-memory hybrid store mode.`);
    return false;
  }
};
