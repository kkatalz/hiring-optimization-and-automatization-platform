import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface VacanciesFilters {
  name: string;
  minSalary?: number;
  maxSalary?: number;
  tags: string[];
  minRequiredExperience?: number;
  maxRequiredExperience?: number;
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
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
      state.page = 1;
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
      page: 1,
    }),
  },
});

export const { setPage, setLimit, resetFilters, applyFilters } =
  filtersSlice.actions;

export default filtersSlice.reducer;
