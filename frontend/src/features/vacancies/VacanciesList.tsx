import { getErrorMessage } from '../../utils/errorMessage';
import { useGetVacanciesQuery } from '../api/apiSlice';

export const VacanciesList = () => {
  const { data, isLoading, isError, error } = useGetVacanciesQuery({
    page: 1,
    limit: 20,
  });

  if (isLoading) return <div>Loading...</div>;

  if (isError)
    return <div>Could not load vacancies - {getErrorMessage(error)}</div>;

  return (
    <div>
      <h2>Vacancies List</h2>
      <ul>
        {data?.data.map((vacancy) => (
          <li key={vacancy.id}>
            {vacancy.id} - {vacancy.name} - {vacancy.description}
          </li>
        ))}
      </ul>
    </div>
  );
};
