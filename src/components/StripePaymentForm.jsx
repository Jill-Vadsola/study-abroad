import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  TextField,
} from "@mui/material";
import { CardPayment, Lock } from "@mui/icons-material";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import stripeService from "../services/stripeService";

/**
 * StripePaymentForm Component
 *
 * Handles payment processing using Stripe Payment Elements
 * Must be wrapped with <Elements stripe={stripePromise}> provider
 *
 * @param {string} clientSecret - Payment Intent client secret from backend
 * @param {number} amount - Amount in cents to charge
 * @param {string} currency - Currency code (default: "usd")
 * @param {function} onSuccess - Callback on successful payment
 * @param {function} onError - Callback on payment error
 * @param {boolean} loading - Loading state from parent
 */
const StripePaymentForm = ({
  clientSecret,
  amount,
  currency = "usd",
  onSuccess,
  onError,
  loading = false,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [cardComplete, setCardComplete] = useState(false);
  const [billingDetails, setBillingDetails] = useState({
    name: "",
    email: "",
    zipCode: "",
  });

  /**
   * Handle card element changes
   */
  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    if (event.error) {
      setError(event.error.message);
    } else {
      setError("");
    }
  };

  /**
   * Handle payment form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      setError("Payment form not ready. Please try again.");
      return;
    }

    if (!cardComplete) {
      setError("Please enter complete card details");
      return;
    }

    try {
      setProcessing(true);
      setError("");

      // Confirm card payment with CardElement
      const { paymentIntent, error: stripeError } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: billingDetails.name || undefined,
              email: billingDetails.email || undefined,
              address: {
                postal_code: billingDetails.zipCode || undefined,
              },
            },
          },
        });

      if (stripeError) {
        setError(stripeError.message);
        onError?.(stripeError);
      } else if (paymentIntent.status === "succeeded") {
        // Payment successful
        onSuccess?.({
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          status: paymentIntent.status,
        });
      } else if (paymentIntent.status === "requires_action") {
        setError(
          "Payment requires additional verification. Please complete the authentication."
        );
      } else {
        setError(`Payment status: ${paymentIntent.status}`);
      }
    } catch (err) {
      setError(err.message || "Payment processing failed");
      onError?.(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <CardPayment />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Complete Payment
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Amount Display */}
        <Box sx={{ bgcolor: "primary.light", p: 2, borderRadius: 1, mb: 2 }}>
          <Typography variant="caption" color="textSecondary" display="block">
            Amount to be charged:
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            {stripeService.formatPrice(amount, currency)}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!stripe && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="caption">
              Loading payment form...
            </Typography>
          </Alert>
        )}

        {/* Payment Form */}
        <form onSubmit={handleSubmit}>
          {/* Billing Details Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
              Billing Details
            </Typography>
            <TextField
              fullWidth
              label="Full Name"
              size="small"
              value={billingDetails.name}
              onChange={(e) =>
                setBillingDetails({ ...billingDetails, name: e.target.value })
              }
              sx={{ mb: 1 }}
              placeholder="John Doe"
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              size="small"
              value={billingDetails.email}
              onChange={(e) =>
                setBillingDetails({ ...billingDetails, email: e.target.value })
              }
              sx={{ mb: 1 }}
              placeholder="john@example.com"
            />
            <TextField
              fullWidth
              label="ZIP/Postal Code"
              size="small"
              value={billingDetails.zipCode}
              onChange={(e) =>
                setBillingDetails({ ...billingDetails, zipCode: e.target.value })
              }
              placeholder="12345"
            />
          </Box>

          {/* Card Element Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
              Card Details
            </Typography>

            <Box
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: cardComplete ? "success.main" : "divider",
                borderRadius: 1,
                bgcolor: "background.paper",
                "& .StripeElement": {
                  fontSize: "16px",
                  lineHeight: "1.5",
                },
                "& .StripeElement--focus": {
                  borderColor: "primary.main",
                },
              }}
            >
              <CardElement
                onChange={handleCardChange}
                options={{
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "#424242",
                      "::placeholder": {
                        color: "#aab7c4",
                      },
                    },
                    invalid: {
                      color: "#fa755a",
                    },
                  },
                  hidePostalCode: false,
                }}
              />
            </Box>

            {/* Test Card Info */}
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="caption">
                <strong>Testing:</strong> Use card{" "}
                <code style={{ fontWeight: "bold" }}>4242 4242 4242 4242</code>,
                any future date, and any 3-digit CVC to test successful payments.
              </Typography>
            </Alert>
          </Box>

          {/* Submit Button */}
          <Button
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            disabled={
              processing || loading || !clientSecret || !stripe || !cardComplete
            }
            sx={{ mt: 3, py: 1.5 }}
            startIcon={processing ? undefined : <Lock />}
          >
            {processing || loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Processing...
              </>
            ) : (
              `Pay ${stripeService.formatPrice(amount, currency)}`
            )}
          </Button>

          <Typography
            variant="caption"
            color="textSecondary"
            sx={{ display: "block", mt: 2, textAlign: "center" }}
          >
            🔒 Secure payment powered by Stripe. PCI DSS Compliant.
          </Typography>
        </form>
      </CardContent>
    </Card>
  );
};

export default StripePaymentForm;
