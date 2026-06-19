import { createBrowserRouter } from 'react-router-dom';
import { LoginForm } from '../features/auth/LoginForm';
import { VacanciesList } from '../features/vacancies/VacanciesList';
import { RootLayout } from './RootLayout';
import { ProtectedLayout } from './ProtectedLayout';

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
