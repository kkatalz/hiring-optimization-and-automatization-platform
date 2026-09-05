import { baseApi, PUBLIC_ENDPOINT } from '@/app/api/baseApi';
import { ALL } from '@/app/api/cacheTags';
import type { User } from '@/types';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // PASSWORD RESET - for a visitor who is logged out.
    /** Step one: ask for the email that carries the reset link. */
    forgotPassword: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
      extraOptions: PUBLIC_ENDPOINT,
    }),

    /** Step two: use the emailed token for a new password. */
    resetPassword: builder.mutation<
      { message: string },
      { token: string; newPassword: string }
    >({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
      extraOptions: PUBLIC_ENDPOINT,
    }),

    // For a signed-in user changing their own credentials.
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

export const {
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangeEmailMutation,
  useChangePasswordMutation,
} = authApi;
