import { getErrorMessage } from '../../utils/errorMessage';
import { useSearchVacanciesQuery } from '../api/apiSlice';
import DeleteVacancyButton from './DeleteVacancyButton';
import CreateVacancy from './CreateVacancy';
import UpdateVacancyForm from './UpdateVacancy';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  setMaxSalary,
  setMinSalary,
  setName,
  setTags,
  setMinRequiredExperience,
  setMaxRequiredExperience,
  setPage,
  setLimit,
  resetFilters,
} from '../filters/filterSlice';

export const VacanciesList = () => {
  const dispatch = useAppDispatch();

  const filters = useAppSelector((state) => state.filters);

  const {
    data: filteredData,
    isLoading: isFilteredLoading,
    isError: isFilteredError,
    error: filteredError,
  } = useSearchVacanciesQuery({
    filters,
  });

  if (isFilteredLoading) return <div>Loading...</div>;

  if (isFilteredError)
    return (
      <div>Could not load vacancies - {getErrorMessage(filteredError)}</div>
    );

  return (
    <div>
      <h3>Filter by...</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          dispatch(setPage(1)); // Reset to first page on new search
        }}
      >
        <input
          value={filters.name}
          onChange={(e) => dispatch(setName(e.target.value))}
          placeholder='name'
        />
        <input
          value={filters.minSalary ?? ''}
          onChange={(e) =>
            dispatch(
              setMinSalary(
                e.target.value === '' ? undefined : Number(e.target.value),
              ),
            )
          }
          placeholder='min salary'
        />
        <input
          value={filters.maxSalary ?? ''}
          onChange={(e) =>
            dispatch(
              setMaxSalary(
                e.target.value === '' ? undefined : Number(e.target.value),
              ),
            )
          }
          placeholder='max salary'
        />
        <input
          value={filters.tags.join(', ')}
          onChange={(e) => dispatch(setTags(e.target.value.split(', ')))}
          placeholder='tags (comma separated)'
        />
        <input
          value={filters.minRequiredExperience ?? ''}
          onChange={(e) =>
            dispatch(
              setMinRequiredExperience(
                e.target.value === '' ? undefined : Number(e.target.value),
              ),
            )
          }
          placeholder='minimum required experience'
        />
        <input
          value={filters.maxRequiredExperience ?? ''}
          onChange={(e) =>
            dispatch(
              setMaxRequiredExperience(
                e.target.value === '' ? undefined : Number(e.target.value),
              ),
            )
          }
          placeholder='maximum required experience'
        />
        <input
          value={filters.page}
          onChange={(e) => dispatch(setPage(Number(e.target.value)))}
          placeholder='page'
        />
        <input
          value={filters.limit}
          onChange={(e) => dispatch(setLimit(Number(e.target.value)))}
          placeholder='limit'
        />
        <button type='button' onClick={() => dispatch(resetFilters())}>
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
      {filters.page && (
        <>
          <button
            disabled={filters.page <= 1}
            onClick={() => dispatch(setPage(filters.page - 1))}
          >
            Prev
          </button>
          <button
            disabled={filters.page >= (filteredData?.totalPages ?? 0)}
            onClick={() => dispatch(setPage(filters.page + 1))}
          >
            Next
          </button>
        </>
      )}
      <CreateVacancy />
    </div>
  );
};
