import { MongoClient, MongoClientOptions } from 'mongodb';

// Configure MongoDB options
export const mongoOptions: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 0,
  waitQueueTimeoutMS: 30000,
  socketTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  authMechanism: 'SCRAM-SHA-256' as const
};

// Ensure this module is only used in server-side code
if (typeof window !== 'undefined') {
  throw new Error('MongoDB should only be used on the server side');
}

// Initialize in a separate function so it can be called before accessing the module
export const initMongoDB = async () => {
  if (typeof window !== 'undefined') {
    throw new Error('MongoDB initialization must be done on the server side');
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MongoDB URI is not set. Please add your Mongo URI to .env.local');
  }

  if (!('mongoClientPromise' in globalThis)) {
    try {
      (globalThis as { mongoClientPromise?: Promise<MongoClient> }).mongoClientPromise = new MongoClient(process.env.MONGODB_URI, mongoOptions)
        .connect()
        .catch((error: unknown) => {
          console.error('Error connecting to MongoDB:', error);
          throw new Error(`Failed to connect to MongoDB: ${error}`);
        });
    } catch (error) {
      console.error('Error creating MongoDB client:', error);
      throw new Error(`Failed to create MongoDB client: ${error}`);
    }
  }

  try {
    await (globalThis as { mongoClientPromise?: Promise<MongoClient> }).mongoClientPromise;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw new Error(`Failed to connect to MongoDB: ${error}`);
  }
};

// Export a function to get the client
export async function getMongoClient() {
  const globalState = globalThis as { mongoClientPromise?: Promise<MongoClient> };
  if (!globalState.mongoClientPromise) {
    throw new Error('MongoDB client not initialized. Call initMongoDB() first.');
  }
  try {
    const client = await globalState.mongoClientPromise;
    return client;
  } catch (error) {
    console.error('Error getting MongoDB client:', error);
    throw new Error(`Failed to get MongoDB client: ${error}`);
  }
}

// Cleanup function for graceful shutdown
export async function cleanupMongoDB() {
  const globalState = globalThis as { mongoClientPromise?: Promise<MongoClient> };
  if (globalState.mongoClientPromise) {
    try {
      const client = await globalState.mongoClientPromise;
      await client.close();
      delete globalState.mongoClientPromise;
    } catch (error) {
      console.error('Error cleaning up MongoDB:', error);
    }
  }
}
