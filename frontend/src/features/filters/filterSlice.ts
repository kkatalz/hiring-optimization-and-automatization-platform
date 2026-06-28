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

const initialState: VacanciesFilters = {
  name: '',
  tags: [],
  page: 1,
  limit: 10,
};

export const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
      state.page = 1;
    },
    setMinSalary: (state, action: PayloadAction<number | undefined>) => {
      state.minSalary = action.payload;
      state.page = 1;
    },
    setMaxSalary: (state, action: PayloadAction<number | undefined>) => {
      state.maxSalary = action.payload;
      state.page = 1;
    },
    setTags: (state, action: PayloadAction<string[]>) => {
      state.tags = action.payload;
      state.page = 1;
    },
    setMinRequiredExperience: (
      state,
      action: PayloadAction<number | undefined>,
    ) => {
      state.minRequiredExperience = action.payload;
      state.page = 1;
    },
    setMaxRequiredExperience: (
      state,
      action: PayloadAction<number | undefined>,
    ) => {
      state.maxRequiredExperience = action.payload;
      state.page = 1;
    },
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
  },
});

export const {
  setName,
  setMinSalary,
  setMaxSalary,
  setTags,
  setMinRequiredExperience,
  setMaxRequiredExperience,
  setPage,
  setLimit,
  resetFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;
