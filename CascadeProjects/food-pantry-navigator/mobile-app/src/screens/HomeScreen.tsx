import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { selectResources, fetchResources } from '../store/resourcesSlice';
import { CategoryFilter } from '../components/CategoryFilter';
import { ResourceCard } from '../components/ResourceCard';

const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const resources = useSelector(selectResources);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchResources());
    setLoading(false);
  }, [dispatch]);

  const updateSearch = (query: string) => {
    setSearchQuery(query);
    filterResources(query);
  };

  const filterResources = (query: string) => {
    const filtered = resources.filter(resource =>
      resource.name.toLowerCase().includes(query.toLowerCase()) ||
      resource.description.toLowerCase().includes(query.toLowerCase()) ||
      resource.categories.some(category => 
        category.toLowerCase().includes(query.toLowerCase())
      )
    );
    setFilteredResources(filtered);
  };

  const renderResourceItem = ({ item }: { item: any }) => (
    <ResourceCard
      resource={item}
      onPress={() => navigation.navigate('ResourceDetails', { resource: item })}
    />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar
        placeholder="Search resources..."
        value={searchQuery}
        onChangeText={updateSearch}
        lightTheme
        containerStyle={styles.searchBarContainer}
        inputContainerStyle={styles.searchBarInput}
      />
      
      <CategoryFilter />
      
      <FlatList
        data={filteredResources}
        renderItem={renderResourceItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchBarContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  searchBarInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  listContainer: {
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
