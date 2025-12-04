import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
} from "@mui/material";
import {
  Search,
  Event,
  OndemandVideo,
  Schedule,
  LocationOn,
  Person,
  Close,
  CalendarToday,
  AccessTime,
  Language,
  Group,
  EventAvailable,
  Notifications,
  Share,
  Add,
} from "@mui/icons-material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import eventsApi from "../services/eventsApi";
import imageUploadApi from "../services/imageUploadApi";
import feedApi from "../services/feedApi";
import { useUser } from "../contexts/UserContext";

// Helper function to validate URLs
const isValidUrl = (urlString) => {
  try {
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }
};

const Events = () => {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [page, setPage] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "Webinar",
    description: "",
    date: null,
    time: "",
    duration: "",
    location: "",
    organizer: "",
    maxAttendees: 100,
    tags: "",
    imageUrl: "",
  });
  const [eventImageFile, setEventImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const eventTypes = [
    { id: "All", label: "All Events" },
    { id: "Webinar", label: "Webinars" },
    { id: "Workshop", label: "Workshops" },
    { id: "Career Fair", label: "Career Fairs" },
    { id: "Social", label: "Social Events" },
    { id: "Conference", label: "Conferences" },
  ];

  // Fetch events from API
  // Helper function to enrich events with registration status
  const enrichEventsWithRegistration = (eventsData) => {
    if (!user) return eventsData;
    return eventsData.map((event) => ({
      ...event,
      isRegistered: event.registeredUsers?.some((registeredUser) => {
        // Handle both ObjectId and full user objects
        const registeredUserId = typeof registeredUser === 'string' ? registeredUser : registeredUser?._id;
        return registeredUserId === user.id || registeredUserId === user._id;
      }) || false,
    }));
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const eventType = selectedType !== "All" ? selectedType : null;
        const response = await eventsApi.getAllEvents(page, 10, eventType, searchTerm || null);

        // Handle both response formats (with success wrapper and without)
        const events = response.data || response.events || [];
        const total = response.pagination?.total || response.total || 0;

        // Enrich events with registration status
        const enrichedEvents = enrichEventsWithRegistration(events);
        setEvents(enrichedEvents);
        setTotalEvents(total);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events. Please try again later.");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [selectedType, searchTerm, page, user]);

  const handleRegisterEvent = async (eventId) => {
    try {
      await eventsApi.registerForEvent(eventId);

      // Log activity
      try {
        const event = events.find(e => e._id === eventId);
        if (event) {
          const description = `${user?.firstName || 'User'} ${user?.lastName || ''} registered for event: ${event.title}`;
          await feedApi.logActivity('event_registered', description, eventId, 'Event', {
            eventTitle: event.title,
            eventType: event.type
          });
        }
      } catch (activityErr) {
        console.warn('Failed to log activity:', activityErr);
      }

      // Update the events list with enriched registration status
      const updatedEvents = events.map((evt) =>
        evt._id === eventId
          ? { ...evt, currentAttendees: evt.currentAttendees + 1, registeredUsers: [...(evt.registeredUsers || []), user.id] }
          : evt
      );
      const enrichedEvents = enrichEventsWithRegistration(updatedEvents);
      setEvents(enrichedEvents);

      // Update selected event with enriched registration status
      if (selectedEvent && selectedEvent._id === eventId) {
        const updatedSelectedEvent = {
          ...selectedEvent,
          currentAttendees: selectedEvent.currentAttendees + 1,
          registeredUsers: [...(selectedEvent.registeredUsers || []), user.id]
        };
        setSelectedEvent(enrichEventsWithRegistration([updatedSelectedEvent])[0]);
      }

      setSuccessMessage("Successfully registered for event!");
    } catch (err) {
      console.error("Error registering for event:", err);
      setError("Failed to register for event.");
    }
  };

  const handleUnregisterEvent = async (eventId) => {
    try {
      await eventsApi.unregisterFromEvent(eventId);

      // Update the events list with enriched registration status
      const updatedEvents = events.map((evt) =>
        evt._id === eventId
          ? {
              ...evt,
              currentAttendees: Math.max(0, evt.currentAttendees - 1),
              registeredUsers: (evt.registeredUsers || []).filter(
                (registeredUser) => {
                  const registeredUserId = typeof registeredUser === 'string' ? registeredUser : registeredUser?._id;
                  return registeredUserId !== user.id && registeredUserId !== user._id;
                }
              )
            }
          : evt
      );
      const enrichedEvents = enrichEventsWithRegistration(updatedEvents);
      setEvents(enrichedEvents);

      // Update selected event with enriched registration status
      if (selectedEvent && selectedEvent._id === eventId) {
        const updatedSelectedEvent = {
          ...selectedEvent,
          currentAttendees: Math.max(0, selectedEvent.currentAttendees - 1),
          registeredUsers: (selectedEvent.registeredUsers || []).filter(
            (registeredUser) => {
              const registeredUserId = typeof registeredUser === 'string' ? registeredUser : registeredUser?._id;
              return registeredUserId !== user.id && registeredUserId !== user._id;
            }
          )
        };
        setSelectedEvent(enrichEventsWithRegistration([updatedSelectedEvent])[0]);
      }
    } catch (err) {
      console.error("Error unregistering from event:", err);
      setError("Failed to unregister from event.");
    }
  };

  const handleOpenEventDetails = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseEventDetails = () => {
    setSelectedEvent(null);
  };

  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setFormData({
      title: "",
      type: "Webinar",
      description: "",
      date: null,
      time: "",
      duration: "",
      location: "",
      organizer: "",
      maxAttendees: 100,
      tags: "",
      imageUrl: "",
    });
    setEventImageFile(null);
    setUploadingImage(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleEventImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setEventImageFile(file);
    }
  };

  const handleCreateEvent = async () => {
    try {
      if (
        !formData.title ||
        !formData.description ||
        !formData.date ||
        !formData.time ||
        !formData.location ||
        !formData.organizer
      ) {
        setError("Please fill in all required fields");
        return;
      }

      setCreatingEvent(true);

      // Upload image if file is selected
      let imageUrl = formData.imageUrl;
      if (eventImageFile) {
        try {
          setUploadingImage(true);
          const uploadResult = await imageUploadApi.uploadFile(eventImageFile, 'events');
          // Backend returns { imageUrl } or just the URL in the response
          if (uploadResult.imageUrl) {
            imageUrl = uploadResult.imageUrl;
          } else if (uploadResult.data?.imageUrl) {
            imageUrl = uploadResult.data.imageUrl;
          } else if (uploadResult.url) {
            imageUrl = uploadResult.url;
          }
        } catch (uploadErr) {
          console.warn("Image upload skipped, creating event without image:", uploadErr.message);
          // Continue without image
        } finally {
          setUploadingImage(false);
        }
      }

      const eventPayload = {
        title: formData.title,
        type: formData.type,
        description: formData.description,
        date: formData.date?.toISOString(),
        time: formData.time,
        duration: formData.duration,
        location: formData.location,
        organizer: formData.organizer,
        maxAttendees: parseInt(formData.maxAttendees),
        tags: formData.tags
          ? formData.tags.split(",").map((tag) => tag.trim())
          : [],
      };

      // Only add imageUrl if it's provided and valid
      if (imageUrl && imageUrl.trim()) {
        eventPayload.imageUrl = imageUrl;
      }

      const response = await eventsApi.createEvent(eventPayload);

      if (response) {
        setError(null);

        // Log activity
        try {
          const eventId = response.data?._id || response._id;
          const description = `${user?.firstName || 'User'} ${user?.lastName || ''} created an event: ${formData.title}`;
          await feedApi.logActivity('event_created', description, eventId, 'Event', {
            eventTitle: formData.title,
            eventType: formData.type
          });
        } catch (activityErr) {
          console.warn('Failed to log activity:', activityErr);
        }

        setSuccessMessage("Event created successfully!");
        handleCloseCreateDialog();

        // Refresh events list
        setPage(1);
        const eventType = selectedType !== "All" ? selectedType : null;
        const updatedResponse = await eventsApi.getAllEvents(1, 10, eventType, searchTerm || null);

        const updatedEvents = updatedResponse.data || updatedResponse.events || [];
        const updatedTotal = updatedResponse.pagination?.total || updatedResponse.total || 0;

        setEvents(updatedEvents);
        setTotalEvents(updatedTotal);
      }
    } catch (err) {
      console.error("Error creating event:", err);
      setError("Failed to create event. Please try again.");
    } finally {
      setCreatingEvent(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === "All" || event.type === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{ fontWeight: "bold", mb: 2 }}
          >
            <Event sx={{ mr: 1, verticalAlign: "middle" }} />
            Events & Webinars
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Discover networking events, webinars, and workshops for international
            students
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleOpenCreateDialog}
          sx={{ height: "fit-content" }}
        >
          Create Event
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Sidebar - Filters */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            {/* Search */}
            <TextField
              fullWidth
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              InputProps={{ startAdornment: <Search sx={{ mr: 1 }} /> }}
              size="small"
              sx={{ mb: 3 }}
            />

            {/* Event Types Filter */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              Event Type
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {eventTypes.map((type) => (
                <Button
                  key={type.id}
                  fullWidth
                  variant={selectedType === type.id ? "contained" : "outlined"}
                  onClick={() => {
                    setSelectedType(type.id);
                    setPage(1);
                  }}
                  sx={{ justifyContent: "flex-start" }}
                >
                  {type.label}
                </Button>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Main Content - Events List */}
        <Grid item xs={12} md={9}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredEvents.length === 0 ? (
            <Alert severity="info">
              No events found. Try adjusting your filters.
            </Alert>
          ) : (
            <>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Showing {filteredEvents.length} of {totalEvents} events
              </Typography>

              <Grid container spacing={2}>
                {filteredEvents.map((event) => (
                  <Grid item xs={12} key={event._id}>
                    <Card
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        "&:hover": { boxShadow: 3 },
                        transition: "all 0.3s ease",
                      }}
                    >
                      <CardContent sx={{ pb: 1, flex: "1 1 auto" }}>
                        {/* Event Type Badge and Status */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Chip
                            icon={<Event />}
                            label={event.type || "Event"}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          {event.isRegistered && (
                            <Chip
                              icon={<EventAvailable />}
                              label="Registered"
                              size="small"
                              color="success"
                            />
                          )}
                        </Box>

                        {/* Title */}
                        <Typography
                          variant="h6"
                          component="div"
                          sx={{
                            fontWeight: "bold",
                            mb: 1,
                            cursor: "pointer",
                            "&:hover": { color: "primary.main" },
                          }}
                          onClick={() => handleOpenEventDetails(event)}
                        >
                          {event.title}
                        </Typography>

                        {/* Description */}
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                          {event.description?.substring(0, 150)}
                          {event.description?.length > 150 ? "..." : ""}
                        </Typography>

                        {/* Event Details */}
                        <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
                          {event.date && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <CalendarToday fontSize="small" color="action" />
                              <Typography variant="caption">
                                {dayjs(event.date).format("MMM DD, YYYY")}
                              </Typography>
                            </Box>
                          )}

                          {event.time && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <AccessTime fontSize="small" color="action" />
                              <Typography variant="caption">{event.time}</Typography>
                            </Box>
                          )}

                          {event.location && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <LocationOn fontSize="small" color="action" />
                              <Typography variant="caption">{event.location}</Typography>
                            </Box>
                          )}
                        </Box>

                        {/* Attendees */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Group fontSize="small" color="action" />
                          <Typography variant="caption">
                            {event.currentAttendees || 0} / {event.maxAttendees || "∞"} attendees
                          </Typography>
                        </Box>

                        {/* Tags */}
                        {event.tags && event.tags.length > 0 && (
                          <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
                            {event.tags.map((tag, idx) => (
                              <Chip
                                key={idx}
                                label={tag}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        )}
                      </CardContent>

                      <CardActions sx={{ pt: 0, gap: 1, flexWrap: "wrap", justifyContent: "space-between", flex: "0 0 auto" }}>
                        <Button
                          size="small"
                          color="primary"
                          onClick={() => handleOpenEventDetails(event)}
                        >
                          View Details
                        </Button>
                        {event.isRegistered ? (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleUnregisterEvent(event._id)}
                          >
                            Unregister
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => handleRegisterEvent(event._id)}
                          >
                            Register
                          </Button>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Grid>
      </Grid>

      {/* Event Details Dialog */}
      <Dialog
        open={Boolean(selectedEvent)}
        onClose={handleCloseEventDetails}
        maxWidth="sm"
        fullWidth
      >
        {selectedEvent && (
          <>
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {selectedEvent.title}
              <IconButton onClick={handleCloseEventDetails} size="small">
                <Close />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
              {/* Event Type and Status */}
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <Chip
                  icon={<Event />}
                  label={selectedEvent.type}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                {selectedEvent.isRegistered && (
                  <Chip
                    icon={<EventAvailable />}
                    label="Registered"
                    size="small"
                    color="success"
                  />
                )}
              </Box>

              {/* Description */}
              <Typography variant="body2" sx={{ mb: 2 }}>
                {selectedEvent.description}
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* Event Details */}
              <List>
                {selectedEvent.date && (
                  <ListItem>
                    <ListItemIcon>
                      <CalendarToday />
                    </ListItemIcon>
                    <ListItemText
                      primary="Date"
                      secondary={dayjs(selectedEvent.date).format("MMMM DD, YYYY")}
                    />
                  </ListItem>
                )}

                {selectedEvent.time && (
                  <ListItem>
                    <ListItemIcon>
                      <AccessTime />
                    </ListItemIcon>
                    <ListItemText primary="Time" secondary={selectedEvent.time} />
                  </ListItem>
                )}

                {selectedEvent.location && (
                  <ListItem>
                    <ListItemIcon>
                      <LocationOn />
                    </ListItemIcon>
                    <ListItemText primary="Location" secondary={selectedEvent.location} />
                  </ListItem>
                )}

                {selectedEvent.organizer && (
                  <ListItem>
                    <ListItemIcon>
                      <Person />
                    </ListItemIcon>
                    <ListItemText
                      primary="Organizer"
                      secondary={selectedEvent.organizer}
                    />
                  </ListItem>
                )}

                <ListItem>
                  <ListItemIcon>
                    <Group />
                  </ListItemIcon>
                  <ListItemText
                    primary="Attendees"
                    secondary={`${selectedEvent.currentAttendees || 0} / ${
                      selectedEvent.maxAttendees || "∞"
                    }`}
                  />
                </ListItem>
              </List>

              {/* Agenda */}
              {selectedEvent.agenda && selectedEvent.agenda.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                    Agenda
                  </Typography>
                  <List>
                    {selectedEvent.agenda.map((item, idx) => (
                      <ListItem key={idx}>
                        <ListItemText primary={`${idx + 1}. ${item}`} />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              {/* Speakers */}
              {selectedEvent.speakers && selectedEvent.speakers.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                    Speakers
                  </Typography>
                  <List>
                    {selectedEvent.speakers.map((speaker, idx) => (
                      <ListItem key={idx}>
                        <Avatar
                          sx={{ mr: 2, bgcolor: "primary.main" }}
                          src={speaker.avatar}
                        >
                          {speaker.name?.charAt(0)}
                        </Avatar>
                        <ListItemText
                          primary={speaker.name}
                          secondary={speaker.title}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              {/* Tags */}
              {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {selectedEvent.tags.map((tag, idx) => (
                      <Chip key={idx} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                </>
              )}
            </DialogContent>

            <DialogActions sx={{ gap: 1 }}>
              <Button onClick={handleCloseEventDetails}>Close</Button>
              {selectedEvent.isRegistered ? (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    handleUnregisterEvent(selectedEvent._id);
                    handleCloseEventDetails();
                  }}
                >
                  Unregister
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    handleRegisterEvent(selectedEvent._id);
                    handleCloseEventDetails();
                  }}
                >
                  Register
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create Event Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={handleCloseCreateDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Create New Event
          <IconButton onClick={handleCloseCreateDialog} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            fullWidth
            label="Event Title"
            name="title"
            value={formData.title}
            onChange={handleFormChange}
            placeholder="e.g., Tech Career Fair 2024"
            required
          />

          <FormControl fullWidth>
            <InputLabel>Event Type</InputLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={handleFormChange}
              label="Event Type"
            >
              <MenuItem value="Webinar">Webinar</MenuItem>
              <MenuItem value="Workshop">Workshop</MenuItem>
              <MenuItem value="Career Fair">Career Fair</MenuItem>
              <MenuItem value="Social">Social</MenuItem>
              <MenuItem value="Conference">Conference</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleFormChange}
            multiline
            rows={3}
            placeholder="Describe your event (minimum 10 characters)..."
            required
            helperText={`${formData.description.length}/10 characters minimum`}
          />

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Event Date"
              value={formData.date}
              onChange={(newValue) =>
                setFormData({ ...formData, date: newValue })
              }
              slotProps={{
                textField: { fullWidth: true },
              }}
            />
          </LocalizationProvider>

          <TextField
            fullWidth
            label="Time"
            name="time"
            type="time"
            value={formData.time}
            onChange={handleFormChange}
            InputLabelProps={{ shrink: true }}
            required
          />

          <TextField
            fullWidth
            label="Duration"
            name="duration"
            value={formData.duration}
            onChange={handleFormChange}
            placeholder="e.g., 2 hours"
          />

          <TextField
            fullWidth
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleFormChange}
            placeholder="e.g., Room 101, Building A"
            required
          />

          <TextField
            fullWidth
            label="Organizer Name"
            name="organizer"
            value={formData.organizer}
            onChange={handleFormChange}
            placeholder="Your name or organization"
            required
          />

          <TextField
            fullWidth
            label="Max Attendees"
            name="maxAttendees"
            type="number"
            value={formData.maxAttendees}
            onChange={handleFormChange}
          />

          <TextField
            fullWidth
            label="Tags"
            name="tags"
            value={formData.tags}
            onChange={handleFormChange}
            placeholder="Enter tags separated by commas (optional)"
          />

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
              Upload Image (Optional - will be skipped if upload service unavailable)
            </Typography>
            <input
              type="file"
              accept="image/*"
              onChange={handleEventImageChange}
              style={{ marginBottom: "8px" }}
            />
            {eventImageFile && (
              <Typography variant="caption" color="success.main" sx={{ display: "block" }}>
                ✓ File selected: {eventImageFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancel</Button>
          <Button
            onClick={handleCreateEvent}
            variant="contained"
            color="primary"
            disabled={creatingEvent || uploadingImage}
          >
            {uploadingImage
              ? "Uploading image..."
              : creatingEvent
              ? <CircularProgress size={24} />
              : "Create Event"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Toast Message */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage("")}
        message={successMessage}
      />
    </Container>
  );
};

export default Events;
