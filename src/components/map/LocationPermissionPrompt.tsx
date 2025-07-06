'use client';

import { useState } from 'react';
import { LocateIcon } from 'lucide-react';
import { useLanguageStore } from '@/lib/store';
import { getTranslation } from '@/lib/appTranslations';

interface LocationPermissionPromptProps {
  isOpen: boolean;
  isSharing: boolean;
  onPermissionGranted: () => void;
  onPermissionRevoked: () => void;
  onClose: () => void;
}

export function LocationPermissionPrompt({ 
  isOpen,
  isSharing,
  onPermissionGranted,
  onPermissionRevoked,
  onClose
}: LocationPermissionPromptProps) {
  const isSpanish = useLanguageStore(state => state.isSpanish);

  if (!isOpen) return null;

  return (
    <div className="fixed top-4 left-4 z-[1000] bg-white p-4 rounded-lg shadow-lg border border-gray-300">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <LocateIcon className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm">{getTranslation('shareLocation', isSpanish ? 'es' : 'en')}</p>
          <div className="mt-2 flex gap-2">
            {isSharing ? (
              <button
                onClick={() => {
                  onPermissionRevoked();
                  onClose();
                }}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
              >
                {getTranslation('stopSharing', isSpanish ? 'es' : 'en')}
              </button>
            ) : (
              <button
                onClick={() => {
                  onPermissionGranted();
                  onClose();
                }}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
              >
                {getTranslation('share', isSpanish ? 'es' : 'en')}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300 transition-colors"
            >
              {getTranslation('notNow', isSpanish ? 'es' : 'en')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
