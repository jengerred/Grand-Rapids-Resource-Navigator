import { MongoClient } from 'mongodb';

// Global is used here to maintain a cached connection across hot reloads
// in development. This prevents connections growing exponentially
declare global {
  let _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Initialize the client
let client: MongoClient | null = null;
let mongoClientPromise: Promise<MongoClient> | null = null;
let isConnected = false;

// Initialize in a separate function so it can be called before accessing the module
export async function initMongoDB(): Promise<MongoClient> {
  if (!process.env.MONGODB_URI) {
    console.error('MongoDB URI not found in environment variables');
    throw new Error('Please add your Mongo URI to .env.local');
  }

  if (!mongoClientPromise) {
    try {
      client = new MongoClient(process.env.MONGODB_URI);
      mongoClientPromise = client.connect();
      
      // Add connection event listeners
      client.on('connect', () => {
        isConnected = true;
        console.log('MongoDB connected successfully');
      });

      client.on('error', (error) => {
        isConnected = false;
        console.error('MongoDB connection error:', error);
      });

      client.on('close', () => {
        isConnected = false;
        console.log('MongoDB connection closed');
      });
    } catch (error) {
      console.error('Failed to initialize MongoDB connection:', error);
      throw error;
    }
  }
  return mongoClientPromise;
}

// Export a function to get the database
export async function getMongoClient(): Promise<MongoClient> {
  try {
    await initMongoDB();
    if (!client) {
      throw new Error('MongoDB client is not initialized');
    }
    return client;
  } catch (error) {
    console.error('Failed to get MongoDB client:', error);
    throw error;
  }
}

// Export connection state
export function isMongoConnected(): boolean {
  return isConnected;
}
