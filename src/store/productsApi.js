import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/` }),
  tagTypes: ['Product'],
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
  }),
})

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi
