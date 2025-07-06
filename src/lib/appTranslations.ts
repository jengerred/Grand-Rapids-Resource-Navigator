interface TranslationMap {
  [key: string]: string | TranslationMap | any;
}

interface RoutingTranslations {
  title: string;
  driving: string;
  walking: string;
  cycling: string;
  transit: string;
  biking: string;
  start: string;
  end: string;
  route: string;
  chooseRoute: string;
  chooseRouteMethod: string;
  totalTime: string;
  totalDistance: string;
  routeInstructions: string;
  step: string;
  duration: string;
  distanceLabel: string;
  calculate: string;
  clear: string;
  searchLocation: string;
  currentLocation: string;
  time: {
    hours: string;
    minutes: string;
    seconds: string;
  };
  distance: {
    meters: string;
    kilometers: string;
    miles: string;
    feet: string;
  };
  transportModes: {
    car: string;
    bike: string;
    walk: string;
    bus: string;
    scooter: string;
    uber: string;
    lyft: string;
    mdo: string;
  };
}

export interface Translations {
  en: {
    common: {
      address: string;
      phone: string;
      website: string;
      phoneNotAvailable: string;
      websiteNotAvailable: string;
      variousServices: string;
      close: string;
      send: string;
    };
    chat: {
      welcome: string;
      openChat: string;
      assistant: string;
      searchPlaceholder: string;
      resourceItem: string;
      error: string;
      errorWithDetails: string;
      context: {
        header: string;
        servicesHeader: string;
        serviceItem: string;
        resourcesHeader: string;
        resourceItem: string;
      };
    };
    response: {
      welcome: string;
      default: string;
      baby: string;
      food: string;
      shelter: string;
      clothing: string;
      medical: string;
      directions: {
        single: string;
        multiple: string;
      };
      followup: {
        1: string;
        2: string;
        3: string;
        4: string;
      };
    };
    error: {
      general: string;
      noResourcesFound: string;
    };
    welcome: string;
    search: string;
    resources: string;
    language: string;
    english: string;
    spanish: string;
    searchPlaceholder: string;
    languageToggle: string;
    description: string;
    shareLocation: string;
    share: string;
    stopSharing: string;
    notNow: string;
    offlineResources: string;
    map: {
      start: string;
      currentLocation: string;
      route: string;
    };
    popup: {
      services: string;
      hours: string;
    };
    routing: RoutingTranslations;
  };
  es: {
    common: {
      address: string;
      phone: string;
      website: string;
      phoneNotAvailable: string;
      websiteNotAvailable: string;
      variousServices: string;
      close: string;
      send: string;
    };
    chat: {
      welcome: string;
      openChat: string;
      assistant: string;
      searchPlaceholder: string;
      resourceItem: string;
      error: string;
      errorWithDetails: string;
      context: {
        header: string;
        servicesHeader: string;
        serviceItem: string;
        resourcesHeader: string;
        resourceItem: string;
      };
    };
    response: {
      welcome: string;
      default: string;
      baby: string;
      food: string;
      shelter: string;
      clothing: string;
      medical: string;
      directions: {
        single: string;
        multiple: string;
      };
      followup: {
        1: string;
        2: string;
        3: string;
        4: string;
      };
    };
    error: {
      general: string;
      noResourcesFound: string;
    };
    welcome: string;
    search: string;
    resources: string;
    language: string;
    english: string;
    spanish: string;
    searchPlaceholder: string;
    languageToggle: string;
    description: string;
    shareLocation: string;
    share: string;
    stopSharing: string;
    notNow: string;
    offlineResources: string;
    map: {
      start: string;
      currentLocation: string;
      route: string;
    };
    popup: {
      services: string;
      hours: string;
    };
    routing: RoutingTranslations;
  };
}

