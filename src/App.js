import React, { useState } from 'react';
import { Container, Box, Typography, Paper, Tabs, Tab, CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import VideoAnalyzer from './components/analyzers/VideoAnalyzer';
import ImageAnalyzer from './components/analyzers/ImageAnalyzer';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    secondary: {
      main: '#ff4081',
      light: '#ff79b0',
      dark: '#c60055',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Arial", sans-serif',
    h3: {
      fontWeight: 600,
      fontSize: '2rem',
      '@media (min-width:600px)': {
        fontSize: '2.5rem',
      },
    },
    h5: {
      fontWeight: 500,
    },
    body1: {
      lineHeight: 1.8,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

function App() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
            AI Content Analyzer
          </Typography>
          
          <Paper sx={{ mb: 3, overflow: 'hidden' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              centered
              indicatorColor="primary"
              textColor="primary"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Video Analysis" />
              <Tab label="Image Analysis" />
            </Tabs>
          </Paper>

          <Box role="tabpanel" hidden={tabValue !== 0}>
            {tabValue === 0 && <VideoAnalyzer />}
          </Box>
          <Box role="tabpanel" hidden={tabValue !== 1}>
            {tabValue === 1 && <ImageAnalyzer />}
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;