# Grand Rapids Resource Navigator

A Next.js application for finding resources in Grand Rapids.

## Features

- Resource search and discovery
- Interactive map integration
- Offline functionality
- Transportation options

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## Tech Stack

- Next.js
- React
- TypeScript
- MongoDB
- Leaflet.js (for mapping)

## Development Notes

### Recent Changes (May 25, 2025)

1. **Leaflet Configuration**
   - Created `LeafletConfig` component to handle icon configuration
   - Uses ES6 imports instead of `require`
   - Configures default marker icons with correct paths

2. **Geolocation Handler**
   - Renamed state variable from `hasPermission` to `hasLocationPermission`
   - Ensures proper client-side geolocation handling

3. **Map Component**
   - Updated to use `L` instead of `leaflet` for imports
   - Added proper type checking and error handling
   - Maintains client-side only functionality with 'use client' directive

4. **Build Issues**
   - Fixed TypeScript/ESLint errors related to unused variables and imports
   - Ensured consistent Leaflet import style across components
   - Maintained proper client-side only code execution

### Important Notes
- All map-related functionality must be wrapped in 'use client' directives
- Leaflet icons must be configured properly in the public directory
- Geolocation code should only run on the client side
- The map component should handle SSR issues gracefully
