import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/` }),
  tagTypes: ['Product', 'User'],
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: () => 'products',
      transformResponse: (response) => (Array.isArray(response) ? response : []),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Product', id })), { type: 'Product', id: 'LIST' }]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    getProduct: builder.query({
      query: (productId) => `products/${encodeURIComponent(productId)}`,
      providesTags: (_result, _error, productId) => [{ type: 'Product', id: productId }],
    }),

    createProduct: builder.mutation({
      query: (payload) => ({
        url: 'products',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    updateProduct: builder.mutation({
      query: ({ productId, payload }) => ({
        url: `products/${encodeURIComponent(productId)}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: (_result, _error, { productId }) => [
        { type: 'Product', id: productId },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    deleteProduct: builder.mutation({
      query: (productId) => ({
        url: `products/${encodeURIComponent(productId)}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, productId) => [
        { type: 'Product', id: productId },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    getStaffUsers: builder.query({
      query: () => 'login?role=staff',
      transformResponse: (response) => (Array.isArray(response) ? response : []),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'User', id })), { type: 'User', id: 'LIST' }]
          : [{ type: 'User', id: 'LIST' }],
    }),

    updateUser: builder.mutation({
      query: ({ userId, payload }) => ({
        url: `login/${encodeURIComponent(userId)}?role=staff`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'LIST' },
      ],
    }),

    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `login/${encodeURIComponent(userId)}?role=staff`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, userId) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetStaffUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = productsApi;
