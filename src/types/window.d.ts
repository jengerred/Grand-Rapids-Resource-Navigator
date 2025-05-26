import { Icon } from 'leaflet';

interface Window {
  leafletRedIcon?: Icon;
}

// Declare the global window object
declare global {
  interface Window {
    leafletRedIcon?: Icon;
  }
}
