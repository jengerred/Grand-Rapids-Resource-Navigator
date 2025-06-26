'use client';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useState } from 'react';

interface LanguageToggleProps {
  isSpanish: boolean;
  onToggle: (isSpanish: boolean) => void;
}

export function LanguageToggle({ isSpanish, onToggle }: LanguageToggleProps) {
  const toggleLanguage = () => {
    onToggle(!isSpanish);
  };

  return (
    <div className="flex justify-center gap-2">
      <button
        onClick={toggleLanguage}
        className={`px-4 py-2 rounded-lg transition-colors ${
          !isSpanish ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
        } hover:bg-blue-600 hover:text-white`}
      >
        English
      </button>
      <button
        onClick={toggleLanguage}
        className={`px-4 py-2 rounded-lg transition-colors ${
          isSpanish ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
        } hover:bg-blue-600 hover:text-white`}
      >
        Español
      </button>
    </div>
  );
}
