import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as StoreProvider } from 'react-redux';
import { store } from './src/store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import ResourcesScreen from './src/screens/ResourcesScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Components
import TabBarIcon from './src/components/TabBarIcon';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <StoreProvider store={store}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => (
                  <TabBarIcon
                    name={
                      route.name === 'Home'
                        ? 'home'
                        : route.name === 'Map'
                        ? 'map'
                        : route.name === 'Resources'
                        ? 'list'
                        : 'user'
                    }
                    focused={focused}
                    color={color}
                  />
                ),
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: 'gray',
              })}
            >
              <Tab.Screen name="Home" component={HomeScreen} />
              <Tab.Screen name="Map" component={MapScreen} />
              <Tab.Screen name="Resources" component={ResourcesScreen} />
              <Tab.Screen name="Profile" component={ProfileScreen} />
            </Tab.Navigator>
          </NavigationContainer>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </StoreProvider>
  );
};

export default App;
