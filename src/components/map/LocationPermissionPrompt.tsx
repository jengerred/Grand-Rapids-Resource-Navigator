'use client';

import { useState } from 'react';
import { LocateIcon } from 'lucide-react';

interface LocationPermissionPromptProps {
  onPermissionGranted: () => void;
  onPermissionDenied: () => void;
}

export function LocationPermissionPrompt({ 
  onPermissionGranted, 
  onPermissionDenied 
}: LocationPermissionPromptProps) {
  const [showPrompt, setShowPrompt] = useState(true);

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-[9999] bg-white p-4 rounded-lg shadow-lg border border-gray-300">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <LocateIcon className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm">Share your location to find nearby resources</p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => {
                setShowPrompt(false);
                onPermissionGranted();
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
              Share
            </button>
            <button
              onClick={() => {
                setShowPrompt(false);
                onPermissionDenied();
              }}
              className="px-3 py-1 bg-gray-200 rounded text-sm"
            >
              Not Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
