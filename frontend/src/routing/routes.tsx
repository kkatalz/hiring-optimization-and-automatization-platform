import { createBrowserRouter } from 'react-router-dom';
import { LoginForm } from '../features/auth/LoginForm';
import { RootLayout } from './RootLayout';
import { ProtectedLayout } from './ProtectedLayout';
import CreateVacancy from '../features/vacancies/CreateVacancy';

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
        children: [{ path: '/vacancies', Component: CreateVacancy }],
      },
    ],
  },
]);

export default routes;
