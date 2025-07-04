import { MongoClient } from 'mongodb';
import { Resource } from '../src/models/resource';

async function updateResourcesWithCoordinates() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('Please set MONGODB_URI in your environment variables');
  }
  
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    const resources = await db.collection('resources').find().toArray();

    console.log(`Found ${resources.length} resources to update`);

    for (const resource of resources) {
      if (!resource.address || resource.coordinates) continue;

      try {
        // Get coordinates from address
        const coordinates = await getCoordinatesFromAddress(
          resource.address,
          resource.city,
          resource.state,
          resource.zip
        );

        // Update the resource with coordinates
        await db.collection('resources').updateOne(
          { _id: resource._id },
          { 
            $set: { 
              coordinates,
              updatedAt: new Date()
            }
          }
        );

        console.log(`Updated coordinates for ${resource.name}`);
      } catch (error) {
        console.error(`Failed to update coordinates for ${resource.name}:`, error);
      }
    }

    console.log('Update complete');
  } catch (error) {
    console.error('Error updating resources:', error);
  } finally {
    await client.close();
  }
}

async function getCoordinatesFromAddress(address: string, city: string, state: string, zip: string) {
  // TODO: Implement actual geocoding service
  // For now, return a placeholder
  return {
    lat: 42.9634, // Default to Grand Rapids center
    lng: -85.6681
  };
}

updateResourcesWithCoordinates();
