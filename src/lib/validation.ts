import { Document } from 'mongodb';

export function validateResource(resource: Document): boolean {
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
}
