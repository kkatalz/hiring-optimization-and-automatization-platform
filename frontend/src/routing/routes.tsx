import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './RootLayout';
import { LoginForm } from '../components/auth/LoginForm';
import { ProtectedLayout } from './ProtectedLayout';
import MainVacanciesPage from '../components/vacancies/MainVacanciesPage';

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
        children: [{ path: '/vacancies', Component: MainVacanciesPage }],
      },
    ],
  },
]);

export default routes;
