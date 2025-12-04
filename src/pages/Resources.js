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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Search,
  School,
  AccountBalance,
  Home,
  FlightTakeoff,
  Language,
  Work,
  ExpandMore,
  Close,
  CheckCircle,
  Info,
  Link as LinkIcon,
  Add,
} from "@mui/icons-material";
import imageUploadApi from "../services/imageUploadApi";
import resourcesApi from "../services/resourcesApi";
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

const Resources = () => {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedResource, setSelectedResource] = useState(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [creatingResource, setCreatingResource] = useState(false);
  const [error, setError] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalResources, setTotalResources] = useState(0);
  const [page, setPage] = useState(1);
  const [resourceImageFile, setResourceImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [resourceFormData, setResourceFormData] = useState({
    title: "",
    category: "Scholarships",
    description: "",
    overview: "",
    sections: "",
    resources: "",
    tags: "",
    authorName: "",
    readTime: "",
    imageUrl: "",
    sourceUrl: "",
  });

  const categories = [
    { id: "All", label: "All Resources", icon: <Info /> },
    { id: "Scholarships", label: "Scholarships", icon: <School /> },
    { id: "Visa", label: "Visa & Immigration", icon: <FlightTakeoff /> },
    { id: "Housing", label: "Housing & Living", icon: <Home /> },
    { id: "Banking", label: "Banking & Finance", icon: <AccountBalance /> },
    { id: "Language", label: "Language Support", icon: <Language /> },
    { id: "Career", label: "Career & Jobs", icon: <Work /> },
  ];

  // Fetch resources from API
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        setError(null);

        const category = selectedCategory !== "All" ? selectedCategory : null;
        const response = await resourcesApi.getAllResources(
          page,
          10,
          category,
          searchTerm || null
        );

        // Handle both response formats (with success wrapper and without)
        const fetchedResources = response.data || response.resources || [];
        const total = response.pagination?.total || response.total || 0;

        setResources(fetchedResources);
        setTotalResources(total);
      } catch (err) {
        console.error("Error fetching resources:", err);
        setError("Failed to load resources. Please try again later.");
        setResources([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [selectedCategory, searchTerm, page]);

  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setResourceFormData({
      title: "",
      category: "Scholarships",
      description: "",
      overview: "",
      sections: "",
      resources: "",
      tags: "",
      authorName: "",
      readTime: "",
      imageUrl: "",
      sourceUrl: "",
    });
    setResourceImageFile(null);
    setUploadingImage(false);
  };

  const handleResourceFormChange = (e) => {
    const { name, value } = e.target;
    setResourceFormData({
      ...resourceFormData,
      [name]: value,
    });
  };

  const handleResourceImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setResourceImageFile(file);
    }
  };

  const handleCreateResource = async () => {
    try {
      if (
        !resourceFormData.title ||
        !resourceFormData.category ||
        !resourceFormData.description ||
        !resourceFormData.overview ||
        !resourceFormData.readTime
      ) {
        setError("Please fill in all required fields");
        return;
      }

      setCreatingResource(true);

      // Upload image if file is selected
      let imageUrl = resourceFormData.imageUrl;
      if (resourceImageFile) {
        try {
          setUploadingImage(true);
          const uploadResult = await imageUploadApi.uploadFile(resourceImageFile, 'resources');
          // Backend returns { imageUrl } or just the URL in the response
          if (uploadResult.imageUrl) {
            imageUrl = uploadResult.imageUrl;
          } else if (uploadResult.data?.imageUrl) {
            imageUrl = uploadResult.data.imageUrl;
          } else if (uploadResult.url) {
            imageUrl = uploadResult.url;
          }
        } catch (uploadErr) {
          console.warn("Image upload skipped, creating resource without image:", uploadErr.message);
          // Continue without image
        } finally {
          setUploadingImage(false);
        }
      }

      // Validate overview length
      if (resourceFormData.overview.length < 20) {
        setError("Overview must be at least 20 characters");
        return;
      }

      // Convert sections text to array of objects
      const sectionsArray = resourceFormData.sections
        .split("\n\n")
        .filter((s) => s.trim())
        .map((section) => {
          const lines = section.split("\n");
          return {
            title: lines[0] || "",
            content: lines[1] || "",
            tips: lines.slice(2).filter((t) => t.trim()),
          };
        });

      // Convert resources text to array of strings
      const resourcesArray = resourceFormData.resources
        .split("\n")
        .filter((r) => r.trim());

      // Build payload matching backend schema (no nested content, no id, no lastUpdated)
      const newResource = {
        title: resourceFormData.title,
        category: resourceFormData.category,
        description: resourceFormData.description,
        overview: resourceFormData.overview,
        sections: sectionsArray,
        resources: resourcesArray,
        tags: resourceFormData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((t) => t),
        readTime: resourceFormData.readTime,
      };

      // Add optional fields only if provided
      if (resourceFormData.authorName && resourceFormData.authorName.trim()) {
        newResource.authorName = resourceFormData.authorName;
      }
      if (imageUrl && imageUrl.trim()) {
        newResource.imageUrl = imageUrl;
      }
      if (
        resourceFormData.sourceUrl &&
        resourceFormData.sourceUrl.trim() &&
        isValidUrl(resourceFormData.sourceUrl)
      ) {
        newResource.sourceUrl = resourceFormData.sourceUrl;
      }

      // Send resource to backend API
      try {
        const response = await resourcesApi.createResource(newResource);

        if (response) {
          setError(null);

          // Log activity
          try {
            const resourceId = response.data?._id || response._id;
            const description = `${user?.firstName || 'User'} ${user?.lastName || ''} posted a resource: ${resourceFormData.title}`;
            await feedApi.logActivity('resource_created', description, resourceId, 'Resource', {
              resourceTitle: resourceFormData.title,
              category: resourceFormData.category
            });
          } catch (activityErr) {
            console.warn('Failed to log activity:', activityErr);
          }

          setSuccessMessage("Resource posted successfully!");
          handleCloseCreateDialog();

          // Refresh resources list from API
          setPage(1);
          const category = selectedCategory !== "All" ? selectedCategory : null;
          const updatedResponse = await resourcesApi.getAllResources(
            1,
            10,
            category,
            searchTerm || null
          );

          const updatedResources = updatedResponse.data || updatedResponse.resources || [];
          const updatedTotal = updatedResponse.pagination?.total || updatedResponse.total || 0;

          setResources(updatedResources);
          setTotalResources(updatedTotal);
        }
      } catch (apiErr) {
        console.error("Error saving resource to API:", apiErr);
        setError("Failed to save resource to database. Please try again.");
      }
    } catch (err) {
      console.error("Error creating resource:", err);
      setError("Failed to post resource. Please try again.");
    } finally {
      setCreatingResource(false);
    }
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      searchTerm === "" ||
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "All" || resource.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Resource Guides
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Access curated guides and resources to help you succeed in your study
            abroad journey.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleOpenCreateDialog}
          sx={{ height: "fit-content" }}
        >
          Post Resource
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search and Categories */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search resources, guides, and topics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
          }}
          sx={{ mb: 3 }}
        />

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {categories.map((category) => (
            <Chip
              key={category.id}
              label={category.label}
              icon={category.icon}
              variant={selectedCategory === category.id ? "filled" : "outlined"}
              color={selectedCategory === category.id ? "primary" : "default"}
              onClick={() => setSelectedCategory(category.id)}
              sx={{ cursor: "pointer" }}
            />
          ))}
        </Box>
      </Paper>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading Indicator */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Results Count */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {resources.length} resource
            {resources.length !== 1 ? "s" : ""} found
          </Typography>

          {/* Resource Cards */}
          <Grid container spacing={3}>
            {resources.length === 0 ? (
              <Box sx={{ width: "100%", py: 4, textAlign: "center" }}>
                <Typography color="text.secondary">
                  No resources found. Be the first to post one!
                </Typography>
              </Box>
            ) : (
              resources.map((resource) => (
          <Grid item xs={12} md={6} lg={4} key={resource.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  {categories.find((cat) => cat.id === resource.category)?.icon}
                  <Typography variant="caption" color="primary" sx={{ ml: 1 }}>
                    {resource.category}
                  </Typography>
                </Box>

                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {resource.title}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {resource.description}
                </Typography>

                <Box
                  sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }}
                >
                  {resource.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {resource.readTime} read
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Updated:{" "}
                    {new Date(resource.lastUpdated).toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>

              <CardActions>
                <Button
                  variant="contained"
                  onClick={() => {
                    setSelectedResource(resource);
                    // Log activity when reading/viewing a resource
                    try {
                      const description = `${user?.firstName || 'User'} ${user?.lastName || ''} viewed resource: ${resource.title}`;
                      feedApi.logActivity('resource_read', description, resource._id, 'Resource', {
                        resourceTitle: resource.title,
                        category: resource.category
                      });
                    } catch (activityErr) {
                      console.warn('Failed to log activity:', activityErr);
                    }
                  }}
                  fullWidth
                >
                  Read Guide
                </Button>
              </CardActions>
            </Card>
          </Grid>
              ))
            )}
          </Grid>
        </>
      )}

      {/* Resource Detail Dialog */}
      <Dialog
        open={!!selectedResource}
        onClose={() => setSelectedResource(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { maxHeight: "90vh" },
        }}
      >
        {selectedResource && (
          <>
            <DialogTitle>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {selectedResource.title}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                    {
                      categories.find(
                        (cat) => cat.id === selectedResource.category
                      )?.icon
                    }
                    <Typography variant="body2" color="primary" sx={{ ml: 1 }}>
                      {selectedResource.category}
                    </Typography>
                  </Box>
                </Box>
                <IconButton onClick={() => setSelectedResource(null)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {selectedResource.overview}
              </Typography>

              {selectedResource.sections && selectedResource.sections.length > 0 && (
                <>
                  {selectedResource.sections.map((section, index) => (
                    <Accordion key={index} defaultExpanded={index === 0}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="h6" fontWeight="bold">
                          {section.title}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {section.content}
                        </Typography>
                        <Typography variant="h6" gutterBottom>
                          Key Tips:
                        </Typography>
                        <List dense>
                          {section.tips.map((tip, tipIndex) => (
                            <ListItem key={tipIndex}>
                              <ListItemIcon>
                                <CheckCircle color="success" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={tip} />
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </>
              )}

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Additional Resources:
              </Typography>
              {selectedResource.resources && selectedResource.resources.length > 0 ? (
                <List>
                  {selectedResource.resources.map((resource, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <LinkIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={resource} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No additional resources provided.
                </Typography>
              )}

              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  backgroundColor: "grey.50",
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  <strong>Last Updated:</strong>{" "}
                  {new Date(selectedResource.lastUpdated).toLocaleDateString()}{" "}
                  •<strong> Read Time:</strong> {selectedResource.readTime}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                variant="contained"
                onClick={() => setSelectedResource(null)}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create Resource Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={handleCloseCreateDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Post New Resource Guide
          <IconButton onClick={handleCloseCreateDialog} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            fullWidth
            label="Resource Title"
            name="title"
            value={resourceFormData.title}
            onChange={handleResourceFormChange}
            placeholder="e.g., Student Housing Guide"
            required
          />

          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={resourceFormData.category}
              onChange={handleResourceFormChange}
              label="Category"
            >
              <MenuItem value="Scholarships">Scholarships</MenuItem>
              <MenuItem value="Visa">Visa</MenuItem>
              <MenuItem value="Housing">Housing</MenuItem>
              <MenuItem value="Banking">Banking</MenuItem>
              <MenuItem value="Language">Language</MenuItem>
              <MenuItem value="Career">Career</MenuItem>
              <MenuItem value="Health">Health</MenuItem>
              <MenuItem value="Culture">Culture</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={resourceFormData.description}
            onChange={handleResourceFormChange}
            multiline
            rows={2}
            placeholder="Brief description of your resource (minimum 10 characters)..."
            required
            helperText={`${resourceFormData.description.length}/10 characters minimum`}
          />

          <TextField
            fullWidth
            label="Overview"
            name="overview"
            value={resourceFormData.overview}
            onChange={handleResourceFormChange}
            multiline
            rows={2}
            placeholder="Detailed overview of the topic (minimum 20 characters)..."
            required
            helperText={`${resourceFormData.overview.length}/20 characters minimum`}
            error={resourceFormData.overview.length < 20}
          />

          <TextField
            fullWidth
            label="Sections (Optional)"
            name="sections"
            value={resourceFormData.sections}
            onChange={handleResourceFormChange}
            multiline
            rows={4}
            placeholder={`Format: Title\nContent\nTip1\nTip2\n\nTitle2\nContent2\nTip3\n\n(Separate sections with blank line)`}
            helperText="Each section: Title, then content, then tips (one per line). Sections separated by blank lines."
          />

          <TextField
            fullWidth
            label="Resources/Links (Optional)"
            name="resources"
            value={resourceFormData.resources}
            onChange={handleResourceFormChange}
            multiline
            rows={3}
            placeholder="University housing offices\nStudent housing websites\nLocal real estate platforms"
            helperText="One resource per line. Can be names, websites, or descriptions."
          />

          <TextField
            fullWidth
            label="Read Time"
            name="readTime"
            value={resourceFormData.readTime}
            onChange={handleResourceFormChange}
            placeholder="e.g., 15 min"
            required
          />

          <TextField
            fullWidth
            label="Author Name"
            name="authorName"
            value={resourceFormData.authorName}
            onChange={handleResourceFormChange}
            placeholder="Your name (optional)"
          />

          <TextField
            fullWidth
            label="Tags"
            name="tags"
            value={resourceFormData.tags}
            onChange={handleResourceFormChange}
            placeholder="Enter tags separated by commas (optional)"
          />

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
              Upload Image (Optional - will be skipped if upload service unavailable)
            </Typography>
            <input
              type="file"
              accept="image/*"
              onChange={handleResourceImageChange}
              style={{ marginBottom: "8px" }}
            />
            {resourceImageFile && (
              <Typography variant="caption" color="success.main" sx={{ display: "block" }}>
                ✓ File selected: {resourceImageFile.name}
              </Typography>
            )}
          </Box>

          <TextField
            fullWidth
            label="Source URL (Optional)"
            name="sourceUrl"
            value={resourceFormData.sourceUrl}
            onChange={handleResourceFormChange}
            placeholder="e.g., https://source.com"
            helperText="Leave empty or provide a valid URL starting with http:// or https://"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancel</Button>
          <Button
            onClick={handleCreateResource}
            variant="contained"
            color="primary"
            disabled={creatingResource || uploadingImage}
          >
            {uploadingImage
              ? "Uploading image..."
              : creatingResource
              ? <CircularProgress size={24} />
              : "Post Resource"}
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

export default Resources;
