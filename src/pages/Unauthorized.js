import React from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Alert,
} from '@mui/material';
import {
  Lock,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: 2,
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Lock sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
        </Box>

        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Unauthorized Access
        </Typography>

        <Alert severity="warning" sx={{ my: 3, textAlign: 'left' }}>
          You need to be logged in to access this page. Please log in to your account to continue.
        </Alert>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          If you don't have an account yet, you can create one to get started.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/login')}
            fullWidth
          >
            Go to Login
          </Button>

          <Button
            variant="outlined"
            color="primary"
            size="large"
            onClick={() => navigate('/register')}
            fullWidth
          >
            Create Account
          </Button>

          <Button
            variant="text"
            color="primary"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/')}
            fullWidth
            sx={{ mt: 2 }}
          >
            Back to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Unauthorized;
