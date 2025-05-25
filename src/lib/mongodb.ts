import { MongoClient } from 'mongodb';

// Global is used here to maintain a cached connection across hot reloads
// in development. This prevents connections growing exponentially
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Initialize the client
let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | undefined;

// Initialize in a separate function so it can be called before accessing the module
export async function initMongoDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Please add your Mongo URI to .env.local');
  }

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(process.env.MONGODB_URI);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(process.env.MONGODB_URI);
    clientPromise = client.connect();
  }
  return clientPromise;
}

// Export the promise to be used in API routes
export { clientPromise };

// Export a function to get the client
export async function getMongoClient() {
  if (!client) {
    throw new Error('MongoDB client not initialized. Call initMongoDB() first.');
  }
  return client;
}
