interface TimeTranslations {
  hours: string;
  minutes: string;
  seconds: string;
}

interface DistanceTranslations {
  meters: string;
  kilometers: string;
  miles: string;
  feet: string;
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
  time: TimeTranslations;
  distance: DistanceTranslations;
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

interface LanguageTranslations {
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
}

export function getTranslation(key: string, lang: 'en' | 'es'): string {
  const parts = key.split('.');
  let current: unknown = appTranslations[lang];
  
  for (const part of parts) {
    if (current && typeof current === 'object' && !Array.isArray(current) && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }
  
  return typeof current === 'string' ? current : key;
}

export function getRoutingTranslation(key: keyof RoutingTranslations, lang: 'en' | 'es'): string {
  const translation = appTranslations[lang].routing[key];
  if (typeof translation === 'string') return translation;
  return key;
}

export const appTranslations: { [key: string]: LanguageTranslations } = {
  en: {
    welcome: 'Welcome to the Food Pantry Navigator',
    search: 'Search',
    resources: 'Resources',
    language: 'Language',
    english: 'English',
    spanish: 'Español',
    searchPlaceholder: 'Search for resources...',
    languageToggle: 'Toggle Language',
    description: 'Find resources and plan your route in Grand Rapids',
    shareLocation: 'Share your location to find nearby resources',
    share: 'Share',
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
    welcome: 'Bienvenido al Navegador de Bancos de Alimentos',
    search: 'Buscar',
    resources: 'Recursos',
    language: 'Idioma',
    english: 'Inglés',
    spanish: 'Español',
    searchPlaceholder: 'Buscar recursos...',
    languageToggle: 'Cambiar Idioma',
    description: 'Encuentra recursos y planifica tu ruta en Grand Rapids',
    shareLocation: 'Comparte tu ubicación para encontrar recursos cercanos',
    share: 'Compartir',
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
