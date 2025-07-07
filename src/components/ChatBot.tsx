'use client';

// TODO: Add backend Python with AI integration later
import { useState, useEffect, useRef } from 'react';
import { getTranslation, formatTranslation } from '@/lib/appTranslations';

interface Resource {
  id: string;
  name: string;
  address: string;
  city: string;
  services: string[];
  phone?: string;
  website?: string;
}

interface Message {
  text: string;
  isUser: boolean;
  isSpanish: boolean;
  resources?: Resource[];
  timestamp?: Date;
}

interface ChatBotProps {
  isSpanish: boolean;
}

export function ChatBot({ isSpanish: appSpanish }: ChatBotProps) {
  const [isSpanish, setIsSpanish] = useState(appSpanish);
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>(() => [{
    text: getTranslation('chat.welcome', appSpanish ? 'es' : 'en'),
    isUser: false,
    isSpanish: appSpanish,
    timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update welcome message when language changes
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 0 || (prev.length === 1 && !prev[0].isUser)) {
        return [{
          text: getTranslation('chat.welcome', isSpanish ? 'es' : 'en'),
          isUser: false,
          isSpanish: isSpanish,
          timestamp: new Date()
        }];
      }
      return prev;
    });
  }, [isSpanish]);

  // Sync with app language changes
  useEffect(() => {
    setIsSpanish(appSpanish);
  }, [appSpanish]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    };
    
    const timer = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timer);
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const message = input.trim();
    if (!message) return;

    const userMessage: Message = {
      text: message,
      isUser: true,
      isSpanish: isSpanish,
      timestamp: new Date()
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
          question: message,
          language: isSpanish ? 'es' : 'en'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const botResponse: Message = {
        text: (data.answer || data.response || getTranslation('chat.noResponse', isSpanish ? 'es' : 'en')) as string,
        isUser: false,
        isSpanish: isSpanish,
        resources: (data.relevantResources || []) as Resource[],
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error processing response:', error);
      const errorMessage: Message = {
        text: formatTranslation(
          'chat.errorWithDetails',
          { details: error instanceof Error ? error.message : 'Unknown error' },
          isSpanish ? 'es' : 'en'
        ) as string,
        isUser: false,
        isSpanish: isSpanish,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
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
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col" style={{
      minHeight: '140px',
      maxHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      transition: 'height 0.3s ease',
      height: 'auto'
    }}>
      <div className="bg-blue-500 text-white p-1.5 flex justify-between items-center">
        <h3 className="font-medium text-sm">{getTranslation('chat.assistant', isSpanish ? 'es' : 'en')}</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-red-500 rounded-full w-6 h-6 flex items-center justify-center"
          title={getTranslation('common.close', isSpanish ? 'es' : 'en')}
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col" style={{
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }}>
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {messages.map((message, index) => (
              <div key={index} className="py-0.5">
                <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} items-start`}>
                  <div 
                    className={`rounded-lg px-3 py-1 max-w-[90%] ${message.isUser ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}
                    style={{ 
                      wordBreak: 'break-word',
                      lineHeight: '1.5',
                      fontSize: '0.9375rem',
                      whiteSpace: 'pre-line',
                      padding: '0.5rem 0.75rem',
                      margin: '0.25rem 0'
                    }}
                    dangerouslySetInnerHTML={{ 
                      __html: message.text
                        .replace(/\n/g, '<br />')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    }} 
                  />
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} className="h-2" />
          </div>
        </div>
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2 p-2 border-t">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-lg px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={getTranslation('chat.searchPlaceholder', isSpanish ? 'es' : 'en')}
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {getTranslation('common.send', isSpanish ? 'es' : 'en')}
          </button>
        </form>

        <div className="mt-2 mb-3 flex justify-center gap-2">
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
      <style jsx global>{`
        .resource-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.25rem;
          padding: 0.75rem 1rem;
          margin: 0.5rem 0;
          font-size: 0.8125rem;
          line-height: 1.5;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        .resource-card h4 {
          font-weight: 600;
          margin: 0;
          padding: 0.25rem 0.5rem;
          color: #111827;
          font-size: 0.875rem;
          border-bottom: 1px solid #f3f4f6;
        }
        .resource-line, .resource-card > div {
          color: #4b5563;
          font-size: 0.8125rem;
          line-height: 1.5;
          display: flex;
          align-items: center;
          margin: 0.125rem 0;
          padding: 0.125rem 0;
        }
        .emoji {
          display: inline-block;
          width: 1em;
          text-align: center;
          margin-right: 0.5em;
          font-size: 0.8em;
          vertical-align: middle;
          line-height: 1;
        }
        .resource-card a {
          color: #2563eb;
          text-decoration: none;
        }
        .resource-card a:hover {
          text-decoration: underline;
        }
        .resource-card .flex {
          display: flex;
          align-items: center;
          margin: 0;
          padding: 0;
        }
        .resource-card .mr-2 {
          margin-right: 0.25rem;
        }
        .prose.prose-sm {
          max-width: none;
        }
      `}</style>
    </div>
  );
}
