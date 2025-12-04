import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useUser();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);

  // Give the user context a moment to update after logout/login
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  // Show loading while waiting for auth state to update
  if (!isReady) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
