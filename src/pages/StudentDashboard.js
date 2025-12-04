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
  Badge,
  Skeleton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  School,
  Person,
  Edit,
  Message,
  LocationOn,
  TravelExplore,
  ArrowRight,
  People,
  LightbulbOutlined,
  MenuBook,
  Videocam,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { useToast } from "../contexts/ToastContext";
import dashboardApi from "../services/dashboardApi";
import mentorshipApi from "../services/mentorshipApi";
import ProfileEditForm from "../components/ProfileEditForm";
import VideoConferenceDialog from "../components/VideoConferenceDialog";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const toast = useToast();
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [videoConferenceOpen, setVideoConferenceOpen] = useState(false);
  const [selectedMentorshipForVideo, setSelectedMentorshipForVideo] = useState(null);
  const [connections, setConnections] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [mentorships, setMentorships] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [
        dashboardData,
        connectionsData,
        recommendationsData,
        activityData,
        mentorshipsData,
      ] = await Promise.all([
        dashboardApi.getStudentDashboard(),
        dashboardApi.getStudentConnections(),
        dashboardApi.getStudentRecommendations(),
        dashboardApi.getStudentActivity(),
        mentorshipApi.getStudentMentorships(),
      ]);

      if (dashboardData?.user) setUserProfile(dashboardData.user);
      if (connectionsData) setConnections(connectionsData.connections || []);
      if (recommendationsData)
        setRecommendations(recommendationsData.recommendations || []);
      if (activityData) setRecentActivity(activityData.activities || []);
      if (mentorshipsData) setMentorships(mentorshipsData || []);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast.showError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
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

  const profileData = userProfile || user;
  const profileImage = profileData?.profileImageUrl || userProfile?.profileImageUrl || user?.profileImageUrl;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section with Background */}
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
            Keep networking and exploring study abroad opportunities
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
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
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {profileData?.firstName} {profileData?.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {profileData?.university ||
                    profileData?.studentProfile?.university}{" "}
                  • {profileData?.major || profileData?.studentProfile?.major}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Chip
                    icon={<School />}
                    label={
                      profileData?.academicLevel ||
                      profileData?.studentProfile?.academicLevel
                    }
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    icon={<LocationOn />}
                    label={profileData?.country}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    icon={<TravelExplore />}
                    label={
                      profileData?.destinationCountry ||
                      profileData?.studentProfile?.destinationCountry
                    }
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Box>
            {profileData?.bio && (
              <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
                {profileData.bio}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
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
                {connections.length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Connections
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
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
            <LightbulbOutlined sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {recommendations.length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Recommendations
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
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
            <MenuBook sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {recentActivity.length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Activities
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
              color: "white",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <School sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {mentorships.length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Mentorships
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Connections and Recommendations Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Connections Card */}
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
                  My Connections
                </Typography>
                <Button
                  endIcon={<ArrowRight />}
                  onClick={() => navigate("/connections")}
                  size="small"
                >
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
              ) : connections.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {connections.slice(0, 4).map((connection) => (
                    <ListItem
                      key={connection.id}
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
                          <Person />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={connection.name}
                        secondary={connection.role}
                        primaryTypographyProps={{
                          variant: "body2",
                          sx: { fontWeight: 500 },
                        }}
                        secondaryTypographyProps={{ variant: "caption" }}
                      />
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() =>
                          navigate("/chat", {
                            state: {
                              selectedUser: {
                                id: connection.id || connection._id,
                                userId: connection.id || connection._id,
                                name: connection.name,
                                avatar: connection.avatar,
                                university: connection.role,
                              },
                            },
                          })
                        }
                      >
                        <Message sx={{ fontSize: 18 }} />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No connections yet
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => navigate("/connections")}
                    sx={{ mt: 1 }}
                  >
                    Start Networking
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recommendations Card */}
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
                  Recommended For You
                </Typography>
                <Button endIcon={<ArrowRight />} size="small">
                  See More
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
              ) : recommendations.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {recommendations.slice(0, 4).map((rec, idx) => (
                    <ListItem
                      key={idx}
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
                          <LightbulbOutlined />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={rec.name}
                        secondary={rec.description}
                        primaryTypographyProps={{
                          variant: "body2",
                          sx: { fontWeight: 500 },
                        }}
                        secondaryTypographyProps={{ variant: "caption" }}
                      />
                      <Button size="small" variant="text">
                        Connect
                      </Button>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Check back later for recommendations
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Mentorships Section */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
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
                  My Mentorships
                </Typography>
                <Button endIcon={<ArrowRight />} size="small">
                  Manage All
                </Button>
              </Box>

              {loading ? (
                <Box>
                  {[1, 2].map((i) => (
                    <Box key={i} sx={{ mb: 2 }}>
                      <Skeleton variant="rectangular" height={80} />
                    </Box>
                  ))}
                </Box>
              ) : mentorships.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {mentorships.slice(0, 4).map((mentorship) => {
                    // Backend returns mentorId as the populated mentor object
                    const mentorData = mentorship.mentorId || mentorship.mentor || {};
                    const mentorName = mentorData.firstName ? `${mentorData.firstName} ${mentorData.lastName || ""}` : "Unknown Mentor";
                    const mentorRole = mentorData.currentPosition || "Professional";
                    const statusLabel = mentorship.status?.toLowerCase() === "active" ? "Active" : mentorship.status?.toLowerCase() === "pending" ? "Pending" : mentorship.status || "Unknown";

                    return (
                      <ListItem
                        key={mentorship.id || mentorship._id}
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
                              {mentorData.profileImageUrl ? (
                                <img
                                  src={mentorData.profileImageUrl}
                                  alt={mentorName}
                                  style={{ width: "100%", height: "100%" }}
                                />
                              ) : (
                                <Person />
                              )}
                            </Avatar>
                          </ListItemAvatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {mentorName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {mentorRole}
                            </Typography>
                          </Box>
                          <Chip
                            label={statusLabel}
                            size="small"
                            color={mentorship.status?.toLowerCase() === "active" ? "success" : mentorship.status?.toLowerCase() === "pending" ? "warning" : "default"}
                            variant="outlined"
                          />
                        </Box>
                        {mentorship.applicationMessage && (
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                            "{mentorship.applicationMessage.substring(0, 80)}..."
                          </Typography>
                        )}
                        <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
                          {mentorship.status?.toLowerCase() === "active" && (
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              startIcon={<Videocam />}
                              onClick={() => {
                                setSelectedMentorshipForVideo({
                                  mentorshipId: mentorship.id || mentorship._id,
                                  mentor: mentorData,
                                });
                                setVideoConferenceOpen(true);
                              }}
                            >
                              Video Call
                            </Button>
                          )}
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() =>
                              navigate("/chat", {
                                state: {
                                  selectedUser: {
                                    id: mentorData._id || mentorData.id,
                                    userId: mentorData._id || mentorData.id,
                                    name: mentorName,
                                    avatar: mentorData.profileImageUrl,
                                  },
                                },
                              })
                            }
                            fullWidth
                          >
                            Message
                          </Button>
                        </Box>
                      </ListItem>
                    );
                  })}
                </List>
              ) : (
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No mentorships yet
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                    Apply to mentors in the Connections tab to get started
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => navigate("/connections")}
                    sx={{ mt: 1 }}
                  >
                    Find Mentors
                  </Button>
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
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <ProfileEditForm user={userProfile} onSave={handleSaveProfile} />
        </DialogContent>
      </Dialog>

      {/* Video Conference Dialog */}
      {selectedMentorshipForVideo && (
        <VideoConferenceDialog
          open={videoConferenceOpen}
          onClose={() => {
            setVideoConferenceOpen(false);
            setSelectedMentorshipForVideo(null);
          }}
          mentorshipId={selectedMentorshipForVideo.mentorshipId}
          currentUser={userProfile || user}
          otherUser={selectedMentorshipForVideo.mentor}
          onSessionEnd={(reason) => {
            toast.showSuccess('Video call ended');
            loadDashboardData();
          }}
        />
      )}
    </Container>
  );
};

export default StudentDashboard;
