import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RestoreSession } from './RestoreSession';
import { LoginForm } from '../components/auth/LoginForm';
import { RequireAuth } from './RequireAuth';
import MainVacanciesPage from '../components/vacancies/MainVacanciesPage';
import VacancyDetailsPage from '../components/vacancies/VacancyDetailsPage';
import MainVacancySubmissionsPage from '../components/vacancySubmissions/MainVacancySubmissionsPage';
import VacancyOverview from '../components/vacancies/VacancyOverview';
import ScreeningQuestionsView from '../components/vacancies/ScreeningQuestionsView';
import AppLayout from '../layout/AppLayout';
import { RequireRole } from './RequireRole';
import BrowseVacancies from '../components/vacancies/public/BrowseVacancies';
import PublicVacancy from '../components/vacancies/public/PublicVacancy';

const routes = createBrowserRouter([
  {
    Component: RestoreSession,
    children: [
      {
        path: '/login',
        Component: LoginForm,
      },

      {
        element: <AppLayout withDrawer />,
        children: [
          {
            path: '/',
            Component: BrowseVacancies, // public endpoint
          },
          {
            Component: RequireAuth,
            children: [
              {
                // Only for admin, superAdmin and recruiter
                Component: RequireRole,
                children: [
                  { path: '/vacancies', Component: MainVacanciesPage },
                ],
              },
            ],
          },
        ],
      },

      // Detail screens - no drawer
      {
        element: <AppLayout withDrawer={false} />,
        children: [
          {
            path: '/browse/:vacancyId',
            Component: PublicVacancy, // public endpoint
            children: [
              {
                index: true,
                element: <Navigate to='overview' replace />,
              },
              {
                path: 'overview',
                Component: VacancyOverview,
              },
            ],
          },
          {
            Component: RequireAuth,
            children: [
              {
                // Only for admin, superAdmin and recruiter
                Component: RequireRole,
                children: [
                  {
                    path: '/vacancies/:vacancyId',
                    Component: VacancyDetailsPage,
                    children: [
                      {
                        index: true,
                        element: <Navigate to='candidates' replace />,
                      },
                      {
                        path: 'candidates',
                        Component: MainVacancySubmissionsPage,
                      },
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
    ],
  },
]);

export default routes;
