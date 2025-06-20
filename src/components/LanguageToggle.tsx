'use client';

import { useState } from 'react';

export function LanguageToggle() {
  const [isSpanish, setIsSpanish] = useState(false);

  const toggleLanguage = () => {
    setIsSpanish(!isSpanish);
  };

  return (
    <div className="flex justify-center gap-2">
      <button
        onClick={toggleLanguage}
        className={`px-4 py-2 rounded-lg transition-colors ${
          !isSpanish ? 'bg-blue-500 text-white hover:bg-blue-600 hover:text-white' : 'bg-gray-200 text-gray-600'
        } hover:bg-green-500 hover:text-white`}
      >
        English
      </button>
      <button
        onClick={toggleLanguage}
        className={`px-4 py-2 rounded-lg transition-colors ${
          isSpanish ? 'bg-blue-500 text-white hover:bg-blue-600 hover:text-white' : 'bg-gray-200 text-gray-600'
        } hover:bg-green-500 hover:text-white`}
      >
        Español
      </button>
    </div>
  );
}
