import { baseApi } from '@/app/api/baseApi';
import type { CandidateProfile } from '@/types';

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyCandidateProfile: builder.query<CandidateProfile, void>({
      query: () => ({
        url: '/candidatesProfiles/me',
        method: 'GET',
      }),
      providesTags: [{ type: 'CandidateProfile', id: 'LIST' }],
    }),
  }),
});

export const { useGetMyCandidateProfileQuery } = profileApi;
