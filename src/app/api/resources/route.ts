import { NextResponse } from 'next/server';
import { initMongoDB, getMongoClient } from '@/lib/mongodb';
import { Resource, UpdateResourceDTO } from '@/types/resource';
import { ObjectId, Document } from 'mongodb';
import { offlineResources } from '@/data/offlineData';

// Type for MongoDB document with _id
interface MongoResource extends Resource {
  _id: ObjectId;
}

function convertMongoResourceToResource(resource: Document): Resource {
  return {
    id: resource._id.toString(),
    name: resource.name as string,
    address: resource.address as string,
    city: resource.city as string,
    state: resource.state as string,
    zip: resource.zip as string,
    category: resource.category as string,
    services: resource.services as string[],
    hours: resource.hours as string,
    phone: resource.phone as string,
    website: resource.website as string,
    geocodedCoordinates: {
      lat: (resource.geocodedCoordinates?.lat as number) || 0,
      lng: (resource.geocodedCoordinates?.lng as number) || 0
    },
    location: resource.location as string,
    createdAt: resource.createdAt as Date,
    updatedAt: resource.updatedAt as Date
  };
}

/* eslint-disable @typescript-eslint/no-unused-vars */
function convertResourceToMongoResource(resource: Resource): Omit<Resource, 'id'> {
  const { id: _, ...mongoData } = resource;
  return mongoData;
}
/* eslint-enable @typescript-eslint/no-unused-vars */

export async function GET() {
  try {
    // Initialize MongoDB connection
    await initMongoDB();
    const client = await getMongoClient();
    const db = client.db();
    const mongoResources = await db.collection('resources').find({}).toArray();
    console.log('Mongo resources found:', mongoResources.length);
    
    // Validate and convert resources
    const validResources = mongoResources
      .filter((resource: Document) => {
        // Required fields
        const requiredFields = ['name', 'address', 'city', 'state', 'zip', 'category', 'services'];
        
        // Check if all required fields exist and are not empty
        for (const field of requiredFields) {
          if (!resource[field] || (typeof resource[field] === 'string' && !resource[field].trim())) {
            console.error(`Missing required field: ${field}`);
            return false;
          }
        }
        
        // Validate geocodedCoordinates
        if (!resource.geocodedCoordinates || 
            typeof resource.geocodedCoordinates.lat !== 'number' || 
            typeof resource.geocodedCoordinates.lng !== 'number') {
          console.error('Invalid geocodedCoordinates');
          return false;
        }
        
        return true;
      })
      .map((resource: Document) => convertMongoResourceToResource(resource));
    
    if (validResources.length > 0) {
      console.log('Valid resources found:', validResources.length);
      return NextResponse.json(validResources);
    } else {
      // If no resources found in MongoDB, use offline data
      console.log('No resources found in MongoDB, using offline data');
      return NextResponse.json(offlineResources);
    }
  } catch (error) {
    // If MongoDB connection fails, use offline data
    console.error('Error fetching resources:', error);
    console.log('Using offline data as fallback');
    return NextResponse.json(offlineResources);
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const mongoData = convertResourceToMongoResource(data);
    const client = await getMongoClient();
    if (!client) {
      throw new Error('MongoDB client is not initialized');
    }
    const db = client.db();
    const result = await db.collection('resources').insertOne(mongoData);
    const resource = convertMongoResourceToResource({
      ...data,
      _id: result.insertedId
    });
    return NextResponse.json(resource);
  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json(
      { error: 'Failed to create resource', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...data }: { id: string } & UpdateResourceDTO = await request.json();
    const client = await getMongoClient();
    if (!client) {
      throw new Error('MongoDB client is not initialized');
    }
    const db = client.db();
    const result = await db.collection('resources').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: data },
      { returnDocument: 'after' }
    );
    if (!result || !result.value) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }
    const resource = convertMongoResourceToResource(result.value);
    return NextResponse.json(resource);
  } catch (error) {
    console.error('Error updating resource:', error);
    return NextResponse.json(
      { error: 'Failed to update resource', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'Resource ID is required' },
        { status: 400 }
      );
    }
    const client = await getMongoClient();
    if (!client) {
      throw new Error('MongoDB client is not initialized');
    }
    const db = client.db();
    const result = await db.collection<MongoResource>('resources').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: result.deletedCount > 0 });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json(
      { error: 'Failed to delete resource', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
