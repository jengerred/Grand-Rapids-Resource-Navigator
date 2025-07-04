import { initMongoDB } from '@/lib/mongodb';

// Initialize MongoDB connection for API routes
export async function initializeMongoDB() {
  await initMongoDB();
}
