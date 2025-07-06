import { useState, useEffect } from 'react';
import { useLanguageStore } from '@/lib/store';
import { LanguageToggle } from '@/components/LanguageToggle';
import { getTranslation, formatTranslation } from '@/translations';

export default function ChatTest() {
  const { isSpanish, setLanguage } = useLanguageStore();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  interface Resource {
    name: string;
    address: string;
    city: string;
    services: string[];
    phone: string;
    website: string;
    fullAddress: string;
  }

  const [relevantResources, setRelevantResources] = useState<Resource[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question,
          language: isSpanish ? 'es' : 'en' 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from API');
      }

      const data = await response.json();
      console.log('API Response:', JSON.stringify(data, null, 2));
      
      if (data.success) {
        setAnswer(data.answer);
        
        // Ensure we have valid resources
        const resources = Array.isArray(data.relevantResources) 
          ? data.relevantResources 
          : [];
          
        console.log('Setting relevant resources:', resources);
        setRelevantResources(resources);
      } else {
        setRelevantResources([]);
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {isSpanish ? 'Navegador de Recursos' : 'Resource Navigator'}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {isSpanish ? 'Idioma:' : 'Language:'}
            </span>
            <LanguageToggle 
              isSpanish={isSpanish} 
              onToggle={setLanguage} 
            />
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={isSpanish ? 'Pregunte sobre recursos...' : 'Ask about resources...'}
              disabled={loading}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading || !question.trim()}
            >
              {loading 
                ? (isSpanish ? 'Preguntando...' : 'Asking...') 
                : (isSpanish ? 'Preguntar' : 'Ask')}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 mb-4 text-red-700 bg-red-100 rounded">
            {isSpanish ? 'Error: ' : 'Error: '}{error}
          </div>
        )}

        {answer && (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h2 className="font-semibold text-lg text-blue-800 mb-2">Answer</h2>
              <div 
                className="text-gray-800 space-y-4"
                dangerouslySetInnerHTML={{
                  __html: answer
                    .split('\n\n')
                    .map(paragraph => 
                      paragraph.trim() 
                        ? `<p class="mb-4 last:mb-0">${paragraph.replace(/\n/g, '<br />')}</p>` 
                        : ''
                    )
                    .join('')
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
