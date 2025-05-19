import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Resource } from '../types';
import { fetchResourcesFromApi } from '../services/resourceService';

export interface ResourcesState {
  items: Resource[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  filters: {
    category: string[];
    distance: number;
    status: string[];
  };
}

const initialState: ResourcesState = {
  items: [],
  status: 'idle',
  error: null,
  filters: {
    category: [],
    distance: 5000, // 5km default
    status: [],
  },
};

export const fetchResources = createAsyncThunk(
  'resources/fetchResources',
  async () => {
    const response = await fetchResourcesFromApi();
    return response.data;
  }
);

export const resourcesSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    addResource: (state, action) => {
      state.items.push(action.payload);
    },
    updateResource: (state, action) => {
      const index = state.items.findIndex(
        (resource) => resource.id === action.payload.id
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    removeResource: (state, action) => {
      state.items = state.items.filter(
        (resource) => resource.id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchResources.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchResources.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch resources';
      });
  },
});

export const {
  setFilters,
  addResource,
  updateResource,
  removeResource,
} = resourcesSlice.actions;

export const selectResources = (state: { resources: ResourcesState }) =>
  state.resources.items;

export const selectResourcesStatus = (state: { resources: ResourcesState }) =>
  state.resources.status;

export const selectResourcesError = (state: { resources: ResourcesState }) =>
  state.resources.error;

export const selectResourcesFilters = (state: { resources: ResourcesState }) =>
  state.resources.filters;

export default resourcesSlice.reducer;
