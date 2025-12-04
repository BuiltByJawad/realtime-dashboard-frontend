import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api';

export const baseQuery = fetchBaseQuery({
    baseUrl,
    credentials: 'include',
    prepareHeaders: (headers) => {
        headers.set('Content-Type', 'application/json');
        return headers;
    },
});