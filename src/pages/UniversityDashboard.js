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
} from "@mui/material";
import {
  Business,
  LocationOn,
  Edit,
  Message,
  CheckCircle,
  Language,
  Person,
  ArrowRight,
  School,
  People,
  TrendingUp,
  Check,
  Close,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { useToast } from "../contexts/ToastContext";
import dashboardApi from "../services/dashboardApi";
import ProfileEditForm from "../components/ProfileEditForm";

const UniversityDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const toast = useToast();
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [connectedStudents, setConnectedStudents] = useState([]);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [acceptingStudents, setAcceptingStudents] = useState(true);
  const [universityStats, setUniversityStats] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardData, studentsData, statsData] = await Promise.all([
        dashboardApi.getUniversityDashboard(),
        dashboardApi.getUniversityStudents(),
        dashboardApi.getUniversityStats(),
      ]);

      if (dashboardData?.user) setUserProfile(dashboardData.user);
      if (studentsData?.students) setConnectedStudents(studentsData.students);
      if (dashboardData?.pendingApplications)
        setPendingApplications(dashboardData.pendingApplications);
      if (statsData) {
        setUniversityStats({
          totalStudents: statsData.totalStudents || 0,
          activeApplications: statsData.activeApplications || 0,
          acceptedStudents: statsData.acceptedStudents || 0,
          averageRating: statsData.averageRating || 0,
          programsOffered: dashboardData?.user?.academicPrograms?.length || 0,
        });
      }

      setAcceptingStudents(dashboardData?.user?.acceptingStudents ?? true);
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

  const handleAcceptingToggle = async (event) => {
    const accepting = event.target.checked;
    try {
      await dashboardApi.updateAcceptingStudents(accepting);
      setAcceptingStudents(accepting);
      toast.showSuccess(
        `Applications ${accepting ? "open" : "closed"}`
      );
    } catch (error) {
      console.error("Failed to update accepting status:", error);
      toast.showError("Failed to update status. Please try again.");
      setAcceptingStudents(!accepting);
    }
  };

  const handleAcceptApplication = async (applicationId) => {
    try {
      await dashboardApi.acceptApplication(applicationId);
      setPendingApplications((prev) =>
        prev.filter((app) => app.id !== applicationId)
      );
      toast.showSuccess("Application accepted!");
      loadDashboardData();
    } catch (error) {
      console.error("Failed to accept application:", error);
      toast.showError("Failed to accept application.");
    }
  };

  const handleRejectApplication = async (applicationId) => {
    try {
      await dashboardApi.rejectApplication(applicationId);
      setPendingApplications((prev) =>
        prev.filter((app) => app.id !== applicationId)
      );
      toast.showInfo("Application declined");
      loadDashboardData();
    } catch (error) {
      console.error("Failed to reject application:", error);
      toast.showError("Failed to reject application.");
    }
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
            Welcome back! 👋
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Manage student applications and connect with global scholars
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
                <Business sx={{ fontSize: 50 }} />
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
                      {profileData?.universityName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {profileData?.department}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 2 }}
                    >
                      Contact: {profileData?.contactPerson} • {profileData?.contactTitle}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                  <Chip
                    icon={<LocationOn />}
                    label={profileData?.country}
                    size="small"
                    variant="outlined"
                  />
                  {profileData?.websiteUrl && (
                    <Chip
                      icon={<Language />}
                      label="Website"
                      size="small"
                      variant="outlined"
                      onClick={() => window.open(profileData.websiteUrl)}
                    />
                  )}
                </Box>

                <FormControlLabel
                  control={
                    <Switch
                      checked={acceptingStudents}
                      onChange={handleAcceptingToggle}
                      color="success"
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Typography variant="body2">
                        {acceptingStudents
                          ? "Accepting applications"
                          : "Applications closed"}
                      </Typography>
                      {acceptingStudents && (
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

            {profileData?.academicPrograms && profileData.academicPrograms.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  ACADEMIC PROGRAMS
                </Typography>
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 1 }}>
                  {profileData.academicPrograms.map((program, idx) => (
                    <Chip
                      key={idx}
                      label={program}
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
        <Grid item xs={12} sm={6} lg={3}>
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
            <School sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {universityStats.totalStudents}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total Students
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
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
            <TrendingUp sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {universityStats.activeApplications}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Active Applications
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
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
            <People sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {universityStats.acceptedStudents}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Accepted
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Paper
            sx={{
              p: 3,
              background: "linear-gradient(135deg, #ffd89b 0%, #19547b 100%)",
              color: "white",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box sx={{ fontSize: 40 }}>📚</Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {universityStats.programsOffered}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Programs
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Applications and Connected Students Grid */}
      <Grid container spacing={3}>
        {/* Pending Applications */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Pending Applications ({pendingApplications.length})
              </Typography>

              {loading ? (
                <Box>
                  {[1, 2].map((i) => (
                    <Box key={i} sx={{ mb: 2 }}>
                      <Skeleton variant="rectangular" height={90} />
                    </Box>
                  ))}
                </Box>
              ) : pendingApplications.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {pendingApplications.slice(0, 5).map((app) => (
                    <ListItem
                      key={app.id}
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
                            <Person />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={app.studentName}
                          secondary={app.program}
                          primaryTypographyProps={{
                            variant: "body2",
                            sx: { fontWeight: 500 },
                          }}
                          secondaryTypographyProps={{ variant: "caption" }}
                        />
                      </Box>
                      <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<Check />}
                          onClick={() => handleAcceptApplication(app.id)}
                          fullWidth
                        >
                          Accept
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Close />}
                          onClick={() => handleRejectApplication(app.id)}
                          fullWidth
                        >
                          Decline
                        </Button>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No pending applications
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Connected Students */}
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
                  Connected Students
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
              ) : connectedStudents.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {connectedStudents.slice(0, 5).map((student) => (
                    <ListItem
                      key={student.id}
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
                        primary={student.name}
                        secondary={student.program}
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
                                id: student.id || student._id,
                                userId: student.id || student._id,
                                name: student.name,
                                avatar: student.avatar,
                                university: student.program,
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
                    No connected students yet
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                    Accept applications to connect with students
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
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <ProfileEditForm onSave={handleSaveProfile} />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default UniversityDashboard;
