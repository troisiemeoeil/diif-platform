import { MongoClient } from "mongodb";

const options = {};
let clientPromise;

// Only initialize connection at runtime, not at build time
function getMongoConnection() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error(
      "Please add your Mongo URI to .env.local under the MONGODB_URI variable"
    );
  }

  if (process.env.NODE_ENV === "development") {
    // In dev, use a global variable so the connection is not recreated on every hot reload
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  } else {
    // In production, it's fine to always create a new client
    if (!clientPromise) {
      const client = new MongoClient(uri, options);
      clientPromise = client.connect();
    }
    return clientPromise;
  }
}

export default getMongoConnection;
