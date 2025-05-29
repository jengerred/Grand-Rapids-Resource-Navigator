'use client';

import { useEffect, useState } from 'react';
import GrandRapidsMap from '@/components/map/GrandRapidsMap';
import { Resource } from '@/types/resource';

export default function Home() {
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        console.log('Fetching resources...');
        const response = await fetch('/api/resources');
        if (!response.ok) {
          throw new Error('Failed to fetch resources');
        }
        const data = await response.json();
        console.log('Received resources:', data);
        setResources(data);
      } catch (error) {
        console.error('Error fetching resources:', error);
      }
    };

    fetchResources();
  }, []);

  // Always render the map, even if loading

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Grand Rapids Resource Navigator</h1>
            <p className="text-gray-600">Find resources and plan your route in Grand Rapids</p>
          </div>

          <div className="relative flex-1">
            <div className="w-full h-[80vh] rounded-lg shadow-lg">
              <GrandRapidsMap className="w-full h-full" resources={resources} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
