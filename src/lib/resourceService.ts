import clientPromise from './mongodb';
import { Resource, CreateResourceDTO, UpdateResourceDTO } from '@/types/resource';

export class ResourceService {
  async getAllResources(): Promise<Resource[]> {
    const client = await clientPromise;
    const db = client.db('food_pantry');
    const resources = await db.collection('resources').find({}).toArray();
    return resources;
  }

  async createResource(data: CreateResourceDTO): Promise<Resource> {
    const client = await clientPromise;
    const db = client.db('food_pantry');
    const result = await db.collection('resources').insertOne(data);
    return { ...data, _id: result.insertedId };
  }

  async updateResource(id: string, data: UpdateResourceDTO): Promise<Resource | null> {
    const client = await clientPromise;
    const db = client.db('food_pantry');
    const result = await db.collection('resources').findOneAndUpdate(
      { _id: new MongoDB.ObjectId(id) },
      { $set: data },
      { returnDocument: 'after' }
    );
    return result.value || null;
  }

  async deleteResource(id: string): Promise<boolean> {
    const client = await clientPromise;
    const db = client.db('food_pantry');
    const result = await db.collection('resources').deleteOne({ _id: new MongoDB.ObjectId(id) });
    return result.deletedCount > 0;
  }
}

export const resourceService = new ResourceService();
