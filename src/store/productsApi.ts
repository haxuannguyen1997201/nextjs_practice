import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ApiUser } from '../models/user';
import { getApiBaseUrl } from '../utils/env';

// API Response Types
export interface ApiProduct {
  id: string;
  productName: string;
  image?: string;
  summary?: string;
  price: number;
  color?: string;
  createdAt?: string;
}

// Use ApiUser for staff user operations
export type StaffUser = Omit<ApiUser, 'password'>;

export interface StaffUserResponse extends ApiUser {
  password?: string;
}

interface ProductsApiTags {
  type: 'Product' | 'User';
  id?: string;
}

interface ProductMutationArgs {
  productId: string;
  payload: Partial<ApiProduct>;
}

interface UserMutationArgs {
  userId: string;
  payload: Partial<StaffUser & { password: string }>;
}

interface UserCreateArgs {
  payload: Partial<ApiUser>;
}

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${getApiBaseUrl()}/` }),
  tagTypes: ['Product', 'User'],
  endpoints: (builder) => ({
    getProducts: builder.query<ApiProduct[], void>({
      query: () => 'products',
      transformResponse: (response: unknown) => {
        return Array.isArray(response) ? (response as ApiProduct[]) : [];
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Product' as const, id })), { type: 'Product' as const, id: 'LIST' }]
          : [{ type: 'Product' as const, id: 'LIST' }],
    }),

    getProduct: builder.query<ApiProduct, string>({
      query: (productId) => `products/${encodeURIComponent(productId)}`,
      providesTags: (_result, _error, productId) => [{ type: 'Product' as const, id: productId }],
    }),

    createProduct: builder.mutation<ApiProduct, Partial<ApiProduct>>({
      query: (payload) => ({
        url: 'products',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: [{ type: 'Product' as const, id: 'LIST' }],
    }),

    updateProduct: builder.mutation<ApiProduct, ProductMutationArgs>({
      query: ({ productId, payload }) => ({
        url: `products/${encodeURIComponent(productId)}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: (_result, _error, { productId }) => [
        { type: 'Product' as const, id: productId },
        { type: 'Product' as const, id: 'LIST' },
      ],
    }),

    deleteProduct: builder.mutation<void, string>({
      query: (productId) => ({
        url: `products/${encodeURIComponent(productId)}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, productId) => [
        { type: 'Product' as const, id: productId },
        { type: 'Product' as const, id: 'LIST' },
      ],
    }),

    getStaffUsers: builder.query<Omit<StaffUser, 'password'>[], void>({
      query: () => 'login?role=staff',
      transformResponse: (response: unknown) => {
        if (!Array.isArray(response)) return [];
        return response.map((user: StaffUserResponse) => {
          const { password: _pw, ...rest } = user;
          return rest as Omit<StaffUser, 'password'>;
        });
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'User' as const, id })), { type: 'User' as const, id: 'LIST' }]
          : [{ type: 'User' as const, id: 'LIST' }],
    }),

    getStaffUserById: builder.query<Omit<StaffUser, 'password'>, string>({
      query: (userId) => `login/${encodeURIComponent(userId)}?role=staff`,
      providesTags: (_result, _error, userId) => [{ type: 'User' as const, id: userId }],
    }),

    getStaffUserByUsername: builder.query<StaffUserResponse[], string>({
      query: (username) => `login?username=${encodeURIComponent(username)}&role=staff`,
      transformResponse: (response: unknown) => {
        if (!Array.isArray(response)) return [];
        return response as StaffUserResponse[];
      },
    }),

    createUser: builder.mutation<ApiUser, UserCreateArgs>({
      query: ({ payload }) => ({
        url: 'login',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: [{ type: 'User' as const, id: 'LIST' }],
    }),

    updateUser: builder.mutation<Omit<StaffUser, 'password'>, UserMutationArgs>({
      query: ({ userId, payload }) => ({
        url: `login/${encodeURIComponent(userId)}?role=staff`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: 'User' as const, id: userId },
        { type: 'User' as const, id: 'LIST' },
      ],
    }),

    deleteUser: builder.mutation<void, string>({
      query: (userId) => ({
        url: `login/${encodeURIComponent(userId)}?role=staff`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, userId) => [
        { type: 'User' as const, id: userId },
        { type: 'User' as const, id: 'LIST' },
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
  useLazyGetStaffUserByIdQuery,
  useGetStaffUserByUsernameQuery,
  useLazyGetStaffUserByUsernameQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = productsApi;
