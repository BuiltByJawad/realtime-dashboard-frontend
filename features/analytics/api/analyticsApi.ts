import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@/lib/http/baseQuery';
import { OverviewAnalyticsResponse } from '../types';

export const analyticsApi = createApi({
    reducerPath: 'analyticsApi',
    baseQuery,
    tagTypes: ['Analytics'],
    endpoints: (builder) => ({
        getOverview: builder.query<OverviewAnalyticsResponse, void>({
            query: () => ({
                url: '/analytics/overview',
                method: 'GET',
            }),
            providesTags: ['Analytics'],
        }),
    }),
});

export const { useGetOverviewQuery } = analyticsApi;