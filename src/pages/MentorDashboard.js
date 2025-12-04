import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Skeleton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  Switch,
  FormControlLabel,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  Work,
  LocationOn,
  Edit,
  Message,
  CheckCircle,
  TrendingUp,
  Person,
  ArrowRight,
  People,
  Star,
  Check,
  Close,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { useToast } from "../contexts/ToastContext";
import dashboardApi from "../services/dashboardApi";
import mentorshipApi from "../services/mentorshipApi";
import socketService from "../services/socketService";
import ProfileEditForm from "../components/ProfileEditForm";
import MentorshipPricingCard from "../components/MentorshipPricingCard";
import CallNotificationDialog from "../components/CallNotificationDialog";
import VideoConferenceDialog from "../components/VideoConferenceDialog";

const MentorDashboard = () => {
  const navigate = useNavigate();
  const { user, userProfile: userProfileFromContext } = useUser();
  const toast = useToast();
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [mentees, setMentees] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [availabilityStatus, setAvailabilityStatus] = useState(true);
  const [mentorshipStats, setMentorshipStats] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [incomingCallOpen, setIncomingCallOpen] = useState(false);
  const [incomingCallData, setIncomingCallData] = useState(null);
  const [videoConferenceOpen, setVideoConferenceOpen] = useState(false);
  const [selectedMentorshipForVideo, setSelectedMentorshipForVideo] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Set up Socket.io listeners for incoming calls
  useEffect(() => {
    // Connect socket service with mentor ID
    const mentorId = user?.id || user?._id;
    console.log('MentorDashboard: Attempting to connect socket with mentorId:', mentorId);
    console.log('MentorDashboard: Full user object:', user);

    if (mentorId) {
      socketService.connect(mentorId.toString());
      console.log('MentorDashboard: Socket connection initiated for mentorId:', mentorId.toString());
    } else {
      console.warn('MentorDashboard: No mentor ID found in user object');
    }

    // Listen for incoming calls
    const handleIncomingCall = (callData) => {
      console.log('MentorDashboard: Incoming call received:', callData);
      setIncomingCallData(callData);
      setIncomingCallOpen(true);
    };

    // Listen for call ended
    const handleCallEnded = (data) => {
      console.log('MentorDashboard: Call ended notification:', data);
      setVideoConferenceOpen(false);
      setSelectedMentorshipForVideo(null);
    };

    socketService.on('incoming_call', handleIncomingCall);
    socketService.on('call_ended', handleCallEnded);

    // Cleanup
    return () => {
      socketService.off('incoming_call', handleIncomingCall);
      socketService.off('call_ended', handleCallEnded);
    };
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardData, applicationsData, menteesData, statsData] =
        await Promise.all([
          dashboardApi.getMentorDashboard(),
          mentorshipApi.getPendingApplications(),
          mentorshipApi.getActiveMentorships(),
          mentorshipApi.getMentorshipStats(),
        ]);

      if (dashboardData?.user) setUserProfile(dashboardData.user);

      // Handle pending applications from new Mentorship table
      if (applicationsData) {
        setPendingRequests(applicationsData || []);
      }

      // Handle active mentees from new Mentorship table
      if (menteesData) {
        setMentees(menteesData || []);
      }

      // Handle stats from new Mentorship table
      if (statsData) {
        setMentorshipStats(statsData || {});
      }

      console.log("Mentor dashboard data loaded successfully");
    } catch (error) {
      console.error("Failed to load mentor dashboard data:", error);
      toast.showError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
    setAvailabilityStatus(user?.availableForMentoring ?? true);
  };

  const handleSaveProfile = async (profileData) => {
    try {
      await dashboardApi.updateProfile(profileData);
      setProfileEditOpen(false);
      loadDashboardData();
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleSaveMentorshipPrice = async (price, currency) => {
    try {
      await dashboardApi.updateProfile({
        mentorProfile: {
          mentorshipPrice: price, // in cents
          paymentCurrency: currency,
        },
      });
      toast.showSuccess("Mentorship pricing updated!");
      loadDashboardData();
    } catch (error) {
      console.error("Failed to save mentorship price:", error);
      toast.showError("Error updating pricing");
    }
  };

  const handleAvailabilityToggle = async (event) => {
    try {
      const newStatus = event.target.checked;
      await dashboardApi.updateAvailability(newStatus);
      setAvailabilityStatus(newStatus);
    } catch (error) {
      console.error("Failed to update availability:", error);
      setAvailabilityStatus(!event.target.checked);
    }
  };

  const handleAcceptRequest = async (mentorshipId) => {
    try {
      await mentorshipApi.acceptMentorshipApplication(mentorshipId);
      toast.showSuccess("Mentorship request accepted!");
      // Reload all dashboard data to reflect changes
      await loadDashboardData();
    } catch (error) {
      console.error("Failed to accept request:", error);
      toast.showError("Failed to accept mentorship request");
    }
  };

  const handleRejectRequest = async (mentorshipId) => {
    try {
      await mentorshipApi.rejectMentorshipApplication(mentorshipId);
      toast.showInfo("Mentorship request declined");
      // Reload all dashboard data to reflect changes
      await loadDashboardData();
    } catch (error) {
      console.error("Failed to reject request:", error);
      toast.showError("Failed to reject mentorship request");
    }
  };

  const handleJoinIncomingCall = (callData) => {
    // Set up video conference with the incoming call data
    setSelectedMentorshipForVideo({
      mentorshipId: callData.mentorshipId,
      roomName: callData.roomName,
      studentName: callData.studentName,
      studentId: callData.studentId,
    });
    setVideoConferenceOpen(true);
    setIncomingCallOpen(false);
  };

  const profileData = userProfile || user;
  const profileImage = profileData?.profileImageUrl || userProfile?.profileImageUrl || user?.profileImageUrl;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 3,
          p: 4,
          mb: 4,
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Welcome back, {profileData?.firstName}! 👋
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Manage your mentorship and support the next generation
          </Typography>
        </Box>
        <IconButton
          onClick={() => setProfileEditOpen(true)}
          sx={{
            color: "white",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.3)" },
          }}
        >
          <Edit />
        </IconButton>
      </Box>

      {/* Profile Card */}
      {profileData && (
        <Card
          sx={{
            mb: 4,
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 3 }}>
              <Avatar
                src={profileImage}
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  fontSize: 40,
                  fontWeight: 600,
                }}
              >
                {profileData?.firstName?.[0]}
                {profileData?.lastName?.[0]}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {profileData?.firstName} {profileData?.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {profileData?.currentPosition} at {profileData?.company}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 2 }}
                    >
                      {profileData?.yearsOfExperience} years of experience
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                  <Chip
                    icon={<Work />}
                    label={profileData?.currentPosition}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    icon={<LocationOn />}
                    label={profileData?.country}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <FormControlLabel
                  control={
                    <Switch
                      checked={availabilityStatus}
                      onChange={handleAvailabilityToggle}
                      color="success"
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Typography variant="body2">
                        {availabilityStatus
                          ? "Available for mentoring"
                          : "Not available"}
                      </Typography>
                      {availabilityStatus && (
                        <CheckCircle
                          sx={{ color: "success.main", fontSize: 16 }}
                        />
                      )}
                    </Box>
                  }
                />
              </Box>
            </Box>

            {profileData?.bio && (
              <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
                {profileData.bio}
              </Typography>
            )}

            {profileData?.expertise && profileData.expertise.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  EXPERTISE
                </Typography>
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 1 }}>
                  {profileData.expertise.map((skill, idx) => (
                    <Chip
                      key={idx}
                      label={skill}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{
              p: 3,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <People sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {mentorshipStats.active || mentorshipStats.totalMentees || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Active Mentees
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{
              p: 3,
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              color: "white",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <TrendingUp sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {mentorshipStats.pending || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Pending Requests
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{
              p: 3,
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "white",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Star sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {mentorshipStats.completed || mentorshipStats.completedMentorships || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Completed
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Pending Requests and Mentees Grid */}
      <Grid container spacing={3}>
        {/* Pending Requests */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Mentorship Requests ({pendingRequests.length})
              </Typography>

              {loading ? (
                <Box>
                  {[1, 2].map((i) => (
                    <Box key={i} sx={{ mb: 2 }}>
                      <Skeleton variant="rectangular" height={80} />
                    </Box>
                  ))}
                </Box>
              ) : pendingRequests.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {pendingRequests.slice(0, 5).map((request) => {
                    const mentorshipId = request.id || request._id;
                    // Backend returns studentId as the populated student object
                    const student = request.studentId || request.student || {};
                    const studentName = student.firstName ? `${student.firstName} ${student.lastName || ""}` : "Unknown Student";
                    const studentRole = student.email || "Student";

                    return (
                      <ListItem
                        key={mentorshipId}
                        sx={{
                          p: 2,
                          mb: 1,
                          bgcolor: "grey.50",
                          borderRadius: 1,
                          flexDirection: "column",
                          alignItems: "flex-start",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", width: "100%", mb: 1 }}>
                          <ListItemAvatar sx={{ minWidth: 40 }}>
                            <Avatar sx={{ width: 40, height: 40 }}>
                              {student.profileImageUrl ? (
                                <img
                                  src={student.profileImageUrl}
                                  alt={studentName}
                                  style={{ width: "100%", height: "100%" }}
                                />
                              ) : (
                                <Person />
                              )}
                            </Avatar>
                          </ListItemAvatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {studentName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {studentRole}
                            </Typography>
                            {request.applicationMessage && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                                "{request.applicationMessage.substring(0, 60)}..."
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<Check />}
                            onClick={() => handleAcceptRequest(mentorshipId)}
                            fullWidth
                          >
                            Accept
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Close />}
                            onClick={() => handleRejectRequest(mentorshipId)}
                            fullWidth
                          >
                            Decline
                          </Button>
                        </Box>
                      </ListItem>
                    );
                  })}
                </List>
              ) : (
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No pending requests
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* My Mentees */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  My Mentees
                </Typography>
                <Button endIcon={<ArrowRight />} size="small">
                  View All
                </Button>
              </Box>

              {loading ? (
                <Box>
                  {[1, 2, 3].map((i) => (
                    <Box key={i} sx={{ mb: 2 }}>
                      <Skeleton variant="rectangular" height={60} />
                    </Box>
                  ))}
                </Box>
              ) : mentees.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {mentees.slice(0, 5).map((mentee) => {
                    // Backend returns studentId as the populated student object
                    const student = mentee.studentId || mentee.student || {};
                    const studentId = student._id || student.id || mentee.id || mentee._id;
                    const studentName = student.firstName ? `${student.firstName} ${student.lastName || ""}` : "Unknown Student";
                    const studentBackground = student.studentProfile?.university || "Student";

                    return (
                      <ListItem
                        key={studentId}
                        sx={{
                          p: 1.5,
                          mb: 1,
                          bgcolor: "grey.50",
                          borderRadius: 1,
                          "&:hover": { bgcolor: "grey.100" },
                        }}
                      >
                        <ListItemAvatar sx={{ minWidth: 40 }}>
                          <Avatar sx={{ width: 40, height: 40 }}>
                            {student.profileImageUrl ? (
                              <img
                                src={student.profileImageUrl}
                                alt={studentName}
                                style={{ width: "100%", height: "100%" }}
                              />
                            ) : (
                              <Person />
                            )}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={studentName}
                          secondary={studentBackground}
                          primaryTypographyProps={{
                            variant: "body2",
                            sx: { fontWeight: 500 },
                          }}
                          secondaryTypographyProps={{ variant: "caption" }}
                        />
                        <Tooltip title="Send message">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() =>
                              navigate("/chat", {
                                state: {
                                  selectedUser: {
                                    id: studentId,
                                    userId: studentId,
                                    name: studentName,
                                    avatar: student.profileImageUrl,
                                    university: studentBackground,
                                  },
                                },
                              })
                            }
                          >
                            <Message sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </ListItem>
                    );
                  })}
                </List>
              ) : (
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No mentees yet
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                    Accept mentorship requests to get started
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog
        open={profileEditOpen}
        onClose={() => setProfileEditOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Profile & Mentorship Settings</DialogTitle>
        <DialogContent>
          <ProfileEditForm user={userProfile} onSave={handleSaveProfile} />

          {/* Mentorship Pricing Section */}
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 3 }} />
            <MentorshipPricingCard
              currentPrice={userProfile?.mentorshipPrice || 0}
              currency={userProfile?.paymentCurrency || "usd"}
              onSave={handleSaveMentorshipPrice}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Incoming Call Notification Dialog */}
      <CallNotificationDialog
        open={incomingCallOpen}
        onClose={() => setIncomingCallOpen(false)}
        onJoinCall={handleJoinIncomingCall}
        callData={incomingCallData}
        mentorProfile={profileData}
      />

      {/* Video Conference Dialog for Mentor */}
      {selectedMentorshipForVideo && (
        <VideoConferenceDialog
          open={videoConferenceOpen}
          onClose={() => {
            setVideoConferenceOpen(false);
            setSelectedMentorshipForVideo(null);
          }}
          mentorshipId={selectedMentorshipForVideo.mentorshipId}
          roomName={selectedMentorshipForVideo.roomName}
          currentUser={userProfile}
          otherUser={{
            firstName: selectedMentorshipForVideo.studentName || "Student",
            lastName: "",
          }}
          onSessionEnd={(reason) => {
            console.log("Video session ended:", reason);
            setVideoConferenceOpen(false);
            setSelectedMentorshipForVideo(null);
          }}
        />
      )}
    </Container>
  );
};

export default MentorDashboard;
