import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/spotify-ai-music";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

interface MongooseConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseConnection;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("Tentando conectar ao MongoDB...");

    cached.promise = mongoose
      .connect(MONGODB_URI)
      .then((mongoose) => {
        console.log("✅ Conectado ao MongoDB com sucesso!");
        return mongoose;
      })
      .catch((error) => {
        console.error("❌ Erro ao conectar ao MongoDB:", error.message);
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("❌ Falha na conexão com MongoDB:", e);
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
