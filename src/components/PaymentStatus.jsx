import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  Button,
  Alert,
} from "@mui/material";
import {
  CheckCircle,
  HourglassBottom,
  CancelCircle,
  Refresh,
} from "@mui/icons-material";
import stripeService from "../services/stripeService";

const PaymentStatus = ({ paymentDetails, onRefund, loading = false }) => {
  if (!paymentDetails || !paymentDetails.isPaid) {
    return (
      <Alert severity="info">
        This is a <strong>free mentorship</strong> - no payment required.
      </Alert>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "payment_intent_succeeded":
        return <CheckCircle color="success" />;
      case "payment_intent_created":
        return <HourglassBottom color="info" />;
      case "payment_refunded":
        return <Refresh color="warning" />;
      default:
        return <CancelCircle color="error" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "payment_intent_succeeded":
        return "Paid";
      case "payment_intent_created":
        return "Pre-Authorized";
      case "payment_refunded":
        return "Refunded";
      default:
        return "Failed";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "payment_intent_succeeded":
        return "success";
      case "payment_intent_created":
        return "info";
      case "payment_refunded":
        return "warning";
      default:
        return "error";
    }
  };

  const canRefund =
    paymentDetails.paymentStatus === "payment_intent_succeeded" &&
    paymentDetails.chargedAt &&
    !paymentDetails.refundedAt;

  const daysSinceCharge = paymentDetails.chargedAt
    ? Math.floor(
        (new Date() - new Date(paymentDetails.chargedAt)) / (1000 * 60 * 60 * 24)
      )
    : 0;

  const isWithinRefundWindow = daysSinceCharge <= 30;

  return (
    <Card sx={{ bgcolor: "background.paper" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          {getStatusIcon(paymentDetails.paymentStatus)}
          <Box>
            <Typography variant="subtitle2">Payment Status</Typography>
            <Chip
              label={getStatusLabel(paymentDetails.paymentStatus)}
              color={getStatusColor(paymentDetails.paymentStatus)}
              size="small"
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Payment Amount */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Amount
          </Typography>
          <Typography variant="h6">
            {stripeService.formatPrice(paymentDetails.amount, paymentDetails.currency)}
          </Typography>
        </Box>

        {/* Charged Date */}
        {paymentDetails.chargedAt && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Charged On
            </Typography>
            <Typography variant="body2">
              {new Date(paymentDetails.chargedAt).toLocaleDateString()} at{" "}
              {new Date(paymentDetails.chargedAt).toLocaleTimeString()}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              ({daysSinceCharge} days ago)
            </Typography>
          </Box>
        )}

        {/* Refund Information */}
        {paymentDetails.refundedAt && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ bgcolor: "warning.light", p: 2, borderRadius: 1, mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
                Refund Processed
              </Typography>
              <Typography variant="caption">
                Refund Amount: {stripeService.formatPrice(paymentDetails.refundedAmount)}
              </Typography>
              <Typography variant="caption" display="block">
                Refunded On: {new Date(paymentDetails.refundedAt).toLocaleDateString()}
              </Typography>
              <Typography variant="caption" display="block" color="textSecondary">
                Status: {paymentDetails.refundStatus}
              </Typography>
            </Box>
          </>
        )}

        {/* Refund Option */}
        {canRefund && isWithinRefundWindow && (
          <>
            <Divider sx={{ my: 2 }} />
            <Alert severity="info" sx={{ mb: 2 }}>
              You can request a refund for {30 - daysSinceCharge} more days.
            </Alert>
            <Button
              fullWidth
              variant="outlined"
              color="warning"
              onClick={onRefund}
              disabled={loading}
              sx={{ mt: 1 }}
            >
              Request Refund
            </Button>
          </>
        )}

        {canRefund && !isWithinRefundWindow && (
          <Alert severity="error">
            Refund window has expired (30 days). You can no longer request a refund
            for this mentorship.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentStatus;
