import { StrictMode } from 'react';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import './index.css';
import { store } from './app/store.ts';
import routes from './routing/routes.tsx';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    primary: { main: '#2e6b34', light: '#EDF7ED' },
    secondary: { main: '#900C3F', contrastText: '#E5F6FD' },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={routes} />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
