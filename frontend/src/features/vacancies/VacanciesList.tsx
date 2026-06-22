import { getErrorMessage } from '../../utils/errorMessage';
import { useGetVacanciesQuery } from '../api/apiSlice';
import DeleteVacancyButton from './DeleteVacancyButton';
import CreateVacancy from './CreateVacancy';
import UpdateVacancyForm from './UpdateVacancy';

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
      <CreateVacancy />
    </div>
  );
};
