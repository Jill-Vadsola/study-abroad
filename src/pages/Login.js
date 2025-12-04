import React, { useState } from "react";
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  School,
  CheckCircle,
  Error,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { useToast } from "../contexts/ToastContext";
import ApiService from "../services/enhancedApi";
import { validateLoginForm, validateField } from "../utils/validation";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const toast = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Real-time validation
    if (touched[name]) {
      const fieldError = validateField(name, value, formData);
      setErrors((prev) => ({
        ...prev,
        [name]: fieldError,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Validate field on blur
    const fieldError = validateField(name, value, formData);
    setErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));
  };

  const validateForm = () => {
    const formErrors = validateLoginForm(formData);
    setErrors(formErrors);
    setTouched({
      email: true,
      password: true,
    });
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.showError("Please fix the errors in the form", "Validation Error");
      return;
    }

    setLoading(true);

    try {
      console.log("Login attempt:", formData);

      // Call the backend API (toast notifications handled by enhanced API)
      const response = await ApiService.login({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (response.token) {
        // Update the user context (this will handle secure storage)
        login(response.user, response.token);

        // Navigate based on entity type or to networking page
        const entityDashboard =
          response.user?.entityType === "student"
            ? "/student-dashboard"
            : response.user?.entityType === "mentor"
            ? "/mentor-dashboard"
            : response.user?.entityType === "university"
            ? "/university-dashboard"
            : "/networking";

        // Small delay to show success message before navigation
        setTimeout(() => {
          navigate(entityDashboard);
        }, 1000);
      } else {
        throw new Error("No token received from server");
      }
    } catch (error) {
      console.error("Login error:", error);

      // Handle specific error cases
      if (error.status === 401) {
        setErrors({
          email: " ", // Highlight email field
          password: "Invalid email or password",
        });
      } else if (error.status === 429) {
        toast.showError(
          "Too many login attempts. Please try again later.",
          "Rate Limit Exceeded"
        );
      } else if (!error.status) {
        // Network error already handled by enhanced API
        setErrors({
          general: "Unable to connect to server. Please check your connection.",
        });
      }
      // Other errors are handled by the global toast system
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // TODO: Implement social login
    console.log(`${provider} login clicked`);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <School sx={{ fontSize: 40, color: "primary.main", mr: 1 }} />
            <Typography component="h1" variant="h4" fontWeight="bold">
              Welcome Back
            </Typography>
          </Box>

          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            sx={{ mb: 4 }}
          >
            Sign in to your StudyConnect account to continue networking with
            international students.
          </Typography>

          {errors.general && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {errors.general}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.email}
              helperText={errors.email || "Enter your registered email address"}
              InputProps={{
                endAdornment: formData.email && !errors.email && (
                  <InputAdornment position="end">
                    <CheckCircle color="success" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.password}
              helperText={errors.password || "Enter your password"}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {formData.password && !errors.password && !showPassword && (
                      <CheckCircle
                        color="success"
                        fontSize="small"
                        sx={{ mr: 1 }}
                      />
                    )}
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={
                loading || Object.keys(errors).some((key) => errors[key])
              }
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                position: "relative",
              }}
            >
              {loading && (
                <CircularProgress
                  size={20}
                  sx={{
                    position: "absolute",
                    left: "50%",
                    marginLeft: "-10px",
                  }}
                />
              )}
              {loading ? "Signing In..." : "Sign In"}
            </Button>

            <Box textAlign="center" sx={{ mb: 2 }}>
              <Link
                component="button"
                variant="body2"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/forgot-password");
                }}
                sx={{ textDecoration: "none" }}
              >
                Forgot password?
              </Link>
            </Box>

            <Box textAlign="center">
              <Typography variant="body2">
                Don't have an account?{" "}
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate("/register")}
                  sx={{ textDecoration: "none", fontWeight: "bold" }}
                >
                  Sign up here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
