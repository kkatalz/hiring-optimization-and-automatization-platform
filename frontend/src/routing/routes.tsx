import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RestoreSession } from './RestoreSession';
import { LoginForm } from '../features/auth/components/LoginForm';
import { RequireAuth } from './RequireAuth';
import MainVacanciesPage from '../features/vacancies/pages/MainVacanciesPage';
import VacancyDetailsPage from '../features/vacancies/pages/VacancyDetailsPage';
import MainVacancySubmissionsPage from '../features/vacancySubmissions/pages/MainVacancySubmissionsPage';
import VacancyOverview from '../features/vacancies/components/tabs/VacancyOverview';
import ScreeningQuestionsView from '../features/vacancies/components/tabs/ScreeningQuestionsView';
import AppLayout from '../layout/AppLayout';
import { RequireRole } from './RequireRole';
import BrowseVacancies from '../features/vacancies/pages/BrowseVacancies';
import PublicVacancy from '../features/vacancies/pages/PublicVacancy';

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
