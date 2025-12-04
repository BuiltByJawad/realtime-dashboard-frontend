import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { analyticsApi } from '@/features/analytics/api/analyticsApi';
import { authApi } from '@/features/auth/api/authApi';
import { productsApi } from '@/features/products/api/productsApi';

export const store = configureStore({
    reducer: {
        [authApi.reducerPath]: authApi.reducer,
        [productsApi.reducerPath]: productsApi.reducer,
        [analyticsApi.reducerPath]: analyticsApi.reducer,
    },
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware().concat(
            authApi.middleware, 
            productsApi.middleware,
            analyticsApi.middleware,
        ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;