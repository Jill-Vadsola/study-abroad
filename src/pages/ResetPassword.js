import React, { useState, useEffect } from "react";
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
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  School,
  CheckCircle,
  Error,
  Visibility,
  VisibilityOff,
  ArrowBack,
} from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";
import ApiService from "../services/enhancedApi";

const ResetPassword = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [tokenValid, setTokenValid] = useState(false);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError("Invalid or missing reset token. Please request a new password reset link.");
        setTokenValid(false);
        setVerifying(false);
        return;
      }

      try {
        const response = await ApiService.makeRequest(
          `/auth/verify-reset-token?token=${token}`,
          {
            method: "GET",
            successMessage: null,
            errorMessage: null,
          }
        );

        if (response && response.valid) {
          setTokenValid(true);
        } else {
          setError("Reset token is invalid or expired. Please request a new password reset link.");
        }
      } catch (err) {
        setError(
          "Reset token is invalid or expired. Please request a new password reset link."
        );
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await ApiService.makeRequest("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
        successMessage: null,
        errorMessage: null,
      });

      if (response) {
        setSubmitted(true);
        toast.showSuccess("Password reset successfully!");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setError(err.message || "Failed to reset password. Please try again.");
      toast.showError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "400px",
          }}
        >
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Verifying reset token...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!tokenValid) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: "center" }}>
          <Error sx={{ fontSize: 60, color: "error.main", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Invalid Reset Link
          </Typography>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>

          <Button
            fullWidth
            variant="contained"
            onClick={() => navigate("/forgot-password")}
            sx={{ mb: 1 }}
          >
            Request New Reset Link
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate("/login")}
          >
            Back to Login
          </Button>
        </Paper>
      </Container>
    );
  }

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
          Set New Password
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {submitted ? (
          <Box textAlign="center">
            <CheckCircle sx={{ fontSize: 60, color: "success.main", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Password Reset Successfully
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Your password has been reset. Redirecting to login page...
            </Typography>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter a new password for your account. Make sure it's at least 8
              characters long.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="New Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end"
                      disabled={loading}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, position: "relative" }}
              disabled={loading}
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
              {loading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;
