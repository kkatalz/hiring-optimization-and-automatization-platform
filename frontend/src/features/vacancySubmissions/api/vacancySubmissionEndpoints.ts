import { baseApi } from '@/app/api/baseApi';
import { allWithin } from '@/app/api/cacheTags';
import type {
  MatchScoreExplanation,
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
              { type: 'Submission', id: allWithin('VACANCY', vacancyId) },
            ]
          : [{ type: 'Submission', id: allWithin('VACANCY', vacancyId) }],
    }),

    getAllSubmissionsCitiesByVacancyId: builder.query<string[], string>({
      query: (vacancyId) => ({
        url: `/vacanciesSubmissions/${vacancyId}/existing-cities`,
        method: 'GET',
      }),
      providesTags: (_result, _error, vacancyId) => [
        { type: 'Submission', id: allWithin('VACANCY', vacancyId) },
      ],
    }),

    getAllSubmissionsCountriesByVacancyId: builder.query<string[], string>({
      query: (vacancyId) => ({
        url: `/vacanciesSubmissions/${vacancyId}/existing-countries`,
        method: 'GET',
      }),
      providesTags: (_result, _error, vacancyId) => [
        { type: 'Submission', id: allWithin('VACANCY', vacancyId) },
      ],
    }),

    getAllSubmissionsLanguagesCodesByVacancyId: builder.query<string[], string>(
      {
        query: (vacancyId) => ({
          url: `/vacanciesSubmissions/${vacancyId}/existing-languages-codes`,
          method: 'GET',
        }),
        providesTags: (_result, _error, vacancyId) => [
          { type: 'Submission', id: allWithin('VACANCY', vacancyId) },
        ],
      },
    ),

    getMatchScoreExplanation: builder.query<MatchScoreExplanation, string>({
      query: (submissionId) => ({
        url: `/vacanciesSubmissions/${submissionId}/match-score`,
        method: 'GET',
      }),
      providesTags: (_result, _error, submissionId) => [
        { type: 'Submission', id: submissionId },
      ],
    }),

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
  useGetMatchScoreExplanationQuery,
  useApproveSubmissionMutation,
  useRejectSubmissionMutation,
} = vacancySubmissionApi;
