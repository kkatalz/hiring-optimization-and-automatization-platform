import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from './RootLayout';
import { LoginForm } from '../components/auth/LoginForm';
import { ProtectedLayout } from './ProtectedLayout';
import MainVacanciesPage from '../components/vacancies/MainVacanciesPage';
import VacancyDetailsPage from '../components/vacancies/VacancyDetailsPage';
import VacancySubmissionsList from '../components/vacancySubmissions/VacancySubmissionsList';
import VacancyOverview from '../components/vacancies/VacancyOverview';
import ScreeningQuestionsView from '../components/vacancies/ScreeningQuestionsView';
import AppLayout from './AppLayout';

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
        children: [
          {
            Component: AppLayout,
            children: [
              { path: '/vacancies', Component: MainVacanciesPage },
              {
                path: '/vacancies/:vacancyId',
                Component: VacancyDetailsPage,
                children: [
                  {
                    index: true,
                    element: <Navigate to='candidates' replace />,
                  },
                  { path: 'candidates', Component: VacancySubmissionsList },
                  { path: 'overview', Component: VacancyOverview },
                  {
                    path: 'screening-questions',
                    Component: ScreeningQuestionsView,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);

export default routes;
