import { baseApi } from '@/app/api/baseApi';
import type {
  SubmissionFilters,
  SubmissionSortQuery,
  VacancySubmission,
} from '@/types';

export const vacancySubmissionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // SUBMISSION QUERIES
    findSubmissionById: builder.query<VacancySubmission, string>({
      query: (submissionId) => ({
        url: `/vacanciesSubmissions/${submissionId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, submissionId) => [
        { type: 'Submission', id: submissionId },
      ],
    }),

    getSubmissionsByVacancyId: builder.query<
      VacancySubmission[],
      {
        vacancyId: string;
        sortQuery?: SubmissionSortQuery;
        filterSubmissionsDto?: SubmissionFilters;
      }
    >({
      query: ({ vacancyId, sortQuery, filterSubmissionsDto }) => ({
        url: `/vacanciesSubmissions/get/filter/within/vacancy/${vacancyId}`,
        method: 'POST',
        params: {
          sortBy: sortQuery?.sortBy,
          order: sortQuery?.order,
        },
        body: filterSubmissionsDto,
      }),
      providesTags: (result, _error, { vacancyId }) =>
        result
          ? [
              ...result.map((submission) => ({
                type: 'Submission' as const,
                id: submission.id,
              })),
              { type: 'Submission', id: `VACANCY_${vacancyId}` },
            ]
          : [{ type: 'Submission', id: `VACANCY_${vacancyId}` }],
    }),
    getAllSubmissionsCitiesByVacancyId: builder.query<string[], string>({
      query: (vacancyId) => ({
        url: `/vacanciesSubmissions/${vacancyId}/existing-cities`,
        method: 'GET',
      }),
      providesTags: (_result, _error, vacancyId) => [
        { type: 'Submission', id: `VACANCY_${vacancyId}` },
      ],
    }),

    getAllSubmissionsCountriesByVacancyId: builder.query<string[], string>({
      query: (vacancyId) => ({
        url: `/vacanciesSubmissions/${vacancyId}/existing-countries`,
        method: 'GET',
      }),
      providesTags: (_result, _error, vacancyId) => [
        { type: 'Submission', id: `VACANCY_${vacancyId}` },
      ],
    }),

    getAllSubmissionsLanguagesCodesByVacancyId: builder.query<string[], string>(
      {
        query: (vacancyId) => ({
          url: `/vacanciesSubmissions/${vacancyId}/existing-languages-codes`,
          method: 'GET',
        }),
        providesTags: (_result, _error, vacancyId) => [
          { type: 'Submission', id: `VACANCY_${vacancyId}` },
        ],
      },
    ),

    // SUBMISSION MUTATIONS
    approveSubmission: builder.mutation<VacancySubmission, string>({
      query: (submissionId) => ({
        url: `/vacanciesSubmissions/${submissionId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, submissionId) => [
        { type: 'Submission', id: submissionId },
      ],
    }),

    rejectSubmission: builder.mutation<VacancySubmission, string>({
      query: (submissionId) => ({
        url: `/vacanciesSubmissions/${submissionId}/reject`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, submissionId) => [
        { type: 'Submission', id: submissionId },
      ],
    }),
  }),
});

export const {
  useFindSubmissionByIdQuery,
  useGetSubmissionsByVacancyIdQuery,
  useGetAllSubmissionsCitiesByVacancyIdQuery,
  useGetAllSubmissionsCountriesByVacancyIdQuery,
  useGetAllSubmissionsLanguagesCodesByVacancyIdQuery,
  useApproveSubmissionMutation,
  useRejectSubmissionMutation,
} = vacancySubmissionApi;
