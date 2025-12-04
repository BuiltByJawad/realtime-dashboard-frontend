import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@/lib/http/baseQuery';
import {
  Product,
  CreateProductInput,
  UpdateProductInput,
} from '../types';

interface ProductsResponse {
    success: boolean;
    data: Product[];
}

interface ProductResponse {
    success: boolean;
    data: Product;
}

export const productsApi = createApi({
    reducerPath: 'productsApi',
    baseQuery,
    tagTypes: ['Products'],
    endpoints: (builder) => ({
        getProducts: builder.query<ProductsResponse, void>({
            query: () => ({
                url: '/products',
                method: 'GET',
            }),
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map((p) => ({ type: 'Products' as const, id: p.id })),
                        { type: 'Products' as const, id: 'LIST' },
                    ]
                : [{ type: 'Products' as const, id: 'LIST' }],
        }),
        createProduct: builder.mutation<ProductResponse, CreateProductInput>({
            query: (body) => ({
                url: '/products',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'Products', id: 'LIST' }],
        }),
        updateProduct: builder.mutation<ProductResponse, { id: string; body: UpdateProductInput }>({
            query: ({ id, body }) => ({
                url: `/products/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Products', id: arg.id },
                { type: 'Products', id: 'LIST' },
            ],
        }),
        deleteProduct: builder.mutation<void, string>({
            query: (id) => ({
                url: `/products/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Products', id },
                { type: 'Products', id: 'LIST' },
            ],
        }),
        changeStatus: builder.mutation<ProductResponse, { id: string; status: 'active' | 'inactive' }>({
            query: ({ id, status }) => ({
                url: `/products/${id}/status`,
                method: 'PATCH',
                body: { status },
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Products', id: arg.id },
                { type: 'Products', id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useGetProductsQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useChangeStatusMutation,
} = productsApi;