'use client';

import { useState, useEffect } from 'react';

interface Message {
  text: string;
  isUser: boolean;
  isSpanish: boolean;
}

interface ChatBotProps {
  isSpanish: boolean;
}

export function ChatBot({ isSpanish: appSpanish }: ChatBotProps) {
  const [isSpanish, setIsSpanish] = useState(appSpanish); // Start with app-wide language but maintain separate state
  const [messages, setMessages] = useState<Message[]>([
    {
      text: appSpanish 
        ? '¿Cómo puedo ayudarte hoy? Puedes hacer preguntas como "¿Dónde puedo encontrar pañales gratuitos?"'
        : 'How can I help you today? You can ask questions like "Where can I find free diapers?"',
      isUser: false,
      isSpanish: appSpanish
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Update messages when language changes
  const updateMessages = (newIsSpanish: boolean) => {
    setMessages([{
      text: newIsSpanish 
        ? '¿Cómo puedo ayudarte hoy? Puedes hacer preguntas como "¿Dónde puedo encontrar pañales gratuitos?"'
        : 'How can I help you today? You can ask questions like "Where can I find free diapers?"',
      isUser: false,
      isSpanish: newIsSpanish
    }]);
  };

  // Update messages when language changes (either from app or local state)
  useEffect(() => {
    // Update both local state and messages when appSpanish changes
    setIsSpanish(appSpanish);
    updateMessages(appSpanish);
  }, [appSpanish]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      text: isSpanish 
        ? input // If Spanish, send as is
        : input, // For now, send English as is - we'll add translation later
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
          text: isSpanish 
            ? `Lo siento, hubo un error procesando su solicitud. ${data.details ? `Detalles: ${data.details}` : ''}`
            : `Sorry, there was an error processing your request. ${data.details ? `Details: ${data.details}` : ''}`,
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
        text: isSpanish 
          ? 'Lo siento, hubo un error procesando su solicitud. Por favor, inténtelo de nuevo.'
          : 'Sorry, there was an error processing your request. Please try again.',
        isUser: false,
        isSpanish: isSpanish
      }]);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-lg p-4">
      <div className="space-y-4">
        {/* Chat Messages */}
        <div className="space-y-2 h-[300px] overflow-y-auto">
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
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-lg px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={isSpanish ? 'Escribe tu mensaje...' : 'Type your message...'}
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            Send
          </button>
        </form>


        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => setIsSpanish(false)}
            className={`w-16 h-6 text-xs rounded-sm transition-colors ${
              !isSpanish ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-600 hover:bg-green-500 hover:text-white'
            } flex items-center justify-center`}
          >
            English
          </button>
          <button
            onClick={() => setIsSpanish(true)}
            className={`w-16 h-6 text-xs rounded-sm transition-colors ${
              isSpanish ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-600 hover:bg-green-500 hover:text-white'
            } flex items-center justify-center`}
          >
            Español
          </button>
        </div>
      </div>
    </div>
  );
}
