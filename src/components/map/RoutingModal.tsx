'use client';

import RoutingControls from '@/lib/routing/RoutingControls';

interface RoutingModalProps {
  isOpen: boolean;
  resource: { geocodedCoordinates: { lat: number; lng: number } } | null;
  onClose: () => void;
  userLocation: { lat: number; lng: number } | null;
}

export default function RoutingModal({ isOpen, resource, onClose, userLocation }: RoutingModalProps) {
  return (
    isOpen && resource && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-96">
          <RoutingControls 
            resourceLocation={resource.geocodedCoordinates}
            userLocation={userLocation!}
            onClose={onClose}
          />
        </div>
      </div>
    )
  );
}
