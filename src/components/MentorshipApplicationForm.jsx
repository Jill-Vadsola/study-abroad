import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Divider,
} from "@mui/material";
import { School, Work, CheckCircle, Lock } from "@mui/icons-material";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import mentorshipApi from "../services/mentorshipApi";
import stripeService from "../services/stripeService";

const MentorshipApplicationForm = ({ mentor, open, onClose, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [formData, setFormData] = useState({
    message: "",
    goals: "",
    availability: "",
  });
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [billingDetails, setBillingDetails] = useState({
    name: "",
    email: "",
    zipCode: "",
  });

  const mentorshipPrice = mentor?.mentorshipPrice || mentor?.mentorProfile?.mentorshipPrice || 0;
  const isPaid = mentorshipPrice > 0;

  useEffect(() => {
    if (open && mentor) {
      console.log("MentorshipApplicationForm opened with mentor:", mentor);
      console.log("Mentor ID:", mentor.id || mentor._id);
      console.log("Mentorship Price:", mentorshipPrice);
      console.log("Is Paid:", isPaid);
    }
  }, [open, mentor, mentorshipPrice, isPaid]);

  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    if (event.error) {
      setError(event.error.message);
    } else {
      setError("");
    }
  };

  const handlePaymentSubmit = async () => {
    if (!stripe || !elements || !paymentInfo?.clientSecret) {
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
      const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(
        paymentInfo.clientSecret,
        {
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
        }
      );

      if (stripeError) {
        setError(stripeError.message);
      } else if (paymentIntent.status === "succeeded") {
        // Payment successful
        onSuccess?.({
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          status: paymentIntent.status,
        });
        handleClose();
      } else if (paymentIntent.status === "requires_action") {
        setError("Payment requires additional verification. Please complete the authentication.");
      } else {
        setError(`Payment status: ${paymentIntent.status}`);
      }
    } catch (err) {
      setError(err.message || "Payment processing failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setError("");
      setLoading(true);

      // Validate required fields
      if (!formData.message.trim()) {
        setError("Application message is required");
        return;
      }

      // Apply for mentorship
      const response = await mentorshipApi.applyForMentorship(
        mentor.id || mentor._id,
        formData.message,
        formData.goals,
        formData.availability,
        mentor.mentorshipPrice,
        mentor.paymentCurrency || "usd"
      );

      if (isPaid && response.paymentIntentClientSecret) {
        // Store payment info for Stripe integration
        setPaymentInfo({
          clientSecret: response.paymentIntentClientSecret,
          paymentId: response.paymentId,
          amount: response.mentorshipPrice,
          currency: mentor.paymentCurrency || "usd",
        });
      } else {
        // Free mentorship - success
        onSuccess(response);
        handleClose();
      }
    } catch (err) {
      setError(err.message || "Failed to apply for mentorship");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      message: "",
      goals: "",
      availability: "",
    });
    setError("");
    setPaymentInfo(null);
    setCardComplete(false);
    setProcessing(false);
    setBillingDetails({
      name: "",
      email: "",
      zipCode: "",
    });
    onClose();
  };

  if (!mentor) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Apply for Mentorship</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* Mentor Info */}
          <Card sx={{ mb: 3, bgcolor: "action.hover" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {mentor.firstName} {mentor.lastName}
              </Typography>

              {(mentor.profile?.currentPosition || mentor.mentorProfile?.currentPosition || mentor.currentPosition) && (
                <>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <Work fontSize="small" />
                    <Typography variant="body2">
                      {(mentor.profile?.currentPosition || mentor.mentorProfile?.currentPosition || mentor.currentPosition)} at{" "}
                      {(mentor.profile?.company || mentor.mentorProfile?.company || mentor.company)}
                    </Typography>
                  </Box>

                  {(mentor.profile?.expertise || mentor.mentorProfile?.expertise || mentor.expertise) && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="textSecondary">
                        Expertise:
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
                        {(mentor.profile?.expertise || mentor.mentorProfile?.expertise || mentor.expertise || []).map((exp) => (
                          <Chip key={exp} label={exp} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {isPaid && (
                    <Box sx={{ bgcolor: "primary.light", p: 1, borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        Mentorship Cost: {stripeService.formatPrice(mentorshipPrice)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        (charged when mentor accepts your application)
                      </Typography>
                    </Box>
                  )}

                  {!isPaid && (
                    <Box sx={{ bgcolor: "success.light", p: 1, borderRadius: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CheckCircle fontSize="small" color="success" />
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          Free Mentorship!
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* Application Form */}
          {!paymentInfo && (
            <>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Why do you want to connect with this mentor?"
                placeholder="Share your motivation, goals, and what you hope to learn..."
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                disabled={loading}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                multiline
                rows={2}
                label="Your Mentorship Goals (Optional)"
                placeholder="What specific areas do you want help with?"
                name="goals"
                value={formData.goals}
                onChange={handleInputChange}
                disabled={loading}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                multiline
                rows={2}
                label="Your Availability (Optional)"
                placeholder="When are you available to connect?"
                name="availability"
                value={formData.availability}
                onChange={handleInputChange}
                disabled={loading}
              />
            </>
          )}

          {/* Payment Form */}
          {paymentInfo && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <Lock />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Complete Payment
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Amount Display */}
                <Box sx={{ bgcolor: "primary.light", p: 2, borderRadius: 1, mb: 3 }}>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Amount to be charged:
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                    {stripeService.formatPrice(paymentInfo.amount, paymentInfo.currency || "usd")}
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                {!stripe && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="caption">Loading payment form...</Typography>
                  </Alert>
                )}

                {/* Billing Details */}
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

                {/* Card Element */}
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
                      <strong>Testing:</strong> Use card <code style={{ fontWeight: "bold" }}>4242 4242 4242 4242</code>,
                      any future date, and any 3-digit CVC to test successful payments.
                    </Typography>
                  </Alert>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading || processing}>
          {paymentInfo ? "Back" : "Close"}
        </Button>
        {!paymentInfo && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading || !formData.message.trim()}
          >
            {loading ? <CircularProgress size={24} /> : "Apply"}
          </Button>
        )}
        {paymentInfo && (
          <Button
            onClick={handlePaymentSubmit}
            variant="contained"
            color="primary"
            disabled={processing || !stripe || !cardComplete}
            startIcon={processing ? undefined : <Lock />}
          >
            {processing ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Processing...
              </>
            ) : (
              `Pay ${stripeService.formatPrice(paymentInfo.amount, paymentInfo.currency || "usd")}`
            )}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default MentorshipApplicationForm;
