import { configureStore, combineReducers } from '@reduxjs/toolkit';
import userReducer from './user/userSlice';
import themeReducer from './theme/themeSlice';
import cartReducer from './cartSlice'; // Import the cartSlice
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import persistStore from 'redux-persist/es/persistStore';

// Combine all the reducers (user, theme, and cart)
const rootReducer = combineReducers({
    user: userReducer,
    theme: themeReducer,
    cart: cartReducer, // Add cart slice here
});

// Persist configuration for Redux Persist
const persistConfig = {
    key: 'root',
    storage,
    version: 1,
};

// Wrap the rootReducer with persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the Redux store
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // Disable warnings for non-serializable data
        }),
});

// Create the persistor
export const persistor = persistStore(store);
