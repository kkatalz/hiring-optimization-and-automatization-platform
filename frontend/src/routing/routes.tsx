import { createBrowserRouter } from 'react-router-dom';
import { LoginForm } from '../features/auth/LoginForm';
import { VacanciesList } from '../features/vacancies/VacanciesList';

const routes = createBrowserRouter([
  {
    path: '/',
    Component: LoginForm,
  },
  {
    path: '/vacancies',
    Component: VacanciesList,
  },
]);

export default routes;
