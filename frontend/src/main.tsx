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
    text: { primary: '#202020', secondary: '#626263' },
    primary: { main: '#2e6b34', light: '#ecfbec' },
    secondary: { main: '#900C3F', contrastText: '#E5F6FD' },
    background: { default: '#F4F5F7', paper: '#FFFFFF' },
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
