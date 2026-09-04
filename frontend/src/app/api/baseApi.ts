import { baseURL } from '@/app/config';
import type { RootState } from '@/app/store';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const PUBLIC_ENDPOINT = { isPublic: true };

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: baseURL,
    credentials: 'include',
    prepareHeaders: (headers, { getState, extraOptions }) => {
      const isPublic = (extraOptions as typeof PUBLIC_ENDPOINT | undefined)
        ?.isPublic;
      if (isPublic) return headers;

      const token = (getState() as RootState).auth.user?.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: [
    'Vacancy',
    'Submission',
    'Question',
    'Interview',
    'CandidateProfile',
  ],
  endpoints: () => ({}),
});
