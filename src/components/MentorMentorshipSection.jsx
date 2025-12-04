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
  Alert,
  CircularProgress,
  Dialog,
  TextField,
} from "@mui/material";
import {
  School,
  CheckCircle,
  HourglassBottom,
  AttachMoney,
  Close,
  Check,
} from "@mui/icons-material";
import { connectionsApi } from "../services/connectionsApi";
import stripeService from "../services/stripeService";
import MentorshipPaymentModal from "./MentorshipPaymentModal";

const MentorMentorshipSection = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    loadMentorshipData();
  }, []);

  const loadMentorshipData = async () => {
    try {
      setLoading(true);
      setError("");

      // Load pending requests (student to mentor)
      const allRequests = await connectionsApi.getPendingRequests();
      const studentRequests = allRequests.filter(
        (req) => req.connectionType === "student_to_mentor"
      );
      setPendingRequests(studentRequests);

      // Load active mentees
      const connections = await connectionsApi.getUserConnections("accepted");
      const activeConnections = connections.filter(
        (conn) => conn.connectionType === "student_to_mentor"
      );
      setMentees(activeConnections);
    } catch (err) {
      setError(err.message || "Failed to load mentorship requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    try {
      setActionLoading(true);
      // For now, just accept without payment processing
      // In production, you'd integrate Stripe Payment Elements here
      await connectionsApi.acceptMentorshipRequest(selectedRequest.id);
      setPaymentModalOpen(false);
      loadMentorshipData();
    } catch (err) {
      setError(err.message || "Failed to accept request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async (reason = "") => {
    try {
      setActionLoading(true);
      await connectionsApi.rejectMentorshipRequest(selectedRequest.id, reason);
      setPaymentModalOpen(false);
      loadMentorshipData();
    } catch (err) {
      setError(err.message || "Failed to reject request");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusIcon = (isPaid) => {
    if (isPaid) {
      return <AttachMoney color="success" />;
    }
    return <CheckCircle color="success" />;
  };

  if (loading) {
    return (
      <Card sx={{ borderRadius: 2 }}>
        <CardHeader title="Mentorship Requests" />
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
          title="Mentorship Requests & Mentees"
          subheader={`${pendingRequests.length} pending request${
            pendingRequests.length !== 1 ? "s" : ""
          } • ${mentees.length} active mentee${mentees.length !== 1 ? "s" : ""}`}
        />
        <Divider />

        <CardContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* Pending Requests Tab */}
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, mb: 2, display: "flex", alignItems: "center", gap: 1 }}
          >
            <HourglassBottom fontSize="small" />
            Pending Requests ({pendingRequests.length})
          </Typography>

          {pendingRequests.length === 0 ? (
            <Box sx={{ bgcolor: "action.hover", p: 2, borderRadius: 1, mb: 3 }}>
              <Typography color="textSecondary" variant="body2">
                No pending mentorship requests right now.
              </Typography>
            </Box>
          ) : (
            <List sx={{ mb: 3, bgcolor: "action.hover", borderRadius: 1 }}>
              {pendingRequests.map((request, index) => (
                <div key={request.id}>
                  <ListItem
                    sx={{
                      py: 2,
                      "&:hover": { bgcolor: "action.selected" },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={request.fromUser?.profileImageUrl}
                        sx={{ bgcolor: "secondary.main" }}
                      >
                        {request.fromUser?.firstName?.[0]}
                        {request.fromUser?.lastName?.[0]}
                      </Avatar>
                    </ListItemAvatar>

                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {request.fromUser?.firstName} {request.fromUser?.lastName}
                          </Typography>
                          {request.isPaid && (
                            <Chip
                              icon={<AttachMoney />}
                              label={stripeService.formatPrice(request.mentorshipPrice)}
                              size="small"
                              color="primary"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          {request.message && (
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              "{request.message}"
                            </Typography>
                          )}
                          {request.fromUser?.profile?.university && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <School fontSize="small" />
                              <Typography variant="caption">
                                {request.fromUser.profile.university} •{" "}
                                {request.fromUser.profile.major}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      }
                    />

                    <Box sx={{ display: "flex", gap: 1, ml: 2 }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<Check />}
                        onClick={() => {
                          setSelectedRequest(request);
                          setPaymentModalOpen(true);
                        }}
                        disabled={actionLoading}
                      >
                        Accept
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Close />}
                        onClick={() => {
                          setSelectedRequest(request);
                          // Could open a reject dialog for reason
                          handleRejectRequest();
                        }}
                        disabled={actionLoading}
                      >
                        Reject
                      </Button>
                    </Box>
                  </ListItem>
                  {index < pendingRequests.length - 1 && <Divider />}
                </div>
              ))}
            </List>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Active Mentees Tab */}
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, mb: 2, display: "flex", alignItems: "center", gap: 1 }}
          >
            <CheckCircle fontSize="small" color="success" />
            Active Mentees ({mentees.length})
          </Typography>

          {mentees.length === 0 ? (
            <Box sx={{ bgcolor: "action.hover", p: 2, borderRadius: 1 }}>
              <Typography color="textSecondary" variant="body2">
                You don't have any active mentees yet. Accept pending requests to
                start mentoring!
              </Typography>
            </Box>
          ) : (
            <List sx={{ bgcolor: "success.light", borderRadius: 1 }}>
              {mentees.map((mentee, index) => (
                <div key={mentee.id}>
                  <ListItem sx={{ py: 2 }}>
                    <ListItemAvatar>
                      <Avatar
                        src={mentee.otherUser?.profileImageUrl}
                        sx={{ bgcolor: "success.main" }}
                      >
                        {mentee.otherUser?.firstName?.[0]}
                        {mentee.otherUser?.lastName?.[0]}
                      </Avatar>
                    </ListItemAvatar>

                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {mentee.otherUser?.firstName} {mentee.otherUser?.lastName}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          {mentee.otherUser?.profile?.university && (
                            <Typography variant="caption">
                              {mentee.otherUser.profile.university} •{" "}
                              {mentee.otherUser.profile.major}
                            </Typography>
                          )}
                          {mentee.isPaid && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                              <AttachMoney fontSize="small" />
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                Paid: {stripeService.formatPrice(mentee.mentorshipPrice)}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < mentees.length - 1 && <Divider />}
                </div>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Payment Modal for accepting requests */}
      {selectedRequest && (
        <MentorshipPaymentModal
          connection={selectedRequest}
          open={paymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            setSelectedRequest(null);
          }}
          onSuccess={() => loadMentorshipData()}
          loading={actionLoading}
        />
      )}
    </>
  );
};

export default MentorMentorshipSection;
