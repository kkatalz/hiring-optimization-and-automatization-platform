import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  CreateVacancyInput,
  UpdateVacancyInput,
  Vacancy,
  PaginatedResponse,
} from '../vacancies/types';
import type { RootState } from '../../app/store';
import type { VacanciesFilters } from '../filters/filterSlice';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.user?.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);

      return headers;
    },
  }),
  tagTypes: ['Vacancy'],
  endpoints: (builder) => ({
    getVacancyById: builder.query<Vacancy, string>({
      query: (id) => `/vacancies/${id}`,
      providesTags: (result, error, id) => [{ type: 'Vacancy', id }],
    }),

    searchVacancies: builder.query<
      PaginatedResponse<Vacancy>,
      { filters: VacanciesFilters }
    >({
      query: ({ filters }) => ({
        url: '/vacancies/search',
        method: 'POST',
        body: filters,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((v) => ({
                type: 'Vacancy' as const,
                id: v.id,
              })),
              { type: 'Vacancy', id: 'LIST' },
            ]
          : [{ type: 'Vacancy', id: 'LIST' }],
    }),

    createVacancy: builder.mutation<Vacancy, CreateVacancyInput>({
      query: (body) => ({
        url: '/vacancies',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Vacancy', id: 'LIST' }],
    }),

    updateVacancy: builder.mutation<
      Vacancy,
      { id: string; body: UpdateVacancyInput }
    >({
      query: ({ id, body }) => ({
        url: `/vacancies/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Vacancy', id }],
    }),

    deleteVacancy: builder.mutation<Vacancy, string>({
      query: (id) => ({
        url: `/vacancies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Vacancy', id },
        { type: 'Vacancy', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetVacancyByIdQuery,
  useSearchVacanciesQuery,
  useCreateVacancyMutation,
  useUpdateVacancyMutation,
  useDeleteVacancyMutation,
} = apiSlice;
