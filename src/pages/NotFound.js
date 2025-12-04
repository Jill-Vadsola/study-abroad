import React from 'react';
import { Navigate } from 'react-router-dom';

const NotFound = () => {
  // Redirect all undefined routes to home
  return <Navigate to="/" replace />;
};

export default NotFound;
