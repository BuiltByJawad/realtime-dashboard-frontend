import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@/lib/http/baseQuery';
import { AuthUser, LoginRequest, LoginResponse } from '../types';

interface MeResponse {
    success: boolean;
    user: AuthUser;
}

interface LogoutResponse {
  success: boolean;
}

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery,
    tagTypes: ['Auth'],
    endpoints: (builder) => ({
        login: builder.mutation<LoginResponse, LoginRequest>({
            query: (body) => ({
                url: '/auth/login',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Auth'],
        }),
        me: builder.query<MeResponse, void>({
            query: () => ({
                url: '/auth/me',
                method: 'GET',
            }),
            providesTags: ['Auth'],
        }),
        logout: builder.mutation<LogoutResponse, void>({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
            invalidatesTags: ['Auth'],
        }),
    }),
});

export const { useLoginMutation, useMeQuery, useLogoutMutation } = authApi;