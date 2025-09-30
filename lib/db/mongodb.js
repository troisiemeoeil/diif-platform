import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (!uri) {
  throw new Error("Please add your Mongo URI to .env.local");
}

// if (process.env.NODE_ENV === "development") {
//   // In dev, use a global variable so the connection is not recreated on every hot reload
//   if (!global._mongoClientPromise) {
//     client = new MongoClient(uri, options);
//     global._mongoClientPromise = client.connect();
//   }
//   clientPromise = global._mongoClientPromise;
// } else {
  // In production, it's fine to always create a new client
  client = new MongoClient(uri, options);
  clientPromise = client.connect();


export default clientPromise;
