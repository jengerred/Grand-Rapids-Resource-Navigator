import { NextResponse } from 'next/server';
import { getMongoClient, cleanupMongoDB } from '@/lib/mongodb';
import '@/lib/api/mongodb';
import { Resource } from '@/types/resource';
import { ObjectId, Collection, WithId, Document } from 'mongodb';
import { offlineResources } from '@/data/offlineData';

// Ensure this module is only used in server-side code
if (typeof window !== 'undefined') {
  throw new Error('API routes should only be used on the server side');
}

// Type for MongoDB document with _id
interface MongoResource extends Resource {
  _id: ObjectId;
}

// Type for MongoDB document without _id
interface ResourceWithoutId extends Resource {
  id: string;
}

type ResourceWithId = MongoResource | ResourceWithoutId;

function convertMongoResourceToResource(resource: WithId<Document> | Resource): Resource {
  const id = 'id' in resource ? resource.id : resource._id.toString();
  const converted = {
    id,
    name: resource.name,
    address: resource.address,
    city: resource.city,
    state: resource.state,
    zip: resource.zip,
    category: resource.category,
    services: resource.services,
    hours: resource.hours || '',
    phone: resource.phone || '',
    website: resource.website || '',
    geocodedCoordinates: {
      lat: resource.geocodedCoordinates?.lat || 0,
      lng: resource.geocodedCoordinates?.lng || 0
    },
    location: resource.location || '',
    createdAt: resource.createdAt || new Date(),
    updatedAt: resource.updatedAt || new Date()
  } as Resource;
  return converted;
}

function convertResourceToMongoResource(resource: Resource): Omit<Resource, 'id'> {
  const { ...mongoData } = resource;
  return {
    ...mongoData,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

export async function GET(): Promise<Response> {
  try {
    const client = await getMongoClient();
    const db = client.db('grand-rapids-resources');
    const resources = await db.collection('resources').find().toArray();
    if (resources.length > 0) {
      return NextResponse.json(
        resources.map((resource: WithId<Document>) => {
          // Convert MongoDB document to Resource type
          const converted = convertMongoResourceToResource(resource);
          return converted;
        })
      );
    } else {
      // If no resources found in MongoDB, use offline data
      console.log('No resources found in MongoDB, using offline data');
      const resources = offlineResources.map((resource) => {
        // Convert ObjectId to string if needed
        const resourceId = typeof resource.id === 'string' ? resource.id : (resource.id as ObjectId).toString();
        const offlineResource: Resource = {
          id: resourceId,
          name: resource.name,
          address: resource.address,
          city: resource.city,
          state: resource.state,
          zip: resource.zip,
          category: resource.category,
          services: resource.services,
          hours: resource.hours || '',
          phone: resource.phone || '',
          website: resource.website || '',
          geocodedCoordinates: {
            lat: resource.geocodedCoordinates?.lat || 0,
            lng: resource.geocodedCoordinates?.lng || 0
          },
          location: resource.location || '',
          createdAt: resource.createdAt || new Date(),
          updatedAt: resource.updatedAt || new Date()
        };
        return offlineResource;
      });
      return NextResponse.json(resources);
    }
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  } finally {
    await cleanupMongoDB();
  }
}

export async function POST(request: Request) {
  try {
    const client = await getMongoClient();
    const data = await request.json();
    const mongoData = convertResourceToMongoResource(data);
    const db = client.db('grand-rapids-resources');
    const result = await db.collection('resources').insertOne(mongoData);
    const resource = {
      ...data,
      id: result.insertedId.toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return NextResponse.json(resource);
  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    );
  } finally {
    await cleanupMongoDB();
  }
}

export async function PUT(request: Request) {
  try {
    const client = await getMongoClient();
    const { id, ...data } = await request.json();
    const db = client.db('grand-rapids-resources');
    const result = await db.collection('resources').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...data,
          updatedAt: new Date()
        }
      }
    );
    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { 
          error: 'Resource not found', 
          details: 'The resource you are trying to update does not exist' 
        },
        { status: 404 }
      );
    }
    const updatedResource = await db.collection('resources').findOne({ _id: new ObjectId(id) });
    return NextResponse.json(convertMongoResourceToResource(updatedResource as ResourceWithId));
  } catch (error) {
    console.error('Error updating resource:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update resource', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  } finally {
    await cleanupMongoDB();
  }
}

export async function DELETE(request: Request) {
  try {
    const client = await getMongoClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'Resource ID is required' },
        { status: 400 }
      );
    }
    const db = client.db('grand-rapids-resources');
    const collection = db.collection('resources') as Collection<MongoResource>;
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    );
  } finally {
    await cleanupMongoDB();
  }
}