// Helper function to get a translation
export function getTranslation(key: string, language: 'en' | 'es' = 'en'): string {
  const keys = key.split('.');
  let value: any = appTranslations[language];
  
  for (const k of keys) {
    if (value && value[k] !== undefined) {
      value = value[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key; // Return the key as fallback
    }
  }
  
  return typeof value === 'string' ? value : JSON.stringify(value);
}

// Helper function to format a translation with parameters
export function formatTranslation(
  key: string, 
  params: Record<string, string> = {}, 
  language: 'en' | 'es' = 'en'
): string {
  let translation = getTranslation(key, language);
  
  // Replace placeholders with actual values
  Object.entries(params).forEach(([param, value]) => {
    translation = translation.replace(new RegExp(`\\{${param}\\}`, 'g'), value || '');
  });
  
  return translation;
}

export function getRoutingTranslation(key: keyof RoutingTranslations, lang: 'en' | 'es' = 'en'): string {
  const translation = appTranslations[lang].routing[key];
  if (typeof translation === 'string') return translation;
  return key;
}

export const appTranslations: Translations = {
  en: {
    common: {
      address: 'Address: {address}, {city}',
      phone: 'Phone: {phone}',
      website: 'Website: {website}',
      phoneNotAvailable: 'Phone not available',
      websiteNotAvailable: 'No website available',
      variousServices: 'Various services',
      close: 'Close',
      send: 'Send'
    },
    chat: {
      welcome: 'How can I help you today? You can ask questions like "Where can I find free diapers?"',
      openChat: 'Open chat',
      assistant: 'Assistant',
      searchPlaceholder: 'Type your message here...',
      resourceItem: '• {name}\n  📍 {address}\n  📞 {phone}\n  {website}',
      error: 'Sorry, there was an error processing your request. Please try again.',
      errorWithDetails: 'Sorry, there was an error processing your request. {details}',
      context: {
        header: 'Available services and their providers:',
        servicesHeader: 'SERVICES AND PROVIDERS:',
        serviceItem: '- {service}: {providers}',
        resourcesHeader: 'DETAILED RESOURCE INFORMATION:',
        resourceItem: 'RESOURCE: {name}\nLocation: {address}, {city}\nPhone: {phone}\nWebsite: {website}\nServices: {services}'
      }
    },
    response: {
      welcome: 'How can I help you today? You can ask questions like "Where can I find free diapers?"',
      default: 'Here are some resources that might help you in Grand Rapids:',
      baby: 'Baby food, diapers, and baby supplies can be expensive - you\'re in luck! Here are some Grand Rapids resources that offer assistance with baby items:',
      food: 'I found these food resources in Grand Rapids that might help you and your family:',
      shelter: 'Here are some shelter and housing resources in Grand Rapids that might be able to assist you:',
      clothing: 'Here are some places in Grand Rapids where you can find clothing assistance:',
      medical: 'I found these medical resources in the Grand Rapids area that might be helpful:',
      directions: {
        single: 'To get directions to {resourceName}, click on its marker on the map and select "Get Directions".',
        multiple: 'To get directions to any of these resource locations, click on their markers on the map and select "Get Directions".'
      },
      followup: {
        1: 'Is there anything else I can help you with?',
        2: 'Would you like more information about any of these?',
        3: 'Let me know if you need anything else!',
        4: 'Can I help you with anything else today?'
      }
    },
    error: {
      general: 'Sorry, there was an error processing your request. Please try again.',
      noResourcesFound: 'No resources were found matching your criteria.'
    },
    welcome: 'Grand Rapids Resource Navigator',
    search: 'Search',
    resources: 'Resources',
    language: 'Language',
    english: 'English',
    spanish: 'Español',
    searchPlaceholder: 'Search for resources...',
    languageToggle: 'Toggle Language',
    description: 'Find resources and plan your route in Grand Rapids',
    shareLocation: 'Share your location to get directions to nearby resources',
    share: 'Share',
    stopSharing: 'Stop Sharing',
    notNow: 'Close',
    offlineResources: 'View offline resources',
    map: {
      start: 'Start',
      currentLocation: 'Your location',
      route: 'Directions'
    },
    popup: {
      services: 'Services',
      hours: 'Hours'
    },
    routing: {
      title: 'How do you want to get there?',
      driving: 'Driving',
      walking: 'Walking',
      cycling: 'Cycling',
      transit: 'Transit',
      biking: 'Biking',
      start: 'Start',
      end: 'End',
      route: 'Directions',
      chooseRoute: 'Choose your route',
      chooseRouteMethod: 'Choose your route method',
      totalTime: 'Total time',
      totalDistance: 'Total distance',
      routeInstructions: 'Route Instructions',
      step: 'Step',
      duration: 'Duration',
      distanceLabel: 'Distance',
      calculate: 'Calculate',
      clear: 'Clear',
      searchLocation: 'Search location...',
      currentLocation: 'Use current location',
      time: {
        hours: 'hours',
        minutes: 'minutes',
        seconds: 'seconds'
      },
      distance: {
        meters: 'meters',
        kilometers: 'kilometers',
        miles: 'miles',
        feet: 'feet'
      },
      transportModes: {
        car: 'Car',
        bike: 'Bike',
        walk: 'Walk',
        bus: 'Bus',
        scooter: 'Scooter',
        uber: 'Uber',
        lyft: 'Lyft',
        mdo: 'MDO Carshare'
      }
    }
  },
  es: {
    common: {
      address: 'Dirección: {address}, {city}',
      phone: 'Teléfono: {phone}',
      website: 'Sitio web: {website}',
      phoneNotAvailable: 'Teléfono no disponible',
      websiteNotAvailable: 'Sitio web no disponible',
      variousServices: 'Varios servicios',
      close: 'Cerrar',
      send: 'Enviar'
    },
    chat: {
      welcome: '¿Cómo puedo ayudarte hoy? Puedes hacer preguntas como "¿Dónde puedo encontrar pañales gratuitos?"',
      openChat: 'Abrir chat',
      assistant: 'Asistente',
      searchPlaceholder: 'Escribe tu mensaje aquí...',
      resourceItem: '• {name}\n  📍 {dirección}\n  📞 {teléfono}\n  {sitio web}',
      error: 'Lo siento, hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo.',
      errorWithDetails: 'Lo siento, hubo un error al procesar tu solicitud. {details}',
      context: {
        header: 'Servicios disponibles y sus proveedores:',
        servicesHeader: 'SERVICIOS Y PROVEEDORES:',
        serviceItem: '- {service}: {providers}',
        resourcesHeader: 'INFORMACIÓN DETALLADA DEL RECURSO:',
        resourceItem: 'RECURSO: {name}\nUbicación: {address}, {city}\nTeléfono: {phone}\nSitio web: {website}\nServicios: {services}'
      }
    },
    response: {
      welcome: '¿Cómo puedo ayudarte hoy? Puedes hacer preguntas como "¿Dónde puedo encontrar pañales gratuitos?"',
      default: 'Aquí hay algunos recursos que podrían ayudarte en Grand Rapids:',
      baby: 'La comida para bebés, los pañales y los artículos para bebés pueden ser costosos. ¡Tienes suerte! Aquí tienes algunos recursos en Grand Rapids que ofrecen ayuda con artículos para bebés:',
      food: 'Encontré estos recursos de alimentos en Grand Rapids que podrían ayudarte a ti y a tu familia:',
      shelter: 'Aquí hay algunos recursos de refugio y vivienda en Grand Rapids que podrían ayudarte:',
      clothing: 'Aquí hay algunos lugares en Grand Rapids donde puedes encontrar asistencia con ropa:',
      medical: 'Encontré estos recursos médicos en el área de Grand Rapids que podrían ser útiles:',
      directions: {
        single: 'Para obtener indicaciones para llegar a {resourceName}, haz clic en su marcador en el mapa y selecciona "Obtener indicaciones".',
        multiple: 'Para obtener indicaciones para llegar a cualquiera de estas ubicaciones de recursos, haz clic en sus marcadores en el mapa y selecciona "Obtener indicaciones".'
      },
      followup: {
        1: '¿Hay algo más en lo que pueda ayudarte?',
        2: '¿Te gustaría más información sobre alguno de estos?',
        3: '¡Avísame si necesitas algo más!',
        4: '¿Puedo ayudarte con algo más hoy?'
      }
    },
    error: {
      general: 'Lo siento, hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo.',
      noResourcesFound: 'No se encontraron recursos que coincidan con tus criterios.'
    },
    welcome: 'Navegador de Recursos de Grand Rapids',
    search: 'Buscar',
    resources: 'Recursos',
    language: 'Idioma',
    english: 'Inglés',
    spanish: 'Español',
    searchPlaceholder: 'Buscar recursos...',
    languageToggle: 'Cambiar Idioma',
    description: 'Encuentra recursos y planifica tu ruta en Grand Rapids',
    shareLocation: 'Comparte tu ubicación para obtener direcciones a recursos cercanos',
    share: 'Compartir',
    stopSharing: 'Dejar de compartir',
    notNow: 'Cerrar',
    offlineResources: 'Ver recursos sin conexión',
    map: {
      start: 'Inicio',
      currentLocation: 'Tu ubicación',
      route: 'Obtener Direcciones'
    },
    popup: {
      services: 'Servicios',
      hours: 'Horas'
    },
    routing: {
      title: '¿Cómo quieres llegar?',
      driving: 'Manejando',
      walking: 'Caminando',
      cycling: 'En bicicleta',
      transit: 'Transporte Público',
      biking: 'En Bicicleta',
      start: 'Inicio',
      end: 'Fin',
      route: 'Direcciones',
      chooseRoute: 'Elige tu ruta',
      chooseRouteMethod: 'Elige tu método de ruta',
      totalTime: 'Tiempo total',
      totalDistance: 'Distancia total',
      routeInstructions: 'Instrucciones de Ruta',
      step: 'Paso',
      duration: 'Duración',
      distanceLabel: 'Distancia',
      calculate: 'Calcular',
      clear: 'Limpiar',
      searchLocation: 'Buscar ubicación...',
      currentLocation: 'Usar ubicación actual',
      time: {
        hours: 'horas',
        minutes: 'minutos',
        seconds: 'segundos'
      },
      distance: {
        meters: 'metros',
        kilometers: 'kilómetros',
        miles: 'millas',
        feet: 'metros' // Using meters for Spanish
      },
      transportModes: {
        car: 'Auto',
        bike: 'Bicicleta',
        walk: 'Caminar',
        bus: 'Autobús',
        scooter: 'Monopatín',
        uber: 'Uber',
        lyft: 'Lyft',
        mdo: 'Coche compartido MDO'
      }
    }
  }
};
