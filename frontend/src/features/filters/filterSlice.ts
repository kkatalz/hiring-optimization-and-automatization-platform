import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type SortColumn =
  | 'createdAt'
  | 'requiredYearsOfExperience'
  | 'minSalary'
  | 'maxSalary';

export type SortOrder = 'ASC' | 'DESC';

export interface VacanciesFilters {
  name: string;
  minSalary?: number;
  maxSalary?: number;
  tags: string[];
  minRequiredExperience?: number;
  maxRequiredExperience?: number;
  sortBy?: SortColumn;
  order?: SortOrder;
  page: number;
  limit: number;
}

export const initialState: VacanciesFilters = {
  name: '',
  tags: [],
  page: 1,
  limit: 10,
};

export const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    // Pagination, Limit and Filtering
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },

    resetFilters: (state) => {
      state.name = '';
      state.minSalary = undefined;
      state.maxSalary = undefined;
      state.tags = [];
      state.minRequiredExperience = undefined;
      state.maxRequiredExperience = undefined;
      state.page = 1;
      state.limit = 10;
    },
    applyFilters: (state, action: PayloadAction<VacanciesFilters>) => ({
      ...action.payload,
      sortBy: state.sortBy,
      order: state.order,
      page: 1,
    }),

    // Sorting and Ordering
    setSortBy: (state, action: PayloadAction<SortColumn | undefined>) => {
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
  filtersSlice.actions;

export default filtersSlice.reducer;
