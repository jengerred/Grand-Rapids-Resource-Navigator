'use client';

import { useState } from 'react';

interface Message {
  text: string;
  isUser: boolean;
  isSpanish: boolean;
}

export function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: '¿Cómo puedo ayudarte hoy? Puedes preguntar cosas como "¿Dónde puedo encontrar pañales gratuitos?"',
      isUser: false,
      isSpanish: true
    },
    {
      text: 'How can I help you today? You can ask questions like "Where can I find free diapers?"',
      isUser: false,
      isSpanish: false
    }
  ]);
  const [input, setInput] = useState('');
  const [isSpanish, setIsSpanish] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages(prev => [...prev, { text: input, isUser: true, isSpanish }]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const response = isSpanish 
        ? '¡Hola! ¿Cómo puedo ayudarte hoy?'
        : 'Hello! How can I assist you today?';
      setMessages(prev => [...prev, { text: response, isUser: false, isSpanish }]);
    }, 1000);
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

        {/* Language Toggle */}
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
