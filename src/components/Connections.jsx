import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Box,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Badge,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Send as SendIcon,
  Inbox as InboxIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Block as BlockIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Star as StarIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  Videocam as VideocamIcon,
} from "@mui/icons-material";
import { connectionsApi } from "../services/connectionsApi";
import mentorshipApi from "../services/mentorshipApi";
import { useToast } from "../contexts/ToastContext";
import MentorshipApplicationForm from "./MentorshipApplicationForm";
import StripeElementsProvider from "./StripeElementsProvider";
import VideoConferenceDialog from "./VideoConferenceDialog";
import secureStorage from "../utils/secureStorage";
import { useUser } from "../contexts/UserContext";

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`connections-tabpanel-${index}`}
      aria-labelledby={`connections-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2.5 }}>{children}</Box>}
    </div>
  );
}

function ConnectionCard({ connection, onAction, onApplyForMentorship, onVideoCall, currentUserType, showActions = true }) {
  const { otherUser } = connection;
  const [mentorshipAlreadyApplied, setMentorshipAlreadyApplied] = React.useState(false);
  const [mentorshipStatus, setMentorshipStatus] = React.useState(null);
  const [checkingMentorship, setCheckingMentorship] = React.useState(false);

  // Determine current user type from connection
  const inferredUserType = React.useMemo(() => {
    const { connectionType, otherUser: other } = connection;
    if (connectionType === "student_to_mentor" && other.entityType === "mentor") return "student";
    if (connectionType === "student_to_university" && other.entityType === "university") return "student";
    if (connectionType === "mentor_to_student" && other.entityType === "student") return "mentor";
    if (connectionType === "mentor_to_mentor") return "mentor";
    if (connectionType === "university_to_student" && other.entityType === "student") return "university";
    if (connectionType === "university_to_mentor" && other.entityType === "mentor") return "university";
    return null;
  }, [connection.connectionType, otherUser.entityType]);

  // Check if mentorship already exists
  React.useEffect(() => {
    if (
      inferredUserType === "student" &&
      otherUser.entityType === "mentor" &&
      connection.status === "accepted"
    ) {
      checkMentorshipStatus();
    }
  }, [connection.id, otherUser.id, inferredUserType]);

  const checkMentorshipStatus = async () => {
    try {
      setCheckingMentorship(true);
      const response = await mentorshipApi.getMentorshipStatus(otherUser.id);
      console.log("Mentorship status response:", response);

      // Store full status for granular checks
      setMentorshipStatus(response);

      // Only mark as applied if we have a valid mentorship with pending or active status
      const hasApplied = response && response.mentorshipId && (response.status?.toLowerCase() === 'pending' || response.status?.toLowerCase() === 'active');
      console.log("Has applied result:", hasApplied, "Response:", response);
      setMentorshipAlreadyApplied(hasApplied);
    } catch (error) {
      // If error, assume no mentorship exists
      setMentorshipAlreadyApplied(false);
      setMentorshipStatus(null);
      console.error("Failed to check mentorship status:", error);
    } finally {
      setCheckingMentorship(false);
    }
  };

  const getEntityIcon = (entityType) => {
    switch (entityType) {
      case "mentor":
        return <WorkIcon />;
      case "university":
        return <SchoolIcon />;
      case "student":
        return <PersonAddIcon />;
      default:
        return <PeopleIcon />;
    }
  };

  const getEntityColor = (entityType) => {
    switch (entityType) {
      case "mentor":
        return "primary";
      case "university":
        return "secondary";
      case "student":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Card sx={{
      mb: 2,
      borderRadius: "12px",
      border: "1px solid #e0e0e0",
      transition: "all 0.2s ease",
      "&:hover": {
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.08)",
        borderColor: "#667eea",
      },
    }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2.5}>
          <Avatar
            src={otherUser.profileImageUrl}
            sx={{
              mr: 2,
              width: 56,
              height: 56,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              fontWeight: "bold",
            }}
          >
            {otherUser.firstName?.[0]}
            {otherUser.lastName?.[0]}
          </Avatar>
          <Box flex={1}>
            <Typography variant="subtitle2" fontWeight="600" sx={{ color: "#1a1a1a" }}>
              {otherUser.firstName} {otherUser.lastName}
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
              <Chip
                icon={getEntityIcon(otherUser.entityType)}
                label={otherUser.entityType}
                color={getEntityColor(otherUser.entityType)}
                size="small"
                sx={{ borderRadius: "12px", height: 24 }}
              />
              {connection.status && (
                <Chip
                  label={connection.status}
                  color={
                    connection.status === "accepted" ? "success" : "warning"
                  }
                  size="small"
                  sx={{ borderRadius: "12px", height: 24 }}
                />
              )}
            </Box>
          </Box>
        </Box>

        {/* Profile Info */}
        <Box mb={2}>
          {otherUser.profile?.currentPosition && (
            <Typography variant="body2" color="text.secondary">
              {otherUser.profile.currentPosition} at {otherUser.profile.company}
            </Typography>
          )}
          {otherUser.profile?.universityName && (
            <Typography variant="body2" color="text.secondary">
              {otherUser.profile.universityName} -{" "}
              {otherUser.profile.department}
            </Typography>
          )}
          {otherUser.profile?.university && (
            <Typography variant="body2" color="text.secondary">
              {otherUser.profile.major} at {otherUser.profile.university}
            </Typography>
          )}
        </Box>

        {/* Connection Message */}
        {connection.message && (
          <Paper sx={{ p: 2, bgcolor: "#f5f5f5", mb: 2, borderRadius: "8px", border: "1px solid #e0e0e0" }}>
            <Typography variant="body2" sx={{ fontStyle: "italic", color: "#555" }}>
              "{connection.message}"
            </Typography>
          </Paper>
        )}

        {/* Expertise/Interests */}
        {(otherUser.profile?.expertise || otherUser.profile?.interests) && (
          <Box mb={2}>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ fontWeight: 500, mb: 0.75 }}
            >
              {otherUser.entityType === "mentor" ? "Expertise:" : "Interests:"}
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
              {(
                otherUser.profile?.expertise ||
                otherUser.profile?.interests ||
                []
              )
                .slice(0, 3)
                .map((item, index) => (
                  <Chip
                    key={index}
                    label={item}
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: "12px", height: 24 }}
                  />
                ))}
            </Box>
          </Box>
        )}

        {/* Actions */}
        {showActions && (
          <Box display="flex" gap={1} flexWrap="wrap" pt={1}>
            {connection.status === "pending" && !connection.isFromUser && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  startIcon={<CheckIcon />}
                  onClick={() => onAction("accept", connection.id)}
                  sx={{ borderRadius: "8px", textTransform: "none" }}
                >
                  Accept
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<CloseIcon />}
                  onClick={() => onAction("reject", connection.id)}
                  sx={{ borderRadius: "8px", textTransform: "none" }}
                >
                  Reject
                </Button>
              </>
            )}
            {connection.status === "pending" && connection.isFromUser && (
              <Button
                variant="outlined"
                color="warning"
                size="small"
                startIcon={<CloseIcon />}
                onClick={() => onAction("cancel", connection.id)}
                sx={{ borderRadius: "8px", textTransform: "none" }}
              >
                Cancel Request
              </Button>
            )}
            {connection.status === "accepted" && (
              <>
                {inferredUserType === "student" && otherUser.entityType === "mentor" && !mentorshipAlreadyApplied && (
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<PersonAddIcon />}
                    onClick={() => onApplyForMentorship(otherUser)}
                    sx={{ borderRadius: "8px", textTransform: "none" }}
                  >
                    Apply for Mentorship
                  </Button>
                )}
                {inferredUserType === "student" && otherUser.entityType === "mentor" && mentorshipAlreadyApplied && (
                  <>
                    {mentorshipStatus?.status?.toLowerCase() === 'active' ? (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<VideocamIcon />}
                        onClick={() => onVideoCall && onVideoCall(mentorshipStatus)}
                        sx={{ borderRadius: "8px", textTransform: "none" }}
                      >
                        Video Call
                      </Button>
                    ) : null}
                    <Button
                      variant="outlined"
                      disabled
                      size="small"
                      startIcon={<CheckCircleIcon />}
                      sx={{ borderRadius: "8px", textTransform: "none" }}
                    >
                      ✓ Applied
                    </Button>
                  </>
                )}
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<SendIcon />}
                  onClick={() => onAction("message", connection.id)}
                  sx={{ borderRadius: "8px", textTransform: "none", color: "#667eea" }}
                >
                  Message
                </Button>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onAction("block", connection.id)}
                  title="Block"
                >
                  <BlockIcon />
                </IconButton>
              </>
            )}
          </Box>
        )}

        {/* Connection Date */}
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          mt={1}
        >
          {connection.status === "accepted" && connection.respondedAt
            ? `Connected on ${new Date(
                connection.respondedAt
              ).toLocaleDateString()}`
            : `Requested on ${new Date(
                connection.requestedAt
              ).toLocaleDateString()}`}
        </Typography>
      </CardContent>
    </Card>
  );
}

function PotentialConnectionCard({ user, onConnect }) {
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    await onConnect(user);
    setConnecting(false);
  };

  const getEntityIcon = (entityType) => {
    switch (entityType) {
      case "mentor":
        return <WorkIcon />;
      case "university":
        return <SchoolIcon />;
      case "student":
        return <PersonAddIcon />;
      default:
        return <PeopleIcon />;
    }
  };

  return (
    <Card sx={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      borderRadius: "12px",
      border: "1px solid #e0e0e0",
      transition: "all 0.2s ease",
      "&:hover": {
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.08)",
        borderColor: "#667eea",
        transform: "translateY(-4px)",
      },
    }}>
      <CardContent sx={{ flex: 1 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar
            src={user.profileImageUrl}
            sx={{
              mr: 2,
              width: 48,
              height: 48,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              fontWeight: "bold",
            }}
          >
            {user.firstName?.[0]}
            {user.lastName?.[0]}
          </Avatar>
          <Box flex={1}>
            <Typography variant="subtitle2" fontWeight="600" sx={{ color: "#1a1a1a" }}>
              {user.firstName} {user.lastName}
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
              <Chip
                icon={getEntityIcon(user.entityType)}
                label={user.entityType}
                size="small"
                sx={{ borderRadius: "12px", height: 24 }}
              />
              {user.matchScore && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <StarIcon color="primary" fontSize="small" />
                  <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                    {user.matchScore}% match
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        <Box mb={2}>
          {user.profile?.currentPosition && (
            <Typography variant="body2" color="text.secondary">
              {user.profile.currentPosition}
            </Typography>
          )}
          {user.profile?.universityName && (
            <Typography variant="body2" color="text.secondary">
              {user.profile.universityName}
            </Typography>
          )}
          {user.profile?.university && (
            <Typography variant="body2" color="text.secondary">
              {user.profile.university}
            </Typography>
          )}
        </Box>

        {(user.profile?.expertise || user.profile?.interests) && (
          <Box>
            <Box display="flex" flexWrap="wrap" gap={0.5}>
              {(user.profile?.expertise || user.profile?.interests || [])
                .slice(0, 2)
                .map((item, index) => (
                  <Chip
                    key={index}
                    label={item}
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: "12px", height: 24 }}
                  />
                ))}
            </Box>
          </Box>
        )}
      </CardContent>
      <Box p={2} pt={0}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<PersonAddIcon />}
          onClick={handleConnect}
          disabled={connecting}
          sx={{ borderRadius: "8px", textTransform: "none" }}
        >
          {connecting ? <CircularProgress size={20} /> : "Connect"}
        </Button>
      </Box>
    </Card>
  );
}

export default function Connections() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { userProfile } = useUser();
  const [tabValue, setTabValue] = useState(0);
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [potentialConnections, setPotentialConnections] = useState([]);
  const [connectionStats, setConnectionStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [entityTypeFilter, setEntityTypeFilter] = useState(""); // For filtering potential connections
  const [connectDialog, setConnectDialog] = useState({
    open: false,
    user: null,
  });
  const [connectMessage, setConnectMessage] = useState("");
  const [mentorshipFormOpen, setMentorshipFormOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [currentUserType, setCurrentUserType] = useState(null);
  const [videoConferenceOpen, setVideoConferenceOpen] = useState(false);
  const [selectedMentorshipForVideo, setSelectedMentorshipForVideo] = useState(null);

  const loadPotentialConnections = async () => {
    try {
      const potentialData = await connectionsApi.getPotentialConnections(
        entityTypeFilter || null,
        10
      );
      setPotentialConnections(potentialData);
    } catch (error) {
      showToast("Failed to load potential connections", "error");
      console.error("Error loading potential connections:", error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [connectionsData, pendingData, sentData, potentialData, statsData] =
        await Promise.all([
          connectionsApi.getUserConnections(),
          connectionsApi.getPendingRequests(),
          connectionsApi.getSentRequests(),
          connectionsApi.getPotentialConnections(entityTypeFilter || null, 10),
          connectionsApi.getConnectionStats(),
        ]);

      setConnections(connectionsData);
      setPendingRequests(pendingData);
      setSentRequests(sentData);
      setPotentialConnections(potentialData);
      setConnectionStats(statsData);
    } catch (error) {
      showToast("Failed to load connections data", "error");
      console.error("Error loading connections:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Get current user type from secure storage
    const user = secureStorage.getUser();
    console.log("Loaded user from secureStorage:", user);
    if (user && user.entityType) {
      setCurrentUserType(user.entityType);
      console.log("Set currentUserType to:", user.entityType);
    } else {
      console.warn("User not found or no entityType:", user);
    }
  }, []);

  // Reload potential connections when entity type filter changes
  useEffect(() => {
    loadPotentialConnections();
  }, [entityTypeFilter]);

  const handleConnectionAction = async (action, connectionId) => {
    try {
      let result;
      switch (action) {
        case "accept":
          result = await connectionsApi.acceptConnection(connectionId);
          showToast("Connection request accepted!", "success");
          break;
        case "reject":
          result = await connectionsApi.rejectConnection(connectionId);
          showToast("Connection request rejected", "success");
          break;
        case "cancel":
          result = await connectionsApi.cancelConnection(connectionId);
          showToast("Connection request cancelled", "success");
          break;
        case "block":
          result = await connectionsApi.blockConnection(connectionId);
          showToast("Connection blocked", "success");
          break;
        case "remove":
          result = await connectionsApi.removeConnection(connectionId);
          showToast("Connection removed", "success");
          break;
        case "message":
          // Find the connection to get the user details
          const connectionToMessage = [...connections, ...pendingRequests, ...sentRequests].find(
            (conn) => (conn.id || conn._id) === connectionId
          );
          if (connectionToMessage) {
            const otherUser = connectionToMessage.otherUser || connectionToMessage.fromUser || connectionToMessage.toUser;
            navigate("/chat", {
              state: {
                selectedUser: {
                  id: otherUser._id || otherUser.id,
                  userId: otherUser._id || otherUser.id,
                  name: `${otherUser.firstName} ${otherUser.lastName}`,
                  avatar: otherUser.profileImageUrl,
                  university: otherUser.profile?.university || otherUser.studentProfile?.university || "Unknown",
                },
              },
            });
          }
          return;
        default:
          return;
      }

      // Reload data after action
      await loadData();
    } catch (error) {
      showToast(`Failed to ${action} connection`, "error");
      console.error(`Error ${action}ing connection:`, error);
    }
  };

  const handleConnect = async (user) => {
    setConnectDialog({ open: true, user });
  };

  const handleSendConnectionRequest = async () => {
    try {
      await connectionsApi.sendConnectionRequest(
        connectDialog.user.id,
        connectMessage
      );
      showToast(
        `Connection request sent to ${connectDialog.user.firstName}!`,
        "success"
      );
      setConnectDialog({ open: false, user: null });
      setConnectMessage("");
      await loadData();
    } catch (error) {
      showToast("Failed to send connection request", "error");
      console.error("Error sending connection request:", error);
    }
  };

  // Helper function to determine current user type based on connection
  const getCurrentUserTypeFromConnection = (connection) => {
    const { connectionType, otherUser } = connection;

    if (connectionType === "student_to_mentor" && otherUser.entityType === "mentor") {
      return "student";
    } else if (connectionType === "student_to_university" && otherUser.entityType === "university") {
      return "student";
    } else if (connectionType === "mentor_to_student" && otherUser.entityType === "student") {
      return "mentor";
    } else if (connectionType === "mentor_to_mentor") {
      return "mentor";
    } else if (connectionType === "university_to_student" && otherUser.entityType === "student") {
      return "university";
    } else if (connectionType === "university_to_mentor" && otherUser.entityType === "mentor") {
      return "university";
    }
    return null;
  };

  const handleApplyForMentorship = (mentor) => {
    setSelectedMentor(mentor);
    setMentorshipFormOpen(true);
  };

  const handleMentorshipFormClose = () => {
    setMentorshipFormOpen(false);
    setSelectedMentor(null);
  };

  const handleMentorshipApplicationSuccess = () => {
    handleMentorshipFormClose();
    showToast("Mentorship application sent successfully!", "success");
    loadData();
    // Refresh the connections to reflect mentorship status
    // This will trigger a re-check of mentorship status in ConnectionCard
  };

  const handleVideoCallClick = (mentorshipData) => {
    // Find the mentor from the connections
    const connection = connections.find(conn =>
      (conn.otherUser?.id === mentorshipData?.mentorId ||
       conn.otherUser?._id === mentorshipData?.mentorId)
    );

    const mentor = connection?.otherUser || { firstName: "Mentor", lastName: "" };

    setSelectedMentorshipForVideo({
      mentorshipId: mentorshipData.mentorshipId || mentorshipData._id,
      mentor: mentor,
    });
    setVideoConferenceOpen(true);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading connections...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: "#1a1a1a", mb: 0.5 }}>
          Connections
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your network and discover new connections.
        </Typography>
      </Box>

      {/* Connection Stats */}
      <Grid container spacing={2} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2.5, textAlign: "center", borderRadius: "12px", border: "1px solid #e0e0e0", backgroundColor: "#f5f5f5" }}>
            <Typography variant="h5" fontWeight="bold" color="primary" sx={{ mb: 0.5 }}>
              {connectionStats.acceptedConnections || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">Active Connections</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2.5, textAlign: "center", borderRadius: "12px", border: "1px solid #e0e0e0", backgroundColor: "#f5f5f5" }}>
            <Typography variant="h5" fontWeight="bold" sx={{ color: "#f57c00", mb: 0.5 }}>
              {connectionStats.pendingReceived || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">Pending Requests</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2.5, textAlign: "center", borderRadius: "12px", border: "1px solid #e0e0e0", backgroundColor: "#f5f5f5" }}>
            <Typography variant="h5" fontWeight="bold" sx={{ color: "#667eea", mb: 0.5 }}>
              {connectionStats.pendingSent || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">Sent Requests</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2.5, textAlign: "center", borderRadius: "12px", border: "1px solid #e0e0e0", backgroundColor: "#f5f5f5" }}>
            <Typography variant="h5" fontWeight="bold" sx={{ color: "#2e7d32", mb: 0.5 }}>
              {potentialConnections.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">Recommendations</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
        >
          <Tab
            label={
              <Badge
                badgeContent={connectionStats.acceptedConnections}
                color="primary"
              >
                My Connections
              </Badge>
            }
            icon={<PeopleIcon />}
          />
          <Tab
            label={
              <Badge
                badgeContent={connectionStats.pendingReceived}
                color="error"
              >
                Requests
              </Badge>
            }
            icon={<InboxIcon />}
          />
          <Tab
            label={
              <Badge badgeContent={connectionStats.pendingSent} color="warning">
                Sent
              </Badge>
            }
            icon={<SendIcon />}
          />
          <Tab label="Discover" icon={<SearchIcon />} />
        </Tabs>
      </Box>

      {/* My Connections Tab */}
      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" gutterBottom>
          Active Connections
        </Typography>
        {connections.filter((c) => c.status === "accepted" || c.accepted).length === 0 ? (
          <Alert severity="info">
            You don't have any active connections yet. Check out the Discover
            tab to find people to connect with!
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {connections
              .filter((c) => c.status === "accepted" || c.accepted)
              .map((connection) => (
                <Grid item xs={12} md={6} key={connection.id || connection._id}>
                  <ConnectionCard
                    connection={{
                      ...connection,
                      id: connection.id || connection._id,
                      status: "accepted",
                      otherUser: connection.otherUser || connection.user,
                      respondedAt: connection.respondedAt || connection.acceptedAt,
                    }}
                    onAction={handleConnectionAction}
                    onApplyForMentorship={handleApplyForMentorship}
                    onVideoCall={handleVideoCallClick}
                    currentUserType={currentUserType}
                  />
                </Grid>
              ))}
          </Grid>
        )}
      </TabPanel>

      {/* Pending Requests Tab */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Pending Requests
        </Typography>
        {pendingRequests.length === 0 ? (
          <Alert severity="info">No pending connection requests.</Alert>
        ) : (
          <Grid container spacing={2}>
            {pendingRequests.map((request) => (
              <Grid item xs={12} md={6} key={request.id || request._id}>
                <ConnectionCard
                  connection={{
                    ...request,
                    id: request.id || request._id,
                    status: "pending",
                    otherUser: request.fromUser || request.from,
                    isFromUser: false,
                    requestedAt: request.createdAt || request.requestedAt,
                  }}
                  onAction={handleConnectionAction}
                  onApplyForMentorship={handleApplyForMentorship}
                  onVideoCall={handleVideoCallClick}
                  currentUserType={currentUserType}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Sent Requests Tab */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Sent Requests
        </Typography>
        {sentRequests.length === 0 ? (
          <Alert severity="info">No sent requests pending.</Alert>
        ) : (
          <Grid container spacing={2}>
            {sentRequests.map((request) => (
              <Grid item xs={12} md={6} key={request.id || request._id}>
                <ConnectionCard
                  connection={{
                    ...request,
                    id: request.id || request._id,
                    status: "pending",
                    otherUser: request.toUser || request.to,
                    isFromUser: true,
                    requestedAt: request.createdAt || request.requestedAt,
                  }}
                  onAction={handleConnectionAction}
                  onApplyForMentorship={handleApplyForMentorship}
                  onVideoCall={handleVideoCallClick}
                  currentUserType={currentUserType}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Discover Tab */}
      <TabPanel value={tabValue} index={3}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">Recommended Connections</Typography>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter by Type</InputLabel>
            <Select
              value={entityTypeFilter}
              label="Filter by Type"
              onChange={(e) => setEntityTypeFilter(e.target.value)}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="student">Students</MenuItem>
              <MenuItem value="mentor">Mentors</MenuItem>
              <MenuItem value="university">Universities</MenuItem>
            </Select>
          </FormControl>
        </Box>
        {potentialConnections.length === 0 ? (
          <Alert severity="info">
            No recommendations available at the moment. Try updating your
            profile to get better matches!
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {potentialConnections.map((user) => (
              <Grid item xs={12} sm={6} md={4} key={user.id}>
                <PotentialConnectionCard
                  user={user}
                  onConnect={handleConnect}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Connect Dialog */}
      <Dialog
        open={connectDialog.open}
        onClose={() => setConnectDialog({ open: false, user: null })}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "12px" } }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: "#1a1a1a", borderBottom: "1px solid #e0e0e0", pb: 1.5 }}>
          Send Connection Request
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {connectDialog.user && (
            <Box>
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar
                  src={connectDialog.user.profileImageUrl}
                  sx={{
                    mr: 2,
                    width: 56,
                    height: 56,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    fontWeight: "bold",
                  }}
                >
                  {connectDialog.user.firstName?.[0]}
                  {connectDialog.user.lastName?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="600" sx={{ color: "#1a1a1a" }}>
                    {connectDialog.user.firstName} {connectDialog.user.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {connectDialog.user.entityType}
                  </Typography>
                </Box>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Message (optional)"
                placeholder="Hi! I'd love to connect..."
                value={connectMessage}
                onChange={(e) => setConnectMessage(e.target.value)}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ pt: 2, pb: 2, borderTop: "1px solid #e0e0e0", gap: 1 }}>
          <Button
            onClick={() => setConnectDialog({ open: false, user: null })}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSendConnectionRequest}
            startIcon={<SendIcon />}
            sx={{ borderRadius: "8px", textTransform: "none" }}
          >
            Send Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mentorship Application Form */}
      {selectedMentor && (
        <StripeElementsProvider>
          <MentorshipApplicationForm
            mentor={selectedMentor}
            open={mentorshipFormOpen}
            onClose={handleMentorshipFormClose}
            onSuccess={handleMentorshipApplicationSuccess}
          />
        </StripeElementsProvider>
      )}

      {/* Video Conference Dialog */}
      {selectedMentorshipForVideo && (
        <VideoConferenceDialog
          open={videoConferenceOpen}
          onClose={() => {
            setVideoConferenceOpen(false);
            setSelectedMentorshipForVideo(null);
          }}
          mentorshipId={selectedMentorshipForVideo.mentorshipId}
          currentUser={userProfile}
          otherUser={selectedMentorshipForVideo.mentor}
          onSessionEnd={(reason) => {
            console.log("Video session ended:", reason);
            setVideoConferenceOpen(false);
            setSelectedMentorshipForVideo(null);
          }}
        />
      )}
    </Container>
  );
}
