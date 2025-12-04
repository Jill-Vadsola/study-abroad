import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Chip,
  Badge,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Inbox as InboxIcon,
  ArrowForward as ArrowForwardIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { connectionsApi } from "../services/connectionsApi";
import { useToast } from "../contexts/ToastContext";

export default function ConnectionsWidget() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [connectionStats, setConnectionStats] = useState({});
  const [recentConnections, setRecentConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConnectionsData();
  }, []);

  const loadConnectionsData = async () => {
    try {
      setLoading(true);
      const [pendingData, statsData, connectionsData] = await Promise.all([
        connectionsApi.getPendingRequests(),
        connectionsApi.getConnectionStats(),
        connectionsApi.getUserConnections("accepted"),
      ]);

      setPendingRequests(pendingData.slice(0, 3)); // Show only first 3
      setConnectionStats(statsData);
      setRecentConnections(connectionsData.slice(0, 3)); // Show only first 3
    } catch (error) {
      console.error("Error loading connections data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionAction = async (action, connectionId) => {
    try {
      if (action === "accept") {
        await connectionsApi.acceptConnection(connectionId);
        showToast("Connection request accepted!", "success");
      } else if (action === "reject") {
        await connectionsApi.rejectConnection(connectionId);
        showToast("Connection request rejected", "success");
      }

      // Reload data
      await loadConnectionsData();
    } catch (error) {
      showToast(`Failed to ${action} connection`, "error");
      console.error(`Error ${action}ing connection:`, error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Loading connections...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Connection Stats */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <Typography variant="h6">Connections Overview</Typography>
            <Button
              variant="outlined"
              size="small"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate("/connections")}
            >
              View All
            </Button>
          </Box>

          <Box display="flex" justifyContent="space-around" textAlign="center">
            <Box>
              <Typography variant="h4" color="primary">
                {connectionStats.acceptedConnections || 0}
              </Typography>
              <Typography variant="caption">Active</Typography>
            </Box>
            <Box>
              <Typography variant="h4" color="warning.main">
                {connectionStats.pendingReceived || 0}
              </Typography>
              <Typography variant="caption">Pending</Typography>
            </Box>
            <Box>
              <Typography variant="h4" color="info.main">
                {connectionStats.pendingSent || 0}
              </Typography>
              <Typography variant="caption">Sent</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Badge badgeContent={pendingRequests.length} color="error">
                <InboxIcon />
              </Badge>
              <Typography variant="h6" sx={{ ml: 1 }}>
                Pending Requests
              </Typography>
            </Box>

            <List dense>
              {pendingRequests.map((request) => (
                <ListItem
                  key={request.id}
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={request.fromUser.profileImageUrl}>
                      {request.fromUser.firstName?.[0]}
                      {request.fromUser.lastName?.[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${request.fromUser.firstName} ${request.fromUser.lastName}`}
                    secondary={
                      <Box>
                        <Chip
                          label={request.fromUser.entityType}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        {request.message && (
                          <Typography variant="caption" display="block">
                            "{request.message.slice(0, 50)}..."
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <Box display="flex" gap={0.5}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() =>
                        handleConnectionAction("accept", request.id)
                      }
                    >
                      <CheckIcon fontSize="small" />
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() =>
                        handleConnectionAction("reject", request.id)
                      }
                    >
                      <CloseIcon fontSize="small" />
                    </Button>
                  </Box>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Recent Connections */}
      {recentConnections.length > 0 && (
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <PeopleIcon />
              <Typography variant="h6" sx={{ ml: 1 }}>
                Recent Connections
              </Typography>
            </Box>

            <List dense>
              {recentConnections.map((connection) => (
                <ListItem key={connection.id}>
                  <ListItemAvatar>
                    <Avatar src={connection.otherUser.profileImageUrl}>
                      {connection.otherUser.firstName?.[0]}
                      {connection.otherUser.lastName?.[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${connection.otherUser.firstName} ${connection.otherUser.lastName}`}
                    secondary={
                      <Box>
                        <Chip
                          label={connection.otherUser.entityType}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="caption">
                          Connected{" "}
                          {new Date(
                            connection.respondedAt || connection.requestedAt
                          ).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {pendingRequests.length === 0 && recentConnections.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <PersonAddIcon
              sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h6" gutterBottom>
              Start Building Connections
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Connect with mentors, students, and universities to expand your
              network.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/connections")}
              startIcon={<PersonAddIcon />}
            >
              Explore Connections
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
