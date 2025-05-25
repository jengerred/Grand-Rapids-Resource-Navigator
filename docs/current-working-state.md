# Current Working State Documentation

## MongoDB Configuration

### Environment Variables
- `MONGODB_URI`: `mongodb+srv://jengerred:%71%71%44%77%6C%6F%66%43%50%37%47%6F%46%5A%45%48@cluster0.xkeshgw.mongodb.net/resource-navigator?retryWrites=true&w=majority`
  - Database name: `resource-navigator`
  - Collection name: `resources`

### MongoDB Initialization (mongodb.ts)
```typescript
// Global MongoDB client configuration
let client: MongoClient | null = null;
let mongoClientPromise: Promise<MongoClient> | null = null;

// Initialize MongoDB connection
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

// Get MongoDB client
export async function getMongoClient(): Promise<MongoClient> {
  await initMongoDB();
  return client!;
}
```

## Map Component Changes

### Component Structure
- `GrandRapidsMap.tsx`: Main map component with client-side rendering
- `LeafletConfig.tsx`: Handles Leaflet icon configuration
- `GeolocationHandler.tsx`: Manages user location permissions

### Recent Updates
1. **Client-Side Rendering**
   - Added 'use client' directive to all map components
   - Used ClientOnly wrapper for proper SSR handling
   - Removed server-side window object usage

2. **Type Safety**
   - Added proper type checking for coordinates
   - Fixed null value handling in map markers
   - Removed unused imports and components

3. **Leaflet Configuration**
   - Properly configured marker icons
   - Ensured client-side only execution
   - Removed direct window object usage

## API Routes (route.ts)

### GET Endpoint
```typescript
export async function GET() {
  try {
    // Initialize MongoDB connection
    await initMongoDB();
    const client = await getMongoClient();
    const db = client.db();  // Database name from connection string
    const mongoResources = await db.collection('resources').find({}).toArray();
    
    if (mongoResources.length > 0) {
      // Convert MongoDB resources to API format
      const resources = mongoResources.map((resource: Document) => convertMongoResourceToResource(resource));
      return NextResponse.json(resources);
    } else {
      // Fallback to offline data
      console.log('No resources found in MongoDB, using offline data');
      const resources = offlineResources.map((resource: Resource) => convertMongoResourceToResource(resource));
      return NextResponse.json(resources);
    }
  } catch (error) {
    // Fallback to offline data on error
    console.error('Error fetching resources:', error);
    console.log('Using offline data as fallback');
    const resources = offlineResources.map((resource: Resource) => convertMongoResourceToResource(resource));
    return NextResponse.json(resources);
  }
}
```

### POST Endpoint
```typescript
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const mongoData = convertResourceToMongoResource(data);
    const client = await getMongoClient();
    if (!client) {
      throw new Error('MongoDB client is not initialized');
    }
    const db = client.db();  // Database name from connection string
    const result = await db.collection('resources').insertOne(mongoData);
    const resource = {
      ...data,
      id: result.insertedId.toString()
    };
    return NextResponse.json(resource);
  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json(
      { error: 'Failed to create resource', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

### PUT Endpoint
```typescript
export async function PUT(request: Request) {
  try {
    const { id, ...data }: { id: string } & UpdateResourceDTO = await request.json();
    const client = await getMongoClient();
    if (!client) {
      throw new Error('MongoDB client is not initialized');
    }
    const db = client.db();  // Database name from connection string
    const result = await db.collection('resources').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: data },
      { returnDocument: 'after' }
    );
    // ... rest of the implementation
  } catch (error) {
    // Error handling
  }
}
```

## Map Configuration

### Leaflet Configuration
- Leaflet is now properly configured with client-side initialization
- Using dynamic imports for proper SSR handling
- Leaflet icon configuration is handled in LeafletConfig component
- Properly waiting for Leaflet to load before configuration

```typescript
// LeafletConfig.tsx
import { useEffect } from 'react';

export function LeafletConfig() {
  // Only run on client side
  if (typeof window === 'undefined') {
    return null;
  }

  // Wait for Leaflet to be loaded
  useEffect(() => {
    import('leaflet').then((leaflet) => {
      // Configure Leaflet icons
      leaflet.default.Icon.Default.mergeOptions({
        iconRetinaUrl: '/leaflet/marker-icon-2x.png',
        iconUrl: '/leaflet/marker-icon.png',
        shadowUrl: '/leaflet/marker-shadow.png'
      });
    });
  }, []);

  return null;
}
```

### Map Component Structure
- GrandRapidsMap.tsx: Main map component with client-side rendering
- LeafletConfig.tsx: Handles Leaflet initialization and configuration
- GeolocationHandler.tsx: Manages user location permissions

### Recent Changes
1. Fixed Leaflet initialization:
   - Using proper dynamic imports
   - Waiting for Leaflet to load before configuration
   - Proper client-side only execution

2. Map Component Improvements:
   - Removed unused variables and imports
   - Properly handling client-side rendering
   - Using ClientOnly wrapper for SSR compatibility

3. Resource Conversion Functions
```typescript
function convertMongoResourceToResource(resource: Document): Resource {
  return {
    id: resource._id.toString(),
    name: resource.name as string,
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

function convertResourceToMongoResource(resource: Resource): Omit<Resource, 'id'> {
  const { id, ...mongoData } = resource;
  return mongoData;
}
```

## Key Points
1. MongoDB connection uses database name from connection string
2. All database operations use `client.db()` without specifying database name
3. Proper error handling with fallback to offline data
4. Type safety maintained throughout
5. Leaflet configuration handled directly in map component
6. Resource conversion functions properly typed

## Recent Changes
1. Fixed resource conversion functions:
   - Removed unused `convertOfflineResource` function
   - Fixed `convertMongoResourceToResource` to handle MongoDB resources correctly
   - Removed duplicate return statement in `convertMongoResourceToResource`

2. Database Configuration:
   - Updated database name from `grand-rapids-resources` to `resource-navigator` in all files
   - Using `client.db()` instead of specifying database name explicitly

3. Resource Conversion:
   - Directly handling MongoDB resource conversion in GET endpoint
   - Removed intermediate conversion functions that were causing issues

## Important Notes
- Do not modify the MongoDB URI format
- All database operations should use `client.db()`
- Keep proper error handling and fallback mechanisms
- Maintain type safety in all conversions
- Keep Leaflet configuration in the main map component
