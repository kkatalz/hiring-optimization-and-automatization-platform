import { baseApi } from '@/app/api/baseApi';
import { ALL } from '@/app/api/cacheTags';
import type { User } from '@/types';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    changeEmail: builder.mutation<User, { userId: string; email: string }>({
      query: ({ userId, email }) => ({
        url: `/auth/credentials/email/${userId}`,
        method: 'PATCH',
        body: { email },
      }),
      invalidatesTags: [{ type: 'CandidateProfile', id: ALL }],
    }),

    changePassword: builder.mutation<
      User,
      { userId: string; oldPassword: string; password: string }
    >({
      query: ({ userId, oldPassword, password }) => ({
        url: `/auth/credentials/password/${userId}`,
        method: 'PATCH',
        body: { oldPassword, password },
      }),
    }),
  }),
});

export const { useChangeEmailMutation, useChangePasswordMutation } = authApi;
