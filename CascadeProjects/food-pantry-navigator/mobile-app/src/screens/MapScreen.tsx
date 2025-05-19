import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { selectResources } from '../store/resourcesSlice';
import { ResourceMarker } from '../components/ResourceMarker';
import { CategoryFilter } from '../components/CategoryFilter';
import { getDirections } from '../services/navigationService';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const MapScreen = () => {
  const navigation = useNavigation();
  const resources = useSelector(selectResources);
  const [selectedResource, setSelectedResource] = useState(null);
  const [userLocation, setUserLocation] = useState({
    latitude: 42.9634,
    longitude: -85.6681,
  });
  const [directions, setDirections] = useState(null);

  useEffect(() => {
    // Get user location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => console.log(error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  }, []);

  const handleResourceSelect = (resource: any) => {
    setSelectedResource(resource);
    getDirections(userLocation, {
      latitude: resource.latitude,
      longitude: resource.longitude,
    }).then(setDirections);
  };

  const renderMarkers = () => {
    return resources.map((resource: any) => (
      <ResourceMarker
        key={resource.id}
        resource={resource}
        onPress={() => handleResourceSelect(resource)}
      />
    ));
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
      >
        {renderMarkers()}
        {directions && (
          <Polyline
            coordinates={directions}
            strokeColor="#007AFF"
            strokeWidth={3}
          />
        )}
      </MapView>
      
      <CategoryFilter />
      
      {selectedResource && (
        <View style={styles.resourceInfo}>
          <Text style={styles.resourceName}>{selectedResource.name}</Text>
          <Text style={styles.resourceAddress}>{selectedResource.address}</Text>
          <TouchableOpacity
            style={styles.directionsButton}
            onPress={() => {
              // Open native maps
              navigation.navigate('ResourceDetails', { resource: selectedResource });
            }}
          >
            <Text style={styles.buttonText}>Get Directions</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  resourceInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  resourceName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  resourceAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  directionsButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default MapScreen;
