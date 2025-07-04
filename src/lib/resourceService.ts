import { getMongoClient } from './mongodb';
import { Resource, CreateResourceDTO, UpdateResourceDTO } from '@/types/resource';
import { ObjectId } from 'mongodb';

export class ResourceService {
  async getAllResources(): Promise<Resource[]> {
    const client = await getMongoClient();
    const db = client.db('grand-rapids-resources');
    const resources = await db.collection('resources').find({}).toArray();
    return resources.map(resource => ({
      id: resource._id.toString(),
      name: resource.name,
      address: resource.address,
      city: resource.city,
      state: resource.state,
      zip: resource.zip,
      category: resource.category,
      services: resource.services,
      hours: resource.hours,
      phone: resource.phone,
      website: resource.website,
      geocodedCoordinates: resource.geocodedCoordinates,
      location: resource.location,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt
    }));
  }

  async createResource(resource: CreateResourceDTO): Promise<Resource> {
    const client = await getMongoClient();
    const db = client.db('grand-rapids-resources');
    const mongoResource = {
      ...resource,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('resources').insertOne(mongoResource);
    return {
      id: result.insertedId.toString(),
      name: resource.name,
      address: resource.address,
      city: resource.city,
      state: resource.state,
      zip: resource.zip,
      category: resource.category,
      services: resource.services,
      hours: resource.hours,
      phone: resource.phone,
      website: resource.website,
      geocodedCoordinates: resource.geocodedCoordinates,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async getResource(id: string): Promise<Resource | null> {
    const client = await getMongoClient();
    const db = client.db('grand-rapids-resources');
    const resource = await db.collection('resources').findOne({ _id: new ObjectId(id) });
    if (!resource) return null;
    return {
      id: resource._id.toString(),
      name: resource.name,
      address: resource.address,
      city: resource.city,
      state: resource.state,
      zip: resource.zip,
      category: resource.category,
      services: resource.services,
      hours: resource.hours,
      phone: resource.phone,
      website: resource.website,
      geocodedCoordinates: resource.geocodedCoordinates,
      location: resource.location,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt
    };
  }

  async updateResource(id: string, updates: UpdateResourceDTO): Promise<Resource | null> {
    const client = await getMongoClient();
    const db = client.db('grand-rapids-resources');
    const result = await db.collection('resources').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...updates,
          updatedAt: new Date()
        }
      }
    );
    if (result.modifiedCount === 0) return null;
    
    const updatedResource = await db.collection('resources').findOne({ _id: new ObjectId(id) });
    if (!updatedResource) return null;
    return {
      id: updatedResource._id.toString(),
      name: updatedResource.name,
      address: updatedResource.address,
      city: updatedResource.city,
      state: updatedResource.state,
      zip: updatedResource.zip,
      category: updatedResource.category,
      services: updatedResource.services,
      hours: updatedResource.hours,
      phone: updatedResource.phone,
      website: updatedResource.website,
      geocodedCoordinates: updatedResource.geocodedCoordinates,
      location: updatedResource.location,
      createdAt: updatedResource.createdAt,
      updatedAt: updatedResource.updatedAt
    };
  }

  async deleteResource(id: string): Promise<boolean> {
    const client = await getMongoClient();
    const db = client.db('grand-rapids-resources');
    const result = await db.collection('resources').deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
}

export const resourceService = new ResourceService();
