import { getErrorMessage } from '../../utils/errorMessage';
import { useSearchVacanciesQuery } from '../api/api';
import DeleteVacancyButton from './DeleteVacancyButton';
import CreateVacancy from './CreateVacancy';
import UpdateVacancyForm from './UpdateVacancy';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  resetFilters,
  applyFilters,
  initialState,
  setPage,
} from '../filters/filterSlice';
import { useState } from 'react';

export const VacanciesList = () => {
  const dispatch = useAppDispatch();

  const appliedFilters = useAppSelector((state) => state.filters);
  const [draft, setDraft] = useState(appliedFilters);

  const {
    data: filteredData,
    isLoading: isFilteredLoading,
    isError: isFilteredError,
    error: filteredError,
  } = useSearchVacanciesQuery({ filters: appliedFilters });

  if (isFilteredLoading) return <div>Loading...</div>;

  if (isFilteredError)
    return (
      <div>Could not load vacancies - {getErrorMessage(filteredError)}</div>
    );

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(applyFilters(draft));
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
    setDraft({ ...initialState });
  };

  return (
    <div>
      <h3>Filter by...</h3>
      <form onSubmit={handleSubmit}>
        <input
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          placeholder='name'
        />
        <input
          value={draft.minSalary ?? ''}
          onChange={(e) =>
            setDraft({
              ...draft,
              minSalary:
                e.target.value === '' ? undefined : Number(e.target.value),
            })
          }
          placeholder='min salary'
        />
        <input
          value={draft.maxSalary ?? ''}
          onChange={(e) =>
            setDraft({
              ...draft,
              maxSalary:
                e.target.value === '' ? undefined : Number(e.target.value),
            })
          }
          placeholder='max salary'
        />
        <input
          value={draft.tags.join(', ')}
          onChange={(e) =>
            setDraft({
              ...draft,
              tags: e.target.value.split(', ').map((tag) => tag.trim()),
            })
          }
          placeholder='tags (comma separated)'
        />
        <input
          value={draft.minRequiredExperience ?? ''}
          onChange={(e) =>
            setDraft({
              ...draft,
              minRequiredExperience:
                e.target.value === '' ? undefined : Number(e.target.value),
            })
          }
          placeholder='minimum required experience'
        />
        <input
          value={draft.maxRequiredExperience ?? ''}
          onChange={(e) =>
            setDraft({
              ...draft,
              maxRequiredExperience:
                e.target.value === '' ? undefined : Number(e.target.value),
            })
          }
          placeholder='maximum required experience'
        />

        <input
          value={draft.limit}
          onChange={(e) =>
            setDraft({ ...draft, limit: Number(e.target.value) })
          }
          placeholder='limit'
        />
        <button type='submit'>Apply Filters</button>
        <button type='button' onClick={handleResetFilters}>
          Reset Filters
        </button>
      </form>

      <h2>Vacancies List</h2>
      <ul>
        {filteredData?.data.map((vacancy) => (
          <li key={vacancy.id}>
            {vacancy.id} - {vacancy.name} - {vacancy.description}{' '}
            <UpdateVacancyForm
              vacancyId={vacancy.id}
              initialData={{
                name: vacancy.name,
                description: vacancy.description,
                minSalary: vacancy.minSalary,
                maxSalary: vacancy.maxSalary,
                requiredYearsOfExperience: vacancy.requiredYearsOfExperience,
                tags: vacancy.tags,
              }}
            />
            <DeleteVacancyButton vacancyId={vacancy.id} />
          </li>
        ))}
      </ul>
      {appliedFilters.page && (
        <>
          <button
            disabled={appliedFilters.page <= 1}
            onClick={() => dispatch(setPage(appliedFilters.page - 1))}
          >
            Prev
          </button>
          <button
            disabled={appliedFilters.page >= (filteredData?.totalPages ?? 0)}
            onClick={() => dispatch(setPage(appliedFilters.page + 1))}
          >
            Next
          </button>
        </>
      )}
      <CreateVacancy />
    </div>
  );
};
