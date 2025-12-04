import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  TextField,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { CheckCircle, Close } from "@mui/icons-material";
import { connectionsApi } from "../services/connectionsApi";
import stripeService from "../services/stripeService";

const MentorshipPaymentModal = ({
  connection,
  open,
  onClose,
  onSuccess,
  loading: externalLoading = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [action, setAction] = useState(null); // "accept" or "reject"

  const isPaid = connection?.isPaid;
  const mentorshipPrice = connection?.mentorshipPrice;

  const handleAccept = async () => {
    try {
      setError("");
      setLoading(true);

      if (isPaid) {
        // For paid mentorship, we need payment method ID from Stripe
        // In a real implementation, you'd use Stripe Elements to collect payment
        // For now, show a message about completing payment
        setError(
          "Payment form integration needed: Complete Stripe payment form to confirm"
        );
        return;
      }

      // Free mentorship - just accept
      const response = await connectionsApi.acceptMentorshipRequest(
        connection._id
      );
      onSuccess(response);
      handleClose();
    } catch (err) {
      setError(err.message || "Failed to accept mentorship request");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      if (!rejectReason.trim() && action === "reject") {
        setError("Please provide a reason for rejection");
        return;
      }

      setError("");
      setLoading(true);

      const response = await connectionsApi.rejectMentorshipRequest(
        connection._id,
        rejectReason
      );
      onSuccess(response);
      handleClose();
    } catch (err) {
      setError(err.message || "Failed to reject mentorship request");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setRejectReason("");
    setAction(null);
    onClose();
  };

  if (!connection) return null;

  const student = connection.fromUser;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Mentorship Application</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* Student Info */}
          <Card sx={{ mb: 3, bgcolor: "action.hover" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {student?.firstName} {student?.lastName}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {student?.email}
              </Typography>

              {student?.entityType === "student" && student?.profile && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" color="textSecondary" display="block">
                    University: {student.profile.university}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Major: {student.profile.major}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>

          {/* Application Message */}
          {connection.message && (
            <Box sx={{ mb: 3, p: 2, bgcolor: "background.default", borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Application Message:
              </Typography>
              <Typography variant="body2">{connection.message}</Typography>
            </Box>
          )}

          {/* Application Metadata */}
          {connection.metadata && (
            <Box sx={{ mb: 3 }}>
              {connection.metadata.goals && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" color="textSecondary">
                    Their Goals:
                  </Typography>
                  <Typography variant="body2">{connection.metadata.goals}</Typography>
                </Box>
              )}
              {connection.metadata.availability && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" color="textSecondary">
                    Availability:
                  </Typography>
                  <Typography variant="body2">
                    {connection.metadata.availability}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Payment Info */}
          {isPaid && (
            <Box sx={{ bgcolor: "primary.light", p: 2, borderRadius: 1, mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <CheckCircle fontSize="small" />
                <Typography variant="subtitle2">Mentorship Payment</Typography>
              </Box>
              <Typography variant="h6">
                {stripeService.formatPrice(mentorshipPrice)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                (Payment pre-authorized. Will be charged when you accept.)
              </Typography>
            </Box>
          )}

          {!isPaid && (
            <Box sx={{ bgcolor: "success.light", p: 2, borderRadius: 1, mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                ✓ Free Mentorship - No payment required
              </Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Accept/Reject Options */}
          {!action && (
            <Box sx={{ display: "flex", gap: 2, justifyContent: "space-between" }}>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleAccept()}
                disabled={loading || externalLoading}
                sx={{ flex: 1 }}
              >
                {loading ? <CircularProgress size={24} /> : "Accept"}
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => setAction("reject")}
                disabled={loading || externalLoading}
                sx={{ flex: 1 }}
              >
                <Close /> Reject
              </Button>
            </Box>
          )}

          {/* Reject Reason Input */}
          {action === "reject" && (
            <Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Why are you rejecting this mentorship request?
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Optional: Provide a reason for rejection"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                disabled={loading}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleReject}
                  disabled={loading}
                  sx={{ flex: 1 }}
                >
                  {loading ? <CircularProgress size={24} /> : "Confirm Rejection"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setAction(null)}
                  disabled={loading}
                  sx={{ flex: 1 }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default MentorshipPaymentModal;
