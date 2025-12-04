import React, { useState } from "react";
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  School,
  CheckCircle,
  Error,
  ArrowBack,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";
import ApiService from "../services/enhancedApi";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (emailValue) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      // Call backend to request password reset
      const response = await ApiService.makeRequest("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
        successMessage: null,
        errorMessage: null,
      });

      if (response) {
        setSubmitted(true);
        toast.showSuccess("Password reset link sent to your email!");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(
        err.message || "Failed to send reset email. Please try again later."
      );
      toast.showError(
        err.message || "Failed to send reset email. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 3,
        }}
      >
        <School sx={{ fontSize: 50, color: "primary.main", mb: 2 }} />
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Reset Password
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {submitted ? (
          <Box textAlign="center">
            <CheckCircle sx={{ fontSize: 60, color: "success.main", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Check Your Email
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              We've sent a password reset link to <strong>{email}</strong>
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Check your email (including spam folder) for instructions to reset
              your password. The link will expire in 1 hour.
            </Alert>

            <Button
              fullWidth
              variant="contained"
              startIcon={<ArrowBack />}
              onClick={() => navigate("/login")}
              sx={{ mb: 1 }}
            >
              Back to Login
            </Button>

            <Typography variant="body2" color="text.secondary">
              Didn't receive the email?{" "}
              <Link
                component="button"
                variant="body2"
                onClick={(e) => {
                  e.preventDefault();
                  setSubmitted(false);
                  setEmail("");
                }}
                sx={{ textDecoration: "none" }}
              >
                Try again
              </Link>
            </Typography>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter your email address and we'll send you a link to reset your
              password.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              margin="normal"
              disabled={loading}
              error={!!error}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, position: "relative" }}
              disabled={loading || !email.trim()}
            >
              {loading && (
                <CircularProgress
                  size={24}
                  sx={{
                    position: "absolute",
                    left: "50%",
                    marginLeft: "-12px",
                  }}
                />
              )}
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>

            <Box textAlign="center">
              <Link
                component="button"
                variant="body2"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/login");
                }}
                sx={{ textDecoration: "none" }}
              >
                Back to Login
              </Link>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ForgotPassword;
