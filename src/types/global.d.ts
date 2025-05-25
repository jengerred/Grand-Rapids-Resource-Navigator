import { MongoClient } from 'mongodb';

declare global {
  interface Window {
    mongoClientPromise: Promise<MongoClient> | undefined;
  }
}
