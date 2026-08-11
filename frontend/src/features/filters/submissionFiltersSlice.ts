import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SubmissionFilters, SubmissionSortColumn } from '../../../types';
import { submissionInitialState } from '../../../types';
import type { SortOrder } from '../../../types/common/Order';

export const submissionFiltersSlice = createSlice({
  name: 'submissionFilters',
  initialState: submissionInitialState,
  reducers: {
    // Pagination and Filtering
    resetFilters: (state) => {
      state.minYearsOfExperience = undefined;
      state.maxYearsOfExperience = undefined;
      state.countries = [];
      state.cities = [];
      state.languages = [];
      state.answers = [];
      state.minMatchScore = undefined;
      state.minSalaryExpectation = undefined;
      state.maxSalaryExpectation = undefined;
      state.maxCommentAiScore = undefined;
      state.maxResumeAiScore = undefined;
    },
    applyFilters: (state, action: PayloadAction<SubmissionFilters>) => ({
      ...action.payload,
      sortBy: state.sortBy,
      order: state.order,
    }),

    // Sorting and Ordering
    setSortBy: (
      state,
      action: PayloadAction<SubmissionSortColumn | undefined>,
    ) => {
      state.sortBy = action.payload;
      if (!action.payload) state.order = undefined;
      else if (!state.order) state.order = 'DESC';
    },

    setOrder: (state, action: PayloadAction<SortOrder | undefined>) => {
      state.order = action.payload;
    },
  },
});

export const { resetFilters, applyFilters, setSortBy, setOrder } =
  submissionFiltersSlice.actions;

export default submissionFiltersSlice.reducer;
