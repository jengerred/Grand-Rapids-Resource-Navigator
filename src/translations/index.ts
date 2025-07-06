interface Translations {
  en: {
    [key: string]: string;
  };
  es: {
    [key: string]: string;
  };
}

export const translations: Translations = {
  en: {
    // Common UI elements
    'common.address': 'Address',
    'common.phone': 'Phone',
    'common.website': 'Website',
    'common.services': 'Services',
    
    // Chatbot responses
    'response.greeting': 'Hello!',
    'response.greeting.full': 'Hello! I\'m your Grand Rapids resource assistant. How can I help you today?',
    'response.thanks': 'You\'re welcome! Is there anything else I can help you with?',
    'response.directions.single': 'To get directions to {resourceName}, click on its marker on the map and select "Get Directions".',
    'response.directions.multiple': 'To get directions to any of these resource locations, click on their markers on the map and select "Get Directions".',
    
    // Follow-up messages
    'response.followup.1': 'Is there anything else I can help you with?',
    'response.followup.2': 'Would you like more information about any of these?',
    'response.followup.3': 'Let me know if you need anything else!',
    
    // Resource type responses
    'response.baby': 'Baby food, diapers, and baby supplies can be expensive - you\'re in luck! Here are some Grand Rapids resources that offer assistance with baby items:',
    'response.food': 'I found these food resources in Grand Rapids that might help you and your family:',
    'response.shelter': 'Here are some shelter and housing resources in Grand Rapids that might be able to assist you:',
    'response.clothing': 'Here are some places in Grand Rapids where you can find clothing assistance:',
    'response.medical': 'I found these medical resources in the Grand Rapids area that might be helpful:',
    'response.default': 'Here are some resources that might help you in Grand Rapids:',
    
    // Hunger-specific responses
    'response.hunger.lunch': 'Here are some places where you can get food right now:', 
    'response.hunger.foodBanks': 'Here are some food banks in the area:',
    'response.hunger.immediateOptions': 'Here are some immediate food options:',
    'response.hunger.family': 'I understand you need food for your family. Here are some resources that can help:',
    'response.help.other': 'I can help you find resources like food, shelter, and other assistance. What do you need help with?',
    
    // Errors
    'error.required': 'Question is required',
    'error.noResources': 'No resources found in the database',
    'error.unknown': 'An unknown error occurred'
  },
  es: {
    // Common UI elements
    'common.address': 'Dirección',
    'common.phone': 'Teléfono',
    'common.website': 'Sitio web',
    'common.services': 'Servicios',
    
    // Chatbot responses
    'response.greeting': '¡Hola!',
    'response.greeting.full': '¡Hola! Soy tu asistente de recursos de Grand Rapids. ¿En qué puedo ayudarte hoy?',
    'response.thanks': '¡De nada! ¿Hay algo más en lo que pueda ayudarte?',
    'response.directions.single': 'Para obtener indicaciones a {resourceName}, haga clic en su marcador en el mapa y seleccione "Obtener indicaciones".',
    'response.directions.multiple': 'Para obtener indicaciones a cualquiera de estos recursos, haga clic en sus marcadores en el mapa y seleccione "Obtener indicaciones".',
    
    // Follow-up messages
    'response.followup.1': '¿Hay algo más en lo que pueda ayudarte?',
    'response.followup.2': '¿Te gustaría más información sobre alguno de estos?',
    'response.followup.3': '¡Avísame si necesitas algo más!',
    
    // Resource type responses
    'response.baby': 'La comida para bebés, pañales y artículos para bebés pueden ser costosos. ¡Tienes suerte! Aquí hay algunos recursos en Grand Rapids que ofrecen ayuda con artículos para bebés:',
    'response.food': 'Encontré estos recursos alimenticios en Grand Rapids que podrían ayudarte a ti y a tu familia:',
    'response.shelter': 'Aquí hay algunos recursos de refugio y vivienda en Grand Rapids que podrían ayudarte:',
    'response.clothing': 'Aquí hay algunos lugares en Grand Rapids donde puedes encontrar asistencia con ropa:',
    'response.medical': 'Encontré estos recursos médicos en el área de Grand Rapids que podrían ser útiles:',
    'response.default': 'Aquí hay algunos recursos que podrían ayudarte en Grand Rapids:',
    
    // Hunger-specific responses
    'response.hunger.lunch': 'Aquí hay algunos lugares donde puede obtener comida ahora mismo:',
    'response.hunger.foodBanks': 'Aquí hay algunos bancos de alimentos en el área:',
    'response.hunger.immediateOptions': 'Aquí hay algunas opciones de comida inmediatas:',
    'response.hunger.family': 'Entiendo que necesita comida para su familia. Aquí hay algunos recursos que pueden ayudar:',
    'response.help.other': 'Puedo ayudarte a encontrar recursos como comida, refugio y otra asistencia. ¿Con qué necesitas ayuda?',
    
    // Errors
    'error.required': 'Se requiere una pregunta',
    'error.noResources': 'No se encontraron recursos en la base de datos',
    'error.unknown': 'Ocurrió un error desconocido'
  }
};

export type Language = keyof typeof translations;

export const defaultLanguage: Language = 'en';

export const languages: Language[] = ['en', 'es'];

export const getTranslation = (key: string, language: Language = 'en'): string => {
  const keys = key.split('.');
  let result: any = translations[language];
  
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k];
    } else {
      // Fall back to English if translation not found
      const enResult = translations.en[key as keyof typeof translations.en];
      return enResult || key;
    }
  }
  
  return result || key;
};

export const formatTranslation = (
  key: string, 
  params: Record<string, string> = {}, 
  language: Language = 'en'
): string => {
  let translation = getTranslation(key, language);
  
  // Replace placeholders with actual values
  Object.entries(params).forEach(([param, value]) => {
    translation = translation.replace(`{${param}}`, value);
  });
  
  return translation;
};
