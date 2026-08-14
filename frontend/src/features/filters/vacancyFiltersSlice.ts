import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { VacanciesFilters, VacancySortColumn } from '../../../types';
import { initialState } from '../../../types';
import type { SortOrder } from '../../../types/common/Order';

export const vacancyFiltersSlice = createSlice({
  name: 'vacancyFilters',
  initialState,
  reducers: {
    // Pagination, Limit and Filtering
    setPage: (state, action: PayloadAction<number>) => {
      state.page = Number(action.payload);
    },

    resetFilters: (state) => {
      state.name = '';
      state.timeCommitment = [];
      state.languageRequirements = [];
      state.minSalary = undefined;
      state.maxSalary = undefined;
      state.tags = [];
      state.minRequiredExperience = undefined;
      state.maxRequiredExperience = undefined;
      state.page = undefined;
      state.limit = undefined;
    },
    applyFilters: (state, action: PayloadAction<VacanciesFilters>) => ({
      ...action.payload,
      sortBy: state.sortBy,
      order: state.order,
      page: 1,
    }),

    // Sorting and Ordering
    setSortBy: (
      state,
      action: PayloadAction<VacancySortColumn | undefined>,
    ) => {
      state.sortBy = action.payload;
      if (!action.payload) state.order = undefined;
      else if (!state.order) state.order = 'DESC';
      state.page = 1;
    },

    setOrder: (state, action: PayloadAction<SortOrder | undefined>) => {
      state.order = action.payload;
      state.page = 1;
    },
  },
});

export const { setPage, resetFilters, applyFilters, setSortBy, setOrder } =
  vacancyFiltersSlice.actions;

export default vacancyFiltersSlice.reducer;
