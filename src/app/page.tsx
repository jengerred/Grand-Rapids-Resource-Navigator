'use client';

import { useEffect, useState } from 'react';
import GrandRapidsMap from '@/components/map/GrandRapidsMap';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ChatBot } from '@/components/ChatBot';
import { Resource } from '@/types/resource';

export default function Home() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [showRouting, setShowRouting] = useState(false);

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
        <div className="flex flex-col gap-4">
          <div className="text-center mb-4" style={{
            display: showRouting ? 'none' : 'block'
          }}>
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold mb-2">Grand Rapids Resource Navigator</h1>
              <p className="text-gray-600">Find resources and plan your route in Grand Rapids</p>
            </div>
            <div className="mt-4">
              <div className="max-w-fit mx-auto">
                <LanguageToggle />
              </div>
            </div>
          </div>

          <div className="relative flex-1">
            <div className="w-full h-[80vh] rounded-lg shadow-lg" style={{
              position: 'relative',
              marginTop: showRouting ? '16px' : '0',
              marginLeft: showRouting ? '16px' : '0',
              marginRight: showRouting ? '16px' : '0',
              zIndex: showRouting ? 100 : 0
            }} key="map-container">
              <GrandRapidsMap 
                className="w-full h-full" 
                resources={resources} 
                showRouting={showRouting} 
                setShowRouting={setShowRouting} 
              />
            </div>
          </div>
        </div>
      </div>
      <ChatBot />
    </div>
  );
}
