import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './RootLayout';
import { LoginForm } from '../components/auth/LoginForm';
import { ProtectedLayout } from './ProtectedLayout';
import { VacanciesList } from '../components/vacancies/VacanciesList';

const routes = createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      {
        path: '/',
        Component: LoginForm,
      },
      {
        Component: ProtectedLayout,
        children: [{ path: '/vacancies', Component: VacanciesList }],
      },
    ],
  },
]);

export default routes;
