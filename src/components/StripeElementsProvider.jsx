// StripeElementsProvider Component
// Wrapper component that initializes Stripe Elements for the entire application
//
// SETUP INSTRUCTIONS:
//
// 1. In your main App.jsx/App.js file, import this component:
//    import StripeElementsProvider from './components/StripeElementsProvider';
//
// 2. Wrap your entire app with it:
//    function App() {
//      return (
//        <StripeElementsProvider>
//          {Your app routes and components}
//        </StripeElementsProvider>
//      );
//    }
//
// 3. Make sure REACT_APP_STRIPE_PUBLISHABLE_KEY is set in your .env file
//
// Once wrapped, you can use useStripe() and useElements() hooks anywhere
// in your child components to access Stripe instance and Elements.

import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Box, Alert, Typography, CircularProgress } from '@mui/material';

// Load Stripe promise once (outside component to avoid re-creation)
let stripePromise;

const getStripePromise = () => {
  const publishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

  if (!publishableKey) {
    console.error(
      'Stripe publishable key is not set. ' +
      'Please add REACT_APP_STRIPE_PUBLISHABLE_KEY to your .env file'
    );
    return null;
  }

  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
};

// StripeElementsProvider
// Wraps the app with Stripe Elements context provider
// @param {React.ReactNode} children - Child components to render
const StripeElementsProvider = ({ children }) => {
  const stripePromise = getStripePromise();
  const [stripeReady, setStripeReady] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (!stripePromise) {
      setError('Stripe is not properly configured');
      return;
    }

    // Test that Stripe loads successfully
    stripePromise
      .then((stripe) => {
        if (stripe) {
          setStripeReady(true);
        } else {
          setError('Failed to load Stripe');
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to initialize Stripe');
      });
  }, []);

  // Show error if Stripe configuration is missing
  if (error) {
    return (
      <Box sx={{ p: 4, bgcolor: 'error.light' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Stripe Configuration Error
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            {error}
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Please check that REACT_APP_STRIPE_PUBLISHABLE_KEY is set in your .env file.
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Show loading while Stripe initializes
  if (!stripeReady) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="body2" color="textSecondary">
            Loading payment system...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Render with Elements provider
  return (
    <Elements
      stripe={stripePromise}
      options={{
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#1976d2',
            colorBackground: '#ffffff',
            colorText: '#424242',
            colorDanger: '#d32f2f',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            spacingUnit: '4px',
            borderRadius: '4px',
          },
        },
      }}
    >
      {children}
    </Elements>
  );
};

export default StripeElementsProvider;
