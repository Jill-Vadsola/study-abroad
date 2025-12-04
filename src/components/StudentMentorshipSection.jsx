import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Divider,
  Empty,
  Dialog,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Business,
  CheckCircle,
  HourglassBottom,
  CancelCircle,
  Refund,
} from "@mui/icons-material";
import { connectionsApi } from "../services/connectionsApi";
import stripeService from "../services/stripeService";
import PaymentStatus from "./PaymentStatus";
import RefundRequestModal from "./RefundRequestModal";

const StudentMentorshipSection = () => {
  const [mentorships, setMentorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMentorship, setSelectedMentorship] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [paymentDetailsModalOpen, setPaymentDetailsModalOpen] = useState(false);

  useEffect(() => {
    loadMentorships();
  }, []);

  const loadMentorships = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await connectionsApi.getUserConnections("accepted");
      // Filter for student-to-mentor connections
      const mentorshipConnections = data.filter(
        (conn) => conn.connectionType === "student_to_mentor"
      );
      setMentorships(mentorshipConnections);
    } catch (err) {
      setError(err.message || "Failed to load mentorships");
    } finally {
      setLoading(false);
    }
  };

  const handleViewPaymentDetails = async (mentorship) => {
    try {
      setSelectedMentorship(mentorship);
      const details = await connectionsApi.getMentorshipPaymentDetails(
        mentorship.id
      );
      setPaymentDetails(details);
      setPaymentDetailsModalOpen(true);
    } catch (err) {
      setError(err.message || "Failed to load payment details");
    }
  };

  const handleRefundRequest = () => {
    setRefundModalOpen(true);
  };

  const handleRefundSuccess = () => {
    setRefundModalOpen(false);
    setPaymentDetailsModalOpen(false);
    loadMentorships();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "accepted":
        return <CheckCircle color="success" />;
      case "pending":
        return <HourglassBottom color="info" />;
      case "rejected":
        return <CancelCircle color="error" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "success";
      case "pending":
        return "info";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Card sx={{ borderRadius: 2 }}>
        <CardHeader title="Mentorships" />
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card sx={{ borderRadius: 2 }}>
        <CardHeader
          title="Your Mentorships"
          subheader={`${mentorships.length} active mentorship${
            mentorships.length !== 1 ? "s" : ""
          }`}
        />
        <Divider />

        <CardContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {mentorships.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <Typography color="textSecondary" gutterBottom>
                You don't have any active mentorships yet
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Visit the Networking page to find and connect with mentors
              </Typography>
            </Box>
          ) : (
            <List sx={{ width: "100%" }}>
              {mentorships.map((mentorship, index) => (
                <div key={mentorship.id}>
                  <ListItem
                    sx={{
                      py: 2,
                      "&:hover": { bgcolor: "action.hover" },
                      borderRadius: 1,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={mentorship.otherUser?.profileImageUrl}
                        sx={{ bgcolor: "primary.main" }}
                      >
                        {mentorship.otherUser?.firstName?.[0]}
                        {mentorship.otherUser?.lastName?.[0]}
                      </Avatar>
                    </ListItemAvatar>

                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {mentorship.otherUser?.firstName}{" "}
                            {mentorship.otherUser?.lastName}
                          </Typography>
                          {getStatusIcon(mentorship.status)}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          {mentorship.otherUser?.profile?.currentPosition && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Business fontSize="small" />
                              <Typography variant="caption">
                                {mentorship.otherUser.profile.currentPosition} at{" "}
                                {mentorship.otherUser.profile.company}
                              </Typography>
                            </Box>
                          )}
                          {mentorship.isPaid && (
                            <Chip
                              size="small"
                              label={stripeService.formatPrice(
                                mentorship.mentorshipPrice
                              )}
                              variant="outlined"
                              sx={{ mt: 1 }}
                            />
                          )}
                        </Box>
                      }
                    />

                    <Box sx={{ display: "flex", gap: 1, ml: 2 }}>
                      {mentorship.isPaid && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Refund />}
                          onClick={() => handleViewPaymentDetails(mentorship)}
                        >
                          View Payment
                        </Button>
                      )}
                    </Box>
                  </ListItem>
                  {index < mentorships.length - 1 && <Divider />}
                </div>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Payment Details Modal */}
      <Dialog
        open={paymentDetailsModalOpen}
        onClose={() => setPaymentDetailsModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedMentorship && paymentDetails && (
          <>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                Payment Details - {selectedMentorship.otherUser?.firstName}{" "}
                {selectedMentorship.otherUser?.lastName}
              </Typography>

              <PaymentStatus
                paymentDetails={paymentDetails}
                onRefund={handleRefundRequest}
                loading={loading}
              />

              <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setPaymentDetailsModalOpen(false)}
                >
                  Close
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Dialog>

      {/* Refund Modal */}
      {selectedMentorship && (
        <RefundRequestModal
          connectionId={selectedMentorship.id}
          open={refundModalOpen}
          onClose={() => setRefundModalOpen(false)}
          onSuccess={handleRefundSuccess}
        />
      )}
    </>
  );
};

export default StudentMentorshipSection;
