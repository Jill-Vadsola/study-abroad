import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import { connectionsApi } from "../services/connectionsApi";

const RefundRequestModal = ({ connectionId, open, onClose, onSuccess }) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      if (!reason.trim()) {
        setError("Please provide a reason for the refund request");
        return;
      }

      setError("");
      setLoading(true);

      const response = await connectionsApi.requestRefundForMentorship(
        connectionId,
        reason
      );

      onSuccess(response);
      handleClose();
    } catch (err) {
      setError(err.message || "Failed to process refund request");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Request Refund</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            You are requesting a refund for this mentorship. This action cannot be
            undone.
          </Alert>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Typography variant="body2" sx={{ mb: 2, color: "textSecondary" }}>
            Please tell us why you would like to request a refund:
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Reason for Refund"
            placeholder="e.g., Found another mentor, schedule conflict, not satisfied with mentorship..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={loading}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="warning"
          disabled={loading || !reason.trim()}
        >
          {loading ? <CircularProgress size={24} /> : "Request Refund"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RefundRequestModal;
