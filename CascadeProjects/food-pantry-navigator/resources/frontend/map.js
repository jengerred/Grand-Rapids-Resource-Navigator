// Map configuration
let map;
let markers = {};
let userLocation = null;

// API keys
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';
const TRANSIT_API_KEY = 'YOUR_TRANSIT_API_KEY';

// Initialize map
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: { lat: 42.9634, lng: -85.6681 }, // Grand Rapids center
        mapTypeId: 'roadmap',
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
            }
        ]
    });

    // Add user location button
    const locateButton = document.createElement('button');
    locateButton.textContent = 'Locate Me';
    locateButton.className = 'locate-button';
    locateButton.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 1000;
        background: white;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
        cursor: pointer;
    `;
    locateButton.onclick = () => getUserLocation();
    document.getElementById('map').appendChild(locateButton);

    // Add resource markers
    addResourceMarkers();
}

// Add resource markers to map
function addResourceMarkers() {
    fetch('http://localhost:8001/api/resources')
        .then(response => response.json())
        .then(data => {
            data.resources.forEach(resource => {
                const position = {
                    lat: resource.latitude,
                    lng: resource.longitude
                };
                
                const marker = new google.maps.Marker({
                    position,
                    map,
                    title: resource.name,
                    icon: getMarkerIcon(resource.categories)
                });
                
                markers[resource.name] = marker;
                
                // Add info window
                const infoWindow = new google.maps.InfoWindow({
                    content: createInfoWindowContent(resource)
                });
                
                marker.addListener('click', () => {
                    infoWindow.open(map, marker);
                    calculateRoutes(resource);
                });
            });
        });
}

// Get marker icon based on category
function getMarkerIcon(categories) {
    if (categories.includes('Food Assistance')) {
        return 'https://maps.google.com/mapfiles/ms/icons/restaurant-dot.png';
    } else if (categories.includes('Housing')) {
        return 'https://maps.google.com/mapfiles/ms/icons/house-dot.png';
    }
    return 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
}

// Create info window content
function createInfoWindowContent(resource) {
    return `
        <div class="info-window">
            <h3>${resource.name}</h3>
            <p>${resource.description}</p>
            <p><strong>Address:</strong> ${resource.address}</p>
            <p><strong>Hours:</strong> ${resource.hours}</p>
            <p><strong>Phone:</strong> ${resource.phone}</p>
            <div class="transport-options">
                ${createTransportOptions(resource)}
            </div>
        </div>
    `;
}

// Create transport options
function createTransportOptions(resource) {
    return resource.get_transportation_options().map(option => `
        <div class="transport-option">
            <h4>${option.name}</h4>
            <p><a href="${option.website}" target="_blank">Website</a></p>
            ${option.routes ? `<p>Routes: ${option.routes.join(', ')}</p>` : ''}
        </div>
    `).join('');
}

// Get user location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                // Update map center
                map.setCenter(userLocation);
                
                // Add user marker
                if (markers['user']) {
                    markers['user'].setPosition(userLocation);
                } else {
                    markers['user'] = new google.maps.Marker({
                        position: userLocation,
                        map,
                        title: 'Your Location',
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 10,
                            fillColor: '#00FF00',
                            fillOpacity: 0.8,
                            strokeColor: '#000000',
                            strokeWeight: 1
                        }
                    });
                }
                
                // Calculate routes to nearby resources
                calculateRoutesToNearbyResources();
            },
            error => {
                console.error('Error getting location:', error);
                alert('Could not get your location. Please enable location services.');
            }
        );
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

// Calculate routes to a resource
function calculateRoutes(resource) {
    if (!userLocation) {
        alert('Please allow location access to calculate routes.');
        return;
    }

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true
    });

    // Calculate walking route
    directionsService.route({
        origin: userLocation,
        destination: {
            lat: resource.latitude,
            lng: resource.longitude
        },
        travelMode: 'WALKING'
    }, (response, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(response);
        }
    });

    // Calculate biking route
    directionsService.route({
        origin: userLocation,
        destination: {
            lat: resource.latitude,
            lng: resource.longitude
        },
        travelMode: 'BICYCLING'
    }, (response, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(response);
        }
    });

    // Calculate transit route
    if (resource.transportation_options.includes('bus')) {
        directionsService.route({
            origin: userLocation,
            destination: {
                lat: resource.latitude,
                lng: resource.longitude
            },
            travelMode: 'TRANSIT',
            transitOptions: {
                modes: ['BUS']
            }
        }, (response, status) => {
            if (status === 'OK') {
                directionsRenderer.setDirections(response);
            }
        });
    }
}

// Calculate routes to nearby resources
function calculateRoutesToNearbyResources() {
    if (!userLocation) return;

    // Find nearby resources
    const nearbyResources = Object.values(markers)
        .filter(marker => marker.position)
        .map(marker => ({
            marker,
            distance: google.maps.geometry.spherical.computeDistanceBetween(
                userLocation,
                marker.position
            )
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5); // Get 5 nearest resources

    // Calculate routes to each nearby resource
    nearbyResources.forEach(resource => {
        calculateRoutes(resource.marker);
    });
}
