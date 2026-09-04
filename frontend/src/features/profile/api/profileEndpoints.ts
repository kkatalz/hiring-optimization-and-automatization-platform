import { baseApi } from '@/app/api/baseApi';
import { ALL } from '@/app/api/cacheTags';
import type { CandidateProfile } from '@/types';

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyCandidateProfile: builder.query<CandidateProfile, void>({
      query: () => ({
        url: '/candidatesProfiles/me',
        method: 'GET',
      }),
      providesTags: [{ type: 'CandidateProfile', id: ALL }],
    }),
  }),
});

export const { useGetMyCandidateProfileQuery } = profileApi;
