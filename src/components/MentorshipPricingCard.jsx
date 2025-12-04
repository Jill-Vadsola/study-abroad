import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
  Divider,
  Chip,
} from "@mui/material";
import { Edit, Save, Cancel, AttachMoney } from "@mui/icons-material";
import stripeService from "../services/stripeService";

const MentorshipPricingCard = ({
  currentPrice = 0,
  currency = "usd",
  onSave,
  loading = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  // currentPrice comes in cents from API, convert to dollars for input
  const [price, setPrice] = useState(currentPrice ? currentPrice / 100 : 0);
  const [priceCurrency, setPriceCurrency] = useState(currency);
  const [error, setError] = useState("");

  // Update price when currentPrice prop changes (e.g., data loaded from API)
  useEffect(() => {
    setPrice(currentPrice ? currentPrice / 100 : 0);
    setPriceCurrency(currency);
  }, [currentPrice, currency]);

  // Only consider it free if price is exactly 0, not if empty string
  const isFree = price === 0;

  const handleSave = async () => {
    try {
      if (price === "") {
        setError("Please enter a price");
        return;
      }

      const numPrice = Math.round(parseFloat(price) * 100); // Convert to cents
      if (numPrice < 0) {
        setError("Price cannot be negative");
        return;
      }

      setError("");
      await onSave(numPrice, priceCurrency);
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Failed to save pricing");
    }
  };

  const handleCancel = () => {
    // Reset to original values (convert cents to dollars)
    setPrice(currentPrice ? currentPrice / 100 : 0);
    setPriceCurrency(currency);
    setError("");
    setIsEditing(false);
  };

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardHeader
        title="Mentorship Pricing"
        icon={<AttachMoney />}
        action={
          !isEditing && (
            <Button
              size="small"
              startIcon={<Edit />}
              onClick={() => setIsEditing(true)}
              disabled={loading}
            >
              Edit
            </Button>
          )
        }
      />

      <Divider />

      <CardContent>
        {!isEditing ? (
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 2,
                p: 2,
                bgcolor: "action.hover",
                borderRadius: 1,
              }}
            >
              <Box flex={1}>
                {isFree ? (
                  <>
                    <Chip
                      label="Free Mentorship"
                      color="success"
                      variant="filled"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="textSecondary">
                      You are offering free mentorship. Students can apply without
                      payment.
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="h5" sx={{ fontWeight: "bold", mb: 0.5 }}>
                      {stripeService.formatPrice(currentPrice, currency)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      per mentorship session/connection
                    </Typography>
                  </>
                )}
              </Box>
            </Box>

            <Typography variant="caption" color="textSecondary" display="block">
              💡 Tip: Set to $0 for free mentorship or enter your desired price.
              Students will authorize this amount when applying.
            </Typography>
          </Box>
        ) : (
          <Box>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isFree}
                    onChange={(e) => {
                      if (e.target.checked) {
                        // Free mentorship - set price to 0
                        setPrice(0);
                      } else {
                        // Paid mentorship - clear price for user to enter
                        setPrice("");
                      }
                    }}
                    disabled={loading}
                  />
                }
                label="Offer Free Mentorship"
              />
            </Box>

            {!isFree && (
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Mentorship Price"
                  placeholder="99.99"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={loading}
                  inputProps={{
                    step: "0.01",
                    min: "0",
                  }}
                  helperText="Enter the amount in dollars"
                  sx={{ mb: 2 }}
                />

                <TextField
                  select
                  fullWidth
                  label="Currency"
                  value={priceCurrency}
                  onChange={(e) => setPriceCurrency(e.target.value)}
                  disabled={loading}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="usd">USD ($)</option>
                  <option value="eur">EUR (€)</option>
                  <option value="gbp">GBP (£)</option>
                  <option value="cad">CAD (C$)</option>
                  <option value="aud">AUD (A$)</option>
                </TextField>
              </Box>
            )}

            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="caption">
                <strong>How it works:</strong> When a student applies for mentorship,
                they pre-authorize this amount with Stripe. When you accept their
                request, the payment is charged. They can request a refund within 30
                days.
              </Typography>
            </Alert>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={loading}
                sx={{ flex: 1 }}
              >
                {loading ? <CircularProgress size={24} /> : "Save"}
              </Button>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={loading}
                sx={{ flex: 1 }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default MentorshipPricingCard;
