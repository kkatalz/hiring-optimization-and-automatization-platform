import { baseApi } from '@/app/api/baseApi';
import { ALL, allWithin } from '@/app/api/cacheTags';
import type {
  CreateSubmissionInput,
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
    applyToVacancy: builder.mutation<
      VacancySubmission,
      { vacancyId: string; body: CreateSubmissionInput }
    >({
      query: ({ vacancyId, body }) => ({
        url: `/vacanciesSubmissions/${vacancyId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { vacancyId }) => [
        { type: 'Submission', id: allWithin('VACANCY', vacancyId) },
        { type: 'CandidateProfile', id: ALL },
      ],
    }),

    /**
     * Uploads a PDF or DOCX and lets the backend parse it into the
     * submission's resume text. Sent as multipart, so the body is a FormData
     * whose single field is named `file` - what UploadResume() expects.
     */
    uploadSubmissionResume: builder.mutation<
      VacancySubmission,
      { submissionId: string; file: File }
    >({
      query: ({ submissionId, file }) => {
        const formData = new FormData();
        formData.append('file', file);

        return {
          url: `/vacanciesSubmissions/${submissionId}/parse-resume-file`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (_result, _error, { submissionId }) => [
        { type: 'Submission', id: submissionId },
        { type: 'CandidateProfile', id: ALL },
      ],
    }),

    /**
     * Puts a first rating on a submission. The backend rejects this once a
     * rating exists, so callers must switch to updateRating - see
     * CandidateRatingEditor, which picks between the two.
     */
    addRating: builder.mutation<
      VacancySubmission,
      { submissionId: string; rating: number }
    >({
      query: ({ submissionId, rating }) => ({
        url: `/vacanciesSubmissions/add-rating/${submissionId}`,
        method: 'POST',
        body: { rating },
      }),
      invalidatesTags: (_result, _error, { submissionId }) => [
        { type: 'Submission', id: submissionId },
      ],
    }),

    /** Changes an existing rating. Rejected when there is none yet. */
    updateRating: builder.mutation<
      VacancySubmission,
      { submissionId: string; rating: number }
    >({
      query: ({ submissionId, rating }) => ({
        url: `/vacanciesSubmissions/update-rating/${submissionId}`,
        method: 'PATCH',
        body: { rating },
      }),
      invalidatesTags: (_result, _error, { submissionId }) => [
        { type: 'Submission', id: submissionId },
      ],
    }),

    removeRating: builder.mutation<VacancySubmission, string>({
      query: (submissionId) => ({
        url: `/vacanciesSubmissions/remove-rating/${submissionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, submissionId) => [
        { type: 'Submission', id: submissionId },
      ],
    }),

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
  useApplyToVacancyMutation,
  useUploadSubmissionResumeMutation,
  useAddRatingMutation,
  useUpdateRatingMutation,
  useRemoveRatingMutation,
  useApproveSubmissionMutation,
  useRejectSubmissionMutation,
} = vacancySubmissionApi;
