export const chatTranslations = {
  en: {
    initialPrompt: 'How can I help you today? You can ask questions like "Where can I find free diapers?"',
    placeholder: 'Type your message...',
    example: 'Where can I find free diapers?',
    userResponse: 'I see you have a question. How can I help you with that?',
    response: 'Hello! How can I assist you today?'
  },
  es: {
    initialPrompt: '¿Cómo puedo ayudarte hoy? Puedes preguntar cosas como "¿Dónde puedo encontrar pañales gratuitos?"',
    placeholder: 'Escribe tu mensaje...',
    example: '¿Dónde puedo encontrar pañales gratuitos?',
    userResponse: '¡Hola! Veo que tienes una pregunta. ¿Cómo puedo ayudarte con eso?',
    response: '¡Hola! ¿Cómo puedo ayudarte hoy?'
  }
};

export function getTranslation(lang: 'en' | 'es', key: keyof typeof chatTranslations['en']): string {
  return chatTranslations[lang][key];
}
