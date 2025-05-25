import { MongoClient } from 'mongodb';

// Global is used here to maintain a cached connection across hot reloads
// in development. This prevents connections growing exponentially
declare global {
  let _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Initialize the client
let client: MongoClient | null = null;
let mongoClientPromise: Promise<MongoClient> | null = null;

// Initialize in a separate function so it can be called before accessing the module
export async function initMongoDB(): Promise<MongoClient> {
  if (!process.env.MONGODB_URI) {
    throw new Error('Please add your Mongo URI to .env.local');
  }

  if (!mongoClientPromise) {
    client = new MongoClient(process.env.MONGODB_URI);
    mongoClientPromise = client.connect();
  }
  return mongoClientPromise;
}

// Export a function to get the database
export async function getMongoClient(): Promise<MongoClient> {
  await initMongoDB();
  return client!;
}
