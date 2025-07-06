require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });

// Import the seed function
const { seedResources } = require('../src/data/offlineData');

async function runSeed() {
  try {
    console.log('Starting database seed...');
    await seedResources();
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

runSeed();
