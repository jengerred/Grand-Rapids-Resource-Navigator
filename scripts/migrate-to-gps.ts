const { MongoClient } = require('mongodb');

async function migrateToGPS() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('Please set MONGODB_URI in your environment variables');
  }
  
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    const resources = await db.collection('resources').find().toArray();

    console.log(`Found ${resources.length} resources to migrate`);

    for (const resource of resources) {
      if (!resource.geocodedCoordinates) continue;

      // Create GPS coordinates object
      const coordinates = {
        lat: resource.geocodedCoordinates.lat,
        lng: resource.geocodedCoordinates.lng
      };

      // Update the resource
      await db.collection('resources').updateOne(
        { _id: resource._id },
        { 
          $set: { 
            coordinates,
            updatedAt: new Date()
          },
          $unset: { geocodedCoordinates: '' }
        }
      );

      console.log(`Migrated ${resource.name} to use GPS coordinates`);
    }

    console.log('Migration complete');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await client.close();
  }
}

migrateToGPS();
