import { baseURL } from '@/app/config';
import type { RootState } from '@/app/store';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const PUBLIC_ENDPOINTS = new Set(['browseVacancyById', 'browseVacancies']);

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: baseURL,
    credentials: 'include',
    prepareHeaders: (headers, { getState, endpoint }) => {
      if (PUBLIC_ENDPOINTS.has(endpoint)) return headers;

      const token = (getState() as RootState).auth.user?.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Vacancy', 'Submission'],
  endpoints: () => ({}),
});
