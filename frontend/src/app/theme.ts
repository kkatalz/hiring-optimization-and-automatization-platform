import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    text: { primary: '#202020', secondary: '#666666' },
    primary: { main: '#2e6b34', light: '#ecfbec' },
    secondary: { main: '#D32F2F', light: '#FCECEC', contrastText: '#E5F6FD' },
    info: {
      main: '#ef7614',
      contrastText: '#0288D1',
      dark: '#8A3324',
      light: '#FFF4E5',
    },
    background: { default: '#F4F5F7', paper: '#FFFFFF' },
    grey: {
      50: '#6C6C6C',
    },
  },
});
