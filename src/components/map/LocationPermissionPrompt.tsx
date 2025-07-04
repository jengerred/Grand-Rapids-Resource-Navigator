'use client';

import { useState } from 'react';
import { LocateIcon } from 'lucide-react';
import { useLanguageStore } from '@/lib/store';
import { getTranslation } from '@/lib/appTranslations';

interface LocationPermissionPromptProps {
  onPermissionGranted: () => void;
  onPermissionDenied: () => void;
}

export function LocationPermissionPrompt({ 
  onPermissionGranted, 
  onPermissionDenied 
}: LocationPermissionPromptProps) {
  const [showPrompt, setShowPrompt] = useState(true);
  const isSpanish = useLanguageStore(state => state.isSpanish);

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-[9999] bg-white p-4 rounded-lg shadow-lg border border-gray-300">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <LocateIcon className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm">{getTranslation('shareLocation', isSpanish ? 'es' : 'en')}</p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => {
                setShowPrompt(false);
                onPermissionGranted();
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
              {getTranslation('share', isSpanish ? 'es' : 'en')}
            </button>
            <button
              onClick={() => {
                setShowPrompt(false);
                onPermissionDenied();
              }}
              className="px-3 py-1 bg-gray-200 rounded text-sm"
            >
              {getTranslation('notNow', isSpanish ? 'es' : 'en')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
