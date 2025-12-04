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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Snackbar,
} from "@mui/material";
import {
  Search,
  WorkOutline,
  LocationOn,
  MonetizationOn,
  School,
  Close,
  AttachMoney,
  BusinessCenter,
  Apartment,
  TravelExplore,
  SaveAlt,
  Bookmark,
  BookmarkBorder,
  Add,
} from "@mui/icons-material";
import jobsApi from "../services/jobsApi";
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

const Jobs = () => {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [page, setPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  // Filter states
  const [jobTypeFilter, setJobTypeFilter] = useState("All Types");
  const [workTypeFilter, setWorkTypeFilter] = useState("All Work Types");
  const [experienceLevelFilter, setExperienceLevelFilter] = useState("All Levels");
  const [locationFilter, setLocationFilter] = useState("All Locations");

  // Create job form states
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [creatingJob, setCreatingJob] = useState(false);
  const [jobImageFile, setJobImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [jobFormData, setJobFormData] = useState({
    title: "",
    company: "",
    location: "",
    jobType: "Full-time",
    workType: "On-site",
    experienceLevel: "Entry Level",
    salary: "",
    description: "",
    requirements: "",
    responsibilities: "",
    benefits: "",
    skills: "",
    companySize: "",
    industry: "",
    companyWebsite: "",
    companyDescription: "",
    applicationDeadline: "",
    sponsorsVisa: false,
    applicationUrl: "",
    tags: "",
    imageUrl: "",
  });

  const jobTypes = [
    "All Types",
    "Full-time",
    "Part-time",
    "Internship",
    "Contract",
    "Freelance",
  ];

  const workTypes = ["All Work Types", "On-site", "Remote", "Hybrid"];

  const experienceLevels = [
    "All Levels",
    "Entry Level",
    "Intermediate",
    "Senior",
    "Lead",
  ];

  const locations = [
    "All Locations",
    "New York",
    "San Francisco",
    "Boston",
    "Seattle",
    "Austin",
    "Remote",
  ];

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        const filters = {
          jobType: jobTypeFilter !== "All Types" ? jobTypeFilter : undefined,
          workType: workTypeFilter !== "All Work Types" ? workTypeFilter : undefined,
          experienceLevel:
            experienceLevelFilter !== "All Levels" ? experienceLevelFilter : undefined,
          location: locationFilter !== "All Locations" ? locationFilter : undefined,
          search: searchTerm || undefined,
        };

        const response = await jobsApi.getAllJobs(page, 10, filters);

        // Handle both response formats (with success wrapper and without)
        const jobs = response.data || response.jobs || [];
        const total = response.pagination?.total || response.total || 0;

        setJobs(jobs);
        setTotalJobs(total);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Failed to load jobs. Please try again later.");
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [jobTypeFilter, workTypeFilter, experienceLevelFilter, locationFilter, searchTerm, page]);

  const handleApplyJob = async (jobId) => {
    try {
      await jobsApi.applyForJob(jobId, {
        message: "I am interested in this position.",
      });

      // Update the jobs list
      setJobs(
        jobs.map((job) =>
          job._id === jobId
            ? { ...job, hasApplied: true }
            : job
        )
      );

      // Update selected job
      if (selectedJob && selectedJob._id === jobId) {
        setSelectedJob({ ...selectedJob, hasApplied: true });
      }

      setError(null);
    } catch (err) {
      console.error("Error applying for job:", err);
      setError("Failed to apply for job.");
    }
  };

  const handleSaveJob = async (jobId) => {
    const newSavedJobs = new Set(savedJobs);
    const isSaving = !newSavedJobs.has(jobId);

    if (isSaving) {
      newSavedJobs.add(jobId);
      // Log activity when saving a job
      try {
        const job = jobs.find(j => j._id === jobId);
        if (job) {
          const description = `${user?.firstName || 'User'} ${user?.lastName || ''} saved a job: ${job.title}`;
          await feedApi.logActivity('job_saved', description, jobId, 'Job', {
            jobTitle: job.title,
            company: job.company
          });
        }
      } catch (activityErr) {
        console.warn('Failed to log activity:', activityErr);
      }
    } else {
      newSavedJobs.delete(jobId);
    }
    setSavedJobs(newSavedJobs);
  };

  const handleOpenJobDetails = (job) => {
    setSelectedJob(job);
  };

  const handleCloseJobDetails = () => {
    setSelectedJob(null);
  };

  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setJobFormData({
      title: "",
      company: "",
      location: "",
      jobType: "Full-time",
      workType: "On-site",
      experienceLevel: "Entry Level",
      salary: "",
      description: "",
      requirements: "",
      responsibilities: "",
      benefits: "",
      skills: "",
      companySize: "",
      industry: "",
      companyWebsite: "",
      companyDescription: "",
      applicationDeadline: "",
      sponsorsVisa: false,
      applicationUrl: "",
      tags: "",
      imageUrl: "",
    });
    setJobImageFile(null);
    setUploadingImage(false);
  };

  const handleJobFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setJobFormData({
      ...jobFormData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleJobImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setJobImageFile(file);
    }
  };

  const handleCreateJob = async () => {
    try {
      if (
        !jobFormData.title ||
        !jobFormData.company ||
        !jobFormData.location ||
        !jobFormData.salary ||
        !jobFormData.description ||
        !jobFormData.requirements ||
        !jobFormData.responsibilities ||
        !jobFormData.skills
      ) {
        setError("Please fill in all required fields");
        return;
      }

      if (jobFormData.description.length < 20) {
        setError("Job description must be at least 20 characters");
        return;
      }

      setCreatingJob(true);

      // Upload image if file is selected
      let imageUrl = jobFormData.imageUrl;
      if (jobImageFile) {
        try {
          setUploadingImage(true);
          const uploadResult = await imageUploadApi.uploadFile(jobImageFile, 'jobs');
          // Backend returns { imageUrl } or just the URL in the response
          if (uploadResult.imageUrl) {
            imageUrl = uploadResult.imageUrl;
          } else if (uploadResult.data?.imageUrl) {
            imageUrl = uploadResult.data.imageUrl;
          } else if (uploadResult.url) {
            imageUrl = uploadResult.url;
          }
        } catch (uploadErr) {
          console.warn("Image upload skipped, posting job without image:", uploadErr.message);
          // Continue without image
        } finally {
          setUploadingImage(false);
        }
      }

      const jobPayload = {
        title: jobFormData.title,
        company: jobFormData.company,
        location: jobFormData.location,
        jobType: jobFormData.jobType,
        workType: jobFormData.workType,
        experienceLevel: jobFormData.experienceLevel,
        salary: jobFormData.salary,
        description: jobFormData.description,
        requirements: jobFormData.requirements
          .split("\n")
          .filter((item) => item.trim()),
        responsibilities: jobFormData.responsibilities
          .split("\n")
          .filter((item) => item.trim()),
        benefits: jobFormData.benefits
          .split("\n")
          .filter((item) => item.trim()),
        skills: jobFormData.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter((item) => item),
        companySize: jobFormData.companySize,
        industry: jobFormData.industry,
        companyDescription: jobFormData.companyDescription,
        applicationDeadline: jobFormData.applicationDeadline,
        sponsorsVisa: jobFormData.sponsorsVisa,
        tags: jobFormData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((item) => item),
      };

      // Only add companyWebsite if it's provided and valid URL
      if (
        jobFormData.companyWebsite &&
        jobFormData.companyWebsite.trim() &&
        isValidUrl(jobFormData.companyWebsite)
      ) {
        jobPayload.companyWebsite = jobFormData.companyWebsite;
      }

      // Only add applicationUrl if it's provided and valid URL
      if (
        jobFormData.applicationUrl &&
        jobFormData.applicationUrl.trim() &&
        isValidUrl(jobFormData.applicationUrl)
      ) {
        jobPayload.applicationUrl = jobFormData.applicationUrl;
      }

      // Only add imageUrl if it's provided and valid
      if (imageUrl && imageUrl.trim()) {
        jobPayload.imageUrl = imageUrl;
      }

      const response = await jobsApi.createJob(jobPayload);

      if (response) {
        setError(null);

        // Log activity
        try {
          const jobId = response.data?._id || response._id;
          const description = `${user?.firstName || 'User'} ${user?.lastName || ''} posted a job: ${jobFormData.title} at ${jobFormData.company}`;
          await feedApi.logActivity('job_created', description, jobId, 'Job', {
            jobTitle: jobFormData.title,
            company: jobFormData.company
          });
        } catch (activityErr) {
          console.warn('Failed to log activity:', activityErr);
        }

        setSuccessMessage("Job posted successfully!");
        handleCloseCreateDialog();

        // Refresh jobs list
        setPage(1);
        const filters = {
          jobType: jobTypeFilter !== "All Types" ? jobTypeFilter : undefined,
          workType: workTypeFilter !== "All Work Types" ? workTypeFilter : undefined,
          experienceLevel:
            experienceLevelFilter !== "All Levels" ? experienceLevelFilter : undefined,
          location: locationFilter !== "All Locations" ? locationFilter : undefined,
          search: searchTerm || undefined,
        };
        const updatedResponse = await jobsApi.getAllJobs(1, 10, filters);

        const updatedJobs = updatedResponse.data || updatedResponse.jobs || [];
        const updatedTotal = updatedResponse.pagination?.total || updatedResponse.total || 0;

        setJobs(updatedJobs);
        setTotalJobs(updatedTotal);
      }
    } catch (err) {
      console.error("Error creating job:", err);
      setError("Failed to post job. Please try again.");
    } finally {
      setCreatingJob(false);
    }
  };

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
            <WorkOutline sx={{ mr: 1, verticalAlign: "middle" }} />
            Job & Internship Board
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Find career opportunities and internships suitable for international students
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleOpenCreateDialog}
          sx={{ height: "fit-content" }}
        >
          Post Job
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
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              InputProps={{ startAdornment: <Search sx={{ mr: 1 }} /> }}
              size="small"
              sx={{ mb: 3 }}
            />

            {/* Job Type Filter */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Job Type</InputLabel>
              <Select
                value={jobTypeFilter}
                label="Job Type"
                onChange={(e) => {
                  setJobTypeFilter(e.target.value);
                  setPage(1);
                }}
                size="small"
              >
                {jobTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Work Type Filter */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Work Type</InputLabel>
              <Select
                value={workTypeFilter}
                label="Work Type"
                onChange={(e) => {
                  setWorkTypeFilter(e.target.value);
                  setPage(1);
                }}
                size="small"
              >
                {workTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Experience Level Filter */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Experience Level</InputLabel>
              <Select
                value={experienceLevelFilter}
                label="Experience Level"
                onChange={(e) => {
                  setExperienceLevelFilter(e.target.value);
                  setPage(1);
                }}
                size="small"
              >
                {experienceLevels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Location Filter */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Location</InputLabel>
              <Select
                value={locationFilter}
                label="Location"
                onChange={(e) => {
                  setLocationFilter(e.target.value);
                  setPage(1);
                }}
                size="small"
              >
                {locations.map((location) => (
                  <MenuItem key={location} value={location}>
                    {location}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
        </Grid>

        {/* Main Content - Jobs List */}
        <Grid item xs={12} md={9}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : jobs.length === 0 ? (
            <Alert severity="info">
              No jobs found. Try adjusting your filters.
            </Alert>
          ) : (
            <>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Showing {jobs.length} of {totalJobs} jobs
              </Typography>

              <Grid container spacing={2}>
                {jobs.map((job) => (
                  <Grid item xs={12} key={job._id}>
                    <Card
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        "&:hover": { boxShadow: 3 },
                        transition: "all 0.3s ease",
                      }}
                    >
                      <CardContent sx={{ pb: 1 }}>
                        {/* Job Type and Application Status */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Chip
                              icon={<WorkOutline />}
                              label={job.jobType || "Job"}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                            <Chip
                              label={job.workType || "Work Type"}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => handleSaveJob(job._id)}
                            color={savedJobs.has(job._id) ? "primary" : "default"}
                          >
                            {savedJobs.has(job._id) ? (
                              <Bookmark />
                            ) : (
                              <BookmarkBorder />
                            )}
                          </IconButton>
                        </Box>

                        {/* Company and Title */}
                        <Typography
                          variant="h6"
                          component="div"
                          sx={{
                            fontWeight: "bold",
                            mb: 0.5,
                          }}
                        >
                          {job.title}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{ mb: 1 }}
                        >
                          {job.company}
                        </Typography>

                        {/* Description */}
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                          {job.description?.substring(0, 150)}
                          {job.description?.length > 150 ? "..." : ""}
                        </Typography>

                        {/* Job Details */}
                        <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
                          {job.location && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <LocationOn fontSize="small" color="action" />
                              <Typography variant="caption">{job.location}</Typography>
                            </Box>
                          )}

                          {job.salary && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <MonetizationOn fontSize="small" color="action" />
                              <Typography variant="caption">{job.salary}</Typography>
                            </Box>
                          )}

                          {job.experienceLevel && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <School fontSize="small" color="action" />
                              <Typography variant="caption">
                                {job.experienceLevel}
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        {/* Visa Sponsorship */}
                        {job.sponsorsVisa && (
                          <Chip
                            icon={<TravelExplore />}
                            label="Visa Sponsorship Available"
                            size="small"
                            color="success"
                            sx={{ mb: 2 }}
                          />
                        )}

                        {/* Skills/Requirements */}
                        {job.skills && job.skills.length > 0 && (
                          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                            {job.skills.slice(0, 4).map((skill, idx) => (
                              <Chip
                                key={idx}
                                label={skill}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                            {job.skills.length > 4 && (
                              <Chip
                                label={`+${job.skills.length - 4} more`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        )}
                      </CardContent>

                      <CardActions sx={{ pt: 0 }}>
                        <Button
                          size="small"
                          color="primary"
                          onClick={() => handleOpenJobDetails(job)}
                        >
                          View Details
                        </Button>
                        {job.hasApplied ? (
                          <Button size="small" variant="outlined" disabled>
                            Applied
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => handleApplyJob(job._id)}
                          >
                            Apply
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

      {/* Job Details Dialog */}
      <Dialog
        open={Boolean(selectedJob)}
        onClose={handleCloseJobDetails}
        maxWidth="sm"
        fullWidth
      >
        {selectedJob && (
          <>
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {selectedJob.title}
              <IconButton onClick={handleCloseJobDetails} size="small">
                <Close />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
              {/* Company */}
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                {selectedJob.company}
              </Typography>

              {/* Description */}
              <Typography variant="body2" sx={{ mb: 2 }}>
                {selectedJob.description}
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* Job Details */}
              <List>
                <ListItem>
                  <ListItemIcon>
                    <WorkOutline />
                  </ListItemIcon>
                  <ListItemText
                    primary="Job Type"
                    secondary={selectedJob.jobType}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Apartment />
                  </ListItemIcon>
                  <ListItemText
                    primary="Work Type"
                    secondary={selectedJob.workType}
                  />
                </ListItem>

                {selectedJob.location && (
                  <ListItem>
                    <ListItemIcon>
                      <LocationOn />
                    </ListItemIcon>
                    <ListItemText
                      primary="Location"
                      secondary={selectedJob.location}
                    />
                  </ListItem>
                )}

                {selectedJob.salary && (
                  <ListItem>
                    <ListItemIcon>
                      <AttachMoney />
                    </ListItemIcon>
                    <ListItemText
                      primary="Salary"
                      secondary={selectedJob.salary}
                    />
                  </ListItem>
                )}

                <ListItem>
                  <ListItemIcon>
                    <School />
                  </ListItemIcon>
                  <ListItemText
                    primary="Experience Level"
                    secondary={selectedJob.experienceLevel}
                  />
                </ListItem>

                {selectedJob.applicationDeadline && (
                  <ListItem>
                    <ListItemIcon>
                      <BusinessCenter />
                    </ListItemIcon>
                    <ListItemText
                      primary="Application Deadline"
                      secondary={new Date(selectedJob.applicationDeadline).toLocaleDateString()}
                    />
                  </ListItem>
                )}
              </List>

              {/* Requirements */}
              {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                    Requirements
                  </Typography>
                  <List>
                    {selectedJob.requirements.map((req, idx) => (
                      <ListItem key={idx}>
                        <ListItemText primary={`• ${req}`} />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              {/* Responsibilities */}
              {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                    Responsibilities
                  </Typography>
                  <List>
                    {selectedJob.responsibilities.map((resp, idx) => (
                      <ListItem key={idx}>
                        <ListItemText primary={`• ${resp}`} />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              {/* Skills */}
              {selectedJob.skills && selectedJob.skills.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                    Required Skills
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {selectedJob.skills.map((skill, idx) => (
                      <Chip key={idx} label={skill} variant="outlined" />
                    ))}
                  </Box>
                </>
              )}

              {/* Visa Sponsorship */}
              {selectedJob.sponsorsVisa && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Chip
                    icon={<TravelExplore />}
                    label="Visa Sponsorship Available"
                    color="success"
                    sx={{ mb: 2 }}
                  />
                </>
              )}
            </DialogContent>

            <DialogActions>
              <Button onClick={handleCloseJobDetails}>Close</Button>
              {selectedJob.hasApplied ? (
                <Button variant="outlined" disabled>
                  Already Applied
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    handleApplyJob(selectedJob._id);
                    handleCloseJobDetails();
                  }}
                >
                  Apply Now
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create Job Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={handleCloseCreateDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Post New Job
          <IconButton onClick={handleCloseCreateDialog} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            fullWidth
            label="Job Title"
            name="title"
            value={jobFormData.title}
            onChange={handleJobFormChange}
            placeholder="e.g., Senior Software Engineer"
            required
          />

          <TextField
            fullWidth
            label="Company Name"
            name="company"
            value={jobFormData.company}
            onChange={handleJobFormChange}
            placeholder="Your company name"
            required
          />

          <TextField
            fullWidth
            label="Location"
            name="location"
            value={jobFormData.location}
            onChange={handleJobFormChange}
            placeholder="e.g., San Francisco, CA"
            required
          />

          <FormControl fullWidth>
            <InputLabel>Job Type</InputLabel>
            <Select
              name="jobType"
              value={jobFormData.jobType}
              onChange={handleJobFormChange}
              label="Job Type"
            >
              <MenuItem value="Full-time">Full-time</MenuItem>
              <MenuItem value="Part-time">Part-time</MenuItem>
              <MenuItem value="Internship">Internship</MenuItem>
              <MenuItem value="Contract">Contract</MenuItem>
              <MenuItem value="Freelance">Freelance</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Work Type</InputLabel>
            <Select
              name="workType"
              value={jobFormData.workType}
              onChange={handleJobFormChange}
              label="Work Type"
            >
              <MenuItem value="On-site">On-site</MenuItem>
              <MenuItem value="Remote">Remote</MenuItem>
              <MenuItem value="Hybrid">Hybrid</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Experience Level</InputLabel>
            <Select
              name="experienceLevel"
              value={jobFormData.experienceLevel}
              onChange={handleJobFormChange}
              label="Experience Level"
            >
              <MenuItem value="Entry Level">Entry Level</MenuItem>
              <MenuItem value="Intermediate">Intermediate</MenuItem>
              <MenuItem value="Senior">Senior</MenuItem>
              <MenuItem value="Lead">Lead</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Salary"
            name="salary"
            value={jobFormData.salary}
            onChange={handleJobFormChange}
            placeholder="e.g., $80,000 - $120,000"
            required
          />

          <TextField
            fullWidth
            label="Job Description"
            name="description"
            value={jobFormData.description}
            onChange={handleJobFormChange}
            multiline
            rows={3}
            placeholder="Describe the job (minimum 20 characters)..."
            required
            helperText={`${jobFormData.description.length}/20 characters minimum`}
          />

          <TextField
            fullWidth
            label="Requirements"
            name="requirements"
            value={jobFormData.requirements}
            onChange={handleJobFormChange}
            multiline
            rows={3}
            placeholder="Enter each requirement on a new line"
            required
          />

          <TextField
            fullWidth
            label="Responsibilities"
            name="responsibilities"
            value={jobFormData.responsibilities}
            onChange={handleJobFormChange}
            multiline
            rows={3}
            placeholder="Enter each responsibility on a new line"
            required
          />

          <TextField
            fullWidth
            label="Benefits"
            name="benefits"
            value={jobFormData.benefits}
            onChange={handleJobFormChange}
            multiline
            rows={2}
            placeholder="Enter each benefit on a new line (optional)"
          />

          <TextField
            fullWidth
            label="Required Skills"
            name="skills"
            value={jobFormData.skills}
            onChange={handleJobFormChange}
            placeholder="Enter skills separated by commas (required)"
            required
          />

          <TextField
            fullWidth
            label="Company Size"
            name="companySize"
            value={jobFormData.companySize}
            onChange={handleJobFormChange}
            placeholder="e.g., 50-200 employees (optional)"
          />

          <TextField
            fullWidth
            label="Industry"
            name="industry"
            value={jobFormData.industry}
            onChange={handleJobFormChange}
            placeholder="e.g., Technology, Finance (optional)"
          />

          <TextField
            fullWidth
            label="Company Website (Optional)"
            name="companyWebsite"
            value={jobFormData.companyWebsite}
            onChange={handleJobFormChange}
            placeholder="e.g., https://example.com"
            helperText="Leave empty or provide a valid URL starting with http:// or https://"
          />

          <TextField
            fullWidth
            label="Company Description"
            name="companyDescription"
            value={jobFormData.companyDescription}
            onChange={handleJobFormChange}
            multiline
            rows={2}
            placeholder="Brief description of your company (optional)"
          />

          <TextField
            fullWidth
            label="Application Deadline"
            name="applicationDeadline"
            type="date"
            value={jobFormData.applicationDeadline}
            onChange={handleJobFormChange}
            InputLabelProps={{ shrink: true }}
          />

          <Box>
            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                name="sponsorsVisa"
                checked={jobFormData.sponsorsVisa}
                onChange={handleJobFormChange}
              />
              Sponsors Visa
            </label>
          </Box>

          <TextField
            fullWidth
            label="Application URL (Optional)"
            name="applicationUrl"
            value={jobFormData.applicationUrl}
            onChange={handleJobFormChange}
            placeholder="e.g., https://example.com/apply"
            helperText="Leave empty or provide a valid URL starting with http:// or https://"
          />

          <TextField
            fullWidth
            label="Tags"
            name="tags"
            value={jobFormData.tags}
            onChange={handleJobFormChange}
            placeholder="Enter tags separated by commas (optional)"
          />

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
              Upload Image (Optional - will be skipped if upload service unavailable)
            </Typography>
            <input
              type="file"
              accept="image/*"
              onChange={handleJobImageChange}
              style={{ marginBottom: "8px" }}
            />
            {jobImageFile && (
              <Typography variant="caption" color="success.main" sx={{ display: "block" }}>
                ✓ File selected: {jobImageFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancel</Button>
          <Button
            onClick={handleCreateJob}
            variant="contained"
            color="primary"
            disabled={creatingJob || uploadingImage}
          >
            {uploadingImage
              ? "Uploading image..."
              : creatingJob
              ? <CircularProgress size={24} />
              : "Post Job"}
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

export default Jobs;
