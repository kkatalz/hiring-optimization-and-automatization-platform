import { baseApi, PUBLIC_ENDPOINT } from '@/app/api/baseApi';
import type {
  CreateVacancyInput,
  CreateVacancyQuestionInput,
  GeneralVacancy,
  PaginatedResponse,
  UpdateVacancyInput,
  VacanciesFilters,
  Vacancy,
  VacancyQuestion,
  VacancyQuestionDetailed,
} from '@/types';

export const vacancyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // VACANCY QUERIES
    getVacancyById: builder.query<Vacancy, string>({
      query: (id) => `/vacancies/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Vacancy', id }],
    }),

    // Public
    browseVacancyById: builder.query<GeneralVacancy, string>({
      query: (id) => `/vacancies/browse/${id}`,
      extraOptions: PUBLIC_ENDPOINT,
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

    // Public search
    browseVacancies: builder.query<
      PaginatedResponse<GeneralVacancy>,
      { filters: VacanciesFilters }
    >({
      query: ({ filters }) => ({
        url: '/vacancies/public/search',
        method: 'POST',
        body: filters,
      }),
      extraOptions: PUBLIC_ENDPOINT,
    }),

    getAllVacanciesTags: builder.query<string[], void>({
      query: () => ({
        url: '/vacancies/existing-tags',
        method: 'GET',
      }),

      providesTags: (result) =>
        result
          ? [
              ...result.map((tag) => ({
                type: 'Vacancy' as const,
                id: tag,
              })),
              { type: 'Vacancy', id: 'LIST' },
            ]
          : [{ type: 'Vacancy', id: 'LIST' }],
    }),

    getAllVacanciesLanguagesCodes: builder.query<string[], void>({
      query: () => ({
        url: '/vacancies/existing-languages-codes',
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((code) => ({
                type: 'Vacancy' as const,
                id: code,
              })),
              { type: 'Vacancy', id: 'LIST' },
            ]
          : [{ type: 'Vacancy', id: 'LIST' }],
    }),

    getAllVacancyQuestions: builder.query<VacancyQuestionDetailed[], string>({
      query: (vacancyId) => ({
        url: `/vacancies/all-questions/${vacancyId}`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((question) => ({
                type: 'Vacancy' as const,
                id: question.questionId,
              })),
              { type: 'Vacancy', id: 'LIST' },
            ]
          : [{ type: 'Vacancy', id: 'LIST' }],
    }),

    // VACANCY MUTATIONS
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
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Vacancy', id }],
    }),

    deleteVacancy: builder.mutation<Vacancy, string>({
      query: (id) => ({
        url: `/vacancies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Vacancy', id },
        { type: 'Vacancy', id: 'LIST' },
      ],
    }),

    // Extra endpoints for adding/removing questions to/from a vacancy
    addQuestionToVacancy: builder.mutation<
      VacancyQuestion,
      {
        vacancyId: string;
        questionId: string;
        body: CreateVacancyQuestionInput;
      }
    >({
      query: ({ vacancyId, questionId, body }) => ({
        url: `/vacancies/${vacancyId}/questions/${questionId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { vacancyId }) => [
        { type: 'Vacancy', id: vacancyId },
        { type: 'Vacancy', id: 'LIST' },
      ],
    }),

    findAllQuestionsByVacancyId: builder.query<
      VacancyQuestionDetailed[],
      string
    >({
      query: (vacancyId) => ({
        url: `/vacancies/all-questions/${vacancyId}`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((question) => ({
                type: 'Vacancy' as const,
                id: question.questionId,
              })),
              { type: 'Vacancy', id: 'LIST' },
            ]
          : [{ type: 'Vacancy', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetVacancyByIdQuery,
  useBrowseVacancyByIdQuery,
  useSearchVacanciesQuery,
  useBrowseVacanciesQuery,
  useGetAllVacanciesTagsQuery,
  useGetAllVacanciesLanguagesCodesQuery,
  useGetAllVacancyQuestionsQuery,
  useCreateVacancyMutation,
  useUpdateVacancyMutation,
  useDeleteVacancyMutation,
  useAddQuestionToVacancyMutation,
  useFindAllQuestionsByVacancyIdQuery,
} = vacancyApi;
