import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    // If no URI is provided, we return null to allow fallback store handling
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
    };

    cached.promise = (async () => {
      try {
        const m = await mongoose.connect(uri, opts);
        console.log("[MongoDB] Connected successfully to Atlas.");
        return m;
      } catch (err: any) {
        // Fallback for Windows DNS EBADRESP with mongodb+srv://
        if (err?.message?.includes("EBADRESP") && uri.includes("cluster0.g5lf2l6.mongodb.net")) {
          const directUri = uri
            .replace("mongodb+srv://", "mongodb://")
            .replace(
              "cluster0.g5lf2l6.mongodb.net",
              "ac-vpj5feo-shard-00-00.g5lf2l6.mongodb.net:27017,ac-vpj5feo-shard-00-01.g5lf2l6.mongodb.net:27017,ac-vpj5feo-shard-00-02.g5lf2l6.mongodb.net:27017"
            );
          const fallbackUri = directUri.includes("ssl=") ? directUri : (directUri.includes("?") ? `${directUri}&ssl=true&authSource=admin` : `${directUri}?ssl=true&authSource=admin`);
          console.log("[MongoDB] Retrying via direct shard cluster hosts...");
          const m = await mongoose.connect(fallbackUri, opts);
          console.log("[MongoDB] Connected successfully to Atlas via direct shards.");
          return m;
        }
        throw err;
      }
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("[MongoDB] Connection error:", e);
    return null;
  }

  return cached.conn;
}

export function isMongoConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim().length > 0);
}
