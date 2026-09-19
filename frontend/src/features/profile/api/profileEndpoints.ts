import { baseApi, PUBLIC_ENDPOINT } from '@/app/api/baseApi';
import { ALL } from '@/app/api/cacheTags';
import type { CandidateProfile, CreateCandidateProfileInput } from '@/types';

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyCandidateProfile: builder.query<CandidateProfile, void>({
      query: () => ({
        url: '/candidatesProfiles/me',
        method: 'GET',
      }),
      providesTags: [{ type: 'CandidateProfile', id: ALL }],
    }),

    createCandidateProfile: builder.mutation<
      CandidateProfile,
      CreateCandidateProfileInput
    >({
      query: (body) => ({
        url: '/candidatesProfiles/new',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'CandidateProfile', id: ALL }],
      extraOptions: PUBLIC_ENDPOINT,
    }),
  }),
});

export const {
  useGetMyCandidateProfileQuery,
  useCreateCandidateProfileMutation,
} = profileApi;
