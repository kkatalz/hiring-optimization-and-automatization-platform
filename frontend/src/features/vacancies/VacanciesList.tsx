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
  setSortBy,
  type SortColumn,
  setOrder,
  type SortOrder,
} from '../filters/filterSlice';
import { useState } from 'react';

export const VacanciesList = () => {
  const dispatch = useAppDispatch();

  const appliedFilters = useAppSelector((state) => state.filters);
  const [draft, setDraft] = useState(appliedFilters);

  const currentPage =
    typeof appliedFilters.page === 'number' ? appliedFilters.page : 1;

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
          value={draft.tags?.join(', ')}
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

        {/* Pagination */}
        <input
          value={draft.limit}
          onChange={(e) =>
            setDraft({ ...draft, limit: Number(e.target.value) })
          }
          placeholder='limit'
        />

        {/* Apply & Reset */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            margin: '10px',
            justifyContent: 'center',
          }}
        >
          <button
            type='submit'
            style={{
              fontWeight: 'bolder',
              borderRadius: '5px',
              backgroundColor: '#d7eec8e3',
              border: '1px solid #d7eec856',
              padding: '3px 7px',
            }}
          >
            Apply Filters
          </button>
          <button
            type='button'
            onClick={handleResetFilters}
            style={{
              fontWeight: 'bolder',
              borderRadius: '5px',
              backgroundColor: '#d7eec8e3',
              border: '1px solid #d7eec856',
              padding: '3px 7px',
            }}
          >
            Reset Filters
          </button>
        </div>
      </form>

      <h2>Vacancies List</h2>

      {/* Sorting */}
      <div>
        <select
          value={appliedFilters.sortBy ?? ''}
          onChange={(e) => dispatch(setSortBy(e.target.value as SortColumn))}
        >
          <option value='' disabled>
            Sort by
          </option>
          <option value='createdAt'>Created at</option>
          <option value='requiredYearsOfExperience'>Required experience</option>
          <option value='minSalary'>Minimum salary</option>
          <option value='maxSalary'>Maximum salary</option>
        </select>

        {/* Order */}
        <select
          value={appliedFilters.order ?? ''}
          disabled={!appliedFilters.sortBy}
          onChange={(e) => dispatch(setOrder(e.target.value as SortOrder))}
        >
          <option value='' disabled>
            Order in
          </option>
          <option value='ASC'>Ascending</option>
          <option value='DESC'>Descending</option>
        </select>
      </div>

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
                timeCommitment: vacancy.timeCommitment,
                languageRequirements: vacancy.languageRequirements,
                requiredYearsOfExperience: vacancy.requiredYearsOfExperience,
                tags: vacancy.tags,
                customWeights: vacancy.customWeights,
              }}
            />
            <DeleteVacancyButton vacancyId={vacancy.id} />
          </li>
        ))}
      </ul>
      {(filteredData?.totalPages ?? 0) > 1 && appliedFilters.page && (
        <>
          <button
            disabled={appliedFilters.page <= 1}
            onClick={() => dispatch(setPage(currentPage - 1))}
          >
            Prev
          </button>
          <button
            disabled={currentPage >= (filteredData?.totalPages ?? 0)}
            onClick={() => dispatch(setPage(currentPage + 1))}
          >
            Next
          </button>
        </>
      )}
      <CreateVacancy />
    </div>
  );
};
