import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Resource } from '../types';

interface ResourceCardProps {
  resource: Resource;
  onPress: () => void;
}

const ResourceCard = ({ resource, onPress }: ResourceCardProps) => {
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'food pantry':
        return 'restaurant';
      case 'housing':
        return 'home';
      case 'health':
        return 'local-hospital';
      case 'transportation':
        return 'directions-bus';
      case 'education':
        return 'school';
      default:
        return 'info';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <MaterialIcons
          name={getCategoryIcon(resource.categories[0])}
          size={24}
          color="#007AFF"
        />
        <Text style={styles.cardTitle}>{resource.name}</Text>
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.cardDescription}>{resource.description}</Text>
        
        <View style={styles.infoRow}>
          <MaterialIcons name="location-on" size={16} color="#666" />
          <Text style={styles.infoText}>{resource.address}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialIcons name="access-time" size={16} color="#666" />
          <Text style={styles.infoText}>{resource.hours}</Text>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.categoryText}>
          {resource.categories.join(', ')}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  cardContent: {
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
  },
});

export { ResourceCard };
