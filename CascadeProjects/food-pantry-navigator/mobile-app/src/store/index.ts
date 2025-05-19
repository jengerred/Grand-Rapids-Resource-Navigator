import { configureStore } from '@reduxjs/toolkit';
import resourcesReducer from './resourcesSlice';
import settingsReducer from './settingsSlice';
import favoritesReducer from './favoritesSlice';
import offlineReducer from './offlineSlice';

export const store = configureStore({
  reducer: {
    resources: resourcesReducer,
    settings: settingsReducer,
    favorites: favoritesReducer,
    offline: offlineReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
