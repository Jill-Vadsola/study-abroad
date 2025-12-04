import React, { useState } from "react";
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Chip,
  Card,
  CardContent,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
} from "@mui/material";
import {
  Edit,
  Save,
  Cancel,
  PhotoCamera,
  School,
  LocationOn,
  Email,
  Language,
} from "@mui/icons-material";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@university.edu",
    university: "University of California, Berkeley",
    country: "United States",
    major: "Computer Science",
    year: "Graduate Student",
    bio: "International student from India pursuing Masters in Computer Science. Passionate about AI/ML and looking to connect with fellow students for study groups and cultural exchange.",
    interests: [
      "Machine Learning",
      "Programming",
      "Photography",
      "Travel",
      "Cultural Exchange",
    ],
    languages: ["English", "Hindi", "Spanish"],
    profilePicture: null,
  });

  const [editData, setEditData] = useState(profileData);

  const countries = [
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "France",
    "Netherlands",
    "Sweden",
    "Norway",
    "Denmark",
    "Switzerland",
    "Japan",
    "South Korea",
    "Singapore",
    "New Zealand",
    "Italy",
    "Spain",
  ];

  const interestOptions = [
    "Computer Science",
    "Engineering",
    "Business",
    "Medicine",
    "Arts",
    "Literature",
    "Music",
    "Sports",
    "Photography",
    "Travel",
    "Cooking",
    "Language Exchange",
    "Volunteer Work",
    "Research",
    "Internships",
    "Networking",
    "Cultural Events",
    "Study Groups",
    "Machine Learning",
    "Programming",
    "Cultural Exchange",
  ];

  const languageOptions = [
    "English",
    "Spanish",
    "French",
    "German",
    "Italian",
    "Portuguese",
    "Chinese",
    "Japanese",
    "Korean",
    "Arabic",
    "Hindi",
    "Russian",
    "Dutch",
    "Swedish",
    "Norwegian",
    "Danish",
  ];

  const yearOptions = [
    "Freshman",
    "Sophomore",
    "Junior",
    "Senior",
    "Graduate Student",
    "PhD Student",
  ];

  const handleEditToggle = () => {
    if (isEditing) {
      setEditData(profileData); // Reset changes
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    setProfileData(editData);
    setIsEditing(false);
    // TODO: Save to backend
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMultiSelectChange = (name) => (event) => {
    const { value } = event.target;
    setEditData((prev) => ({
      ...prev,
      [name]: typeof value === "string" ? value.split(",") : value,
    }));
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditData((prev) => ({
          ...prev,
          profilePicture: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography variant="h4" fontWeight="bold">
            My Profile
          </Typography>
          <Box>
            {isEditing ? (
              <>
                <Button
                  startIcon={<Save />}
                  onClick={handleSave}
                  sx={{ mr: 1 }}
                  variant="contained"
                >
                  Save
                </Button>
                <Button
                  startIcon={<Cancel />}
                  onClick={handleEditToggle}
                  variant="outlined"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                startIcon={<Edit />}
                onClick={handleEditToggle}
                variant="contained"
              >
                Edit Profile
              </Button>
            )}
          </Box>
        </Box>

        <Grid container spacing={4}>
          {/* Profile Picture and Basic Info */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Box
                  sx={{ position: "relative", display: "inline-block", mb: 2 }}
                >
                  <Avatar
                    src={editData.profilePicture}
                    sx={{ width: 120, height: 120, mx: "auto" }}
                  >
                    {editData.firstName?.[0]}
                    {editData.lastName?.[0]}
                  </Avatar>
                  {isEditing && (
                    <IconButton
                      color="primary"
                      component="label"
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        backgroundColor: "background.paper",
                      }}
                    >
                      <PhotoCamera />
                      <input
                        hidden
                        accept="image/*"
                        type="file"
                        onChange={handleProfilePictureChange}
                      />
                    </IconButton>
                  )}
                </Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {profileData.firstName} {profileData.lastName}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1,
                  }}
                >
                  <School sx={{ mr: 1, fontSize: 16 }} />
                  {profileData.university}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1,
                  }}
                >
                  <LocationOn sx={{ mr: 1, fontSize: 16 }} />
                  {profileData.country}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Email sx={{ mr: 1, fontSize: 16 }} />
                  {profileData.email}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Detailed Information */}
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Personal Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={editData.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={editData.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={editData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Academic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="University"
                    name="university"
                    value={editData.university}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Major"
                    name="major"
                    value={editData.major}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={6}>
                  {isEditing ? (
                    <FormControl fullWidth>
                      <InputLabel>Academic Year</InputLabel>
                      <Select
                        name="year"
                        value={editData.year}
                        label="Academic Year"
                        onChange={handleChange}
                      >
                        {yearOptions.map((year) => (
                          <MenuItem key={year} value={year}>
                            {year}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <TextField
                      fullWidth
                      label="Academic Year"
                      value={editData.year}
                      disabled
                    />
                  )}
                </Grid>
                <Grid item xs={12}>
                  {isEditing ? (
                    <FormControl fullWidth>
                      <InputLabel>Country</InputLabel>
                      <Select
                        name="country"
                        value={editData.country}
                        label="Country"
                        onChange={handleChange}
                      >
                        {countries.map((country) => (
                          <MenuItem key={country} value={country}>
                            {country}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <TextField
                      fullWidth
                      label="Country"
                      value={editData.country}
                      disabled
                    />
                  )}
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                About Me
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Bio"
                name="bio"
                value={editData.bio}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Interests
              </Typography>
              {isEditing ? (
                <FormControl fullWidth>
                  <InputLabel>Interests</InputLabel>
                  <Select
                    multiple
                    value={editData.interests}
                    onChange={handleMultiSelectChange("interests")}
                    input={<OutlinedInput label="Interests" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {interestOptions.map((interest) => (
                      <MenuItem key={interest} value={interest}>
                        {interest}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {profileData.interests.map((interest, index) => (
                    <Chip key={index} label={interest} variant="outlined" />
                  ))}
                </Box>
              )}
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h6"
                gutterBottom
                fontWeight="bold"
                sx={{ display: "flex", alignItems: "center" }}
              >
                <Language sx={{ mr: 1 }} />
                Languages
              </Typography>
              {isEditing ? (
                <FormControl fullWidth>
                  <InputLabel>Languages</InputLabel>
                  <Select
                    multiple
                    value={editData.languages}
                    onChange={handleMultiSelectChange("languages")}
                    input={<OutlinedInput label="Languages" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={value}
                            size="small"
                            color="primary"
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {languageOptions.map((language) => (
                      <MenuItem key={language} value={language}>
                        {language}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {profileData.languages.map((language, index) => (
                    <Chip
                      key={index}
                      label={language}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Profile;
