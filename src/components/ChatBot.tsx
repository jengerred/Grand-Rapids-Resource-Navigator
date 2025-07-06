'use client';

// TODO: Add backend Python with AI integration later
import { useState, useEffect } from 'react';
import { getTranslation, formatTranslation } from '@/lib/appTranslations';

interface Message {
  text: string;
  isUser: boolean;
  isSpanish: boolean;
}

interface ChatBotProps {
  isSpanish: boolean;
}

export function ChatBot({ isSpanish: appSpanish }: ChatBotProps) {
  const [isSpanish, setIsSpanish] = useState(appSpanish);
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(false);

  // Set initial welcome message
  useEffect(() => {
    setMessages([{
      text: getTranslation('chat.welcome', isSpanish ? 'es' : 'en'),
      isUser: false,
      isSpanish: isSpanish
    }]);
  }, [isSpanish]);

  // Sync with app language changes
  useEffect(() => {
    setIsSpanish(appSpanish);
  }, [appSpanish]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      text: input,
      isUser: true,
      isSpanish: isSpanish
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.text,
          isSpanish: isSpanish
        })
      });
    
      console.log('API Response status:', response.status);
      console.log('API Response headers:', response.headers);

      const data = await response.json();
      console.log('API Response data:', data);
      
      if (data.error) {
        console.error('API Error:', data.error, 'Details:', data.details);
        setMessages(prev => [...prev, { 
          text: formatTranslation(
            'chat.errorWithDetails',
            { details: data.details || '' },
            isSpanish ? 'es' : 'en'
          ),
          isUser: false,
          isSpanish: isSpanish
        }]);
        return;
      }
      
      const botResponse = {
        text: data.response,
        isUser: false,
        isSpanish: isSpanish
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error processing response:', error);
setMessages(prev => [...prev, { 
        text: getTranslation('chat.error', isSpanish ? 'es' : 'en'),
        isUser: false,
        isSpanish: isSpanish
      }]);
    }
  };



  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-500 text-white rounded-full p-3 shadow-lg hover:bg-blue-600 transition-colors"
          title={getTranslation('chat.openChat', isSpanish ? 'es' : 'en')}
        >
          💬
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-blue-500 text-white p-3 flex justify-between items-center">
        <h3 className="font-medium">{getTranslation('chat.assistant', isSpanish ? 'es' : 'en')}</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-red-500 rounded-full w-6 h-6 flex items-center justify-center"
          title={getTranslation('common.close', isSpanish ? 'es' : 'en')}
        >
          ✕
        </button>
      </div>
      <div className="p-4">
        {/* Chat Messages */}
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {messages.map((message, index) => (
            <div 
              key={index}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} items-end`}
            >
              <div 
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.isUser 
                    ? 'bg-blue-500 text-white' 
                    : message.isSpanish 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-lg px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={getTranslation('chat.searchPlaceholder', isSpanish ? 'es' : 'en')}
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            {getTranslation('common.send', isSpanish ? 'es' : 'en')}
          </button>
        </form>

        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => setIsSpanish(false)}
            className={`w-16 h-6 text-xs rounded-sm transition-colors ${
              !isSpanish ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            } flex items-center justify-center`}
          >
            English
          </button>
          <button
            onClick={() => setIsSpanish(true)}
            className={`w-16 h-6 text-xs rounded-sm transition-colors ${
              isSpanish ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            } flex items-center justify-center`}
          >
            Español
          </button>
        </div>
      </div>
    </div>
  );
}
