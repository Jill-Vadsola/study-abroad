import React, { useState } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Avatar,
  Button,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Divider,
} from "@mui/material";
import {
  Search,
  FilterList,
  PersonAdd,
  Message,
  School,
  LocationOn,
  Close,
  Language,
} from "@mui/icons-material";

const Networking = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    country: "",
    university: "",
    interests: "",
  });
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Mock student data
  const [students] = useState([
    {
      id: 1,
      firstName: "Maria",
      lastName: "Garcia",
      university: "MIT",
      country: "Spain",
      major: "Computer Science",
      year: "Graduate Student",
      bio: "AI researcher passionate about machine learning and neural networks. Looking to collaborate on research projects.",
      interests: ["Machine Learning", "Research", "Programming", "Photography"],
      languages: ["Spanish", "English", "French"],
      profilePicture: null,
      isConnected: false,
    },
    {
      id: 2,
      firstName: "Hiroshi",
      lastName: "Tanaka",
      university: "Stanford University",
      country: "Japan",
      major: "Business Administration",
      year: "Senior",
      bio: "Business student interested in entrepreneurship and international markets. Love exploring new cultures.",
      interests: [
        "Business",
        "Entrepreneurship",
        "Travel",
        "Cultural Exchange",
      ],
      languages: ["Japanese", "English", "Korean"],
      profilePicture: null,
      isConnected: true,
    },
    {
      id: 3,
      firstName: "Emma",
      lastName: "Johnson",
      university: "University of Oxford",
      country: "United Kingdom",
      major: "Literature",
      year: "Junior",
      bio: "Literature student with a passion for creative writing and poetry. Always up for book discussions!",
      interests: ["Literature", "Writing", "Poetry", "Arts", "Cultural Events"],
      languages: ["English", "French", "Italian"],
      profilePicture: null,
      isConnected: false,
    },
    {
      id: 4,
      firstName: "Ahmed",
      lastName: "Hassan",
      university: "University of Toronto",
      country: "Canada",
      major: "Engineering",
      year: "Graduate Student",
      bio: "Engineering student specializing in renewable energy. Passionate about sustainable technology solutions.",
      interests: ["Engineering", "Sustainability", "Technology", "Sports"],
      languages: ["Arabic", "English", "French"],
      profilePicture: null,
      isConnected: false,
    },
    {
      id: 5,
      firstName: "Sophie",
      lastName: "Mueller",
      university: "TU Munich",
      country: "Germany",
      major: "Medicine",
      year: "PhD Student",
      bio: "Medical researcher focusing on neuroscience. Love hiking and exploring new places in my free time.",
      interests: ["Medicine", "Research", "Hiking", "Travel", "Volunteer Work"],
      languages: ["German", "English", "Spanish"],
      profilePicture: null,
      isConnected: false,
    },
  ]);

  const countries = [
    "All Countries",
    "Spain",
    "Japan",
    "United Kingdom",
    "Canada",
    "Germany",
    "United States",
  ];
  const universities = [
    "All Universities",
    "MIT",
    "Stanford University",
    "University of Oxford",
    "University of Toronto",
    "TU Munich",
  ];

  const handleConnect = (studentId) => {
    // TODO: Implement connection logic
    console.log("Connect with student:", studentId);
  };

  const handleMessage = (studentId) => {
    // TODO: Implement messaging logic
    console.log("Message student:", studentId);
  };

  const handleViewProfile = (student) => {
    setSelectedProfile(student);
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      searchTerm === "" ||
      `${student.firstName} ${student.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      student.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.major.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCountry =
      filters.country === "" ||
      filters.country === "All Countries" ||
      student.country === filters.country;
    const matchesUniversity =
      filters.university === "" ||
      filters.university === "All Universities" ||
      student.university === filters.university;
    const matchesInterests =
      filters.interests === "" ||
      student.interests.some((interest) =>
        interest.toLowerCase().includes(filters.interests.toLowerCase())
      );

    return (
      matchesSearch && matchesCountry && matchesUniversity && matchesInterests
    );
  });

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: "#1a1a1a", mb: 0.5 }}>
          Connect with Students
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Discover and connect with fellow international students around the world.
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Paper elevation={1} sx={{ p: 3, mb: 3.5, borderRadius: "12px", border: "1px solid #e0e0e0" }}>
        <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
          <TextField
            placeholder="Search by name, university, or major..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <Search sx={{ mr: 1, color: "text.secondary" }} />
              ),
            }}
            sx={{
              flexGrow: 1,
              minWidth: 300,
              "& .MuiOutlinedInput-root": {
                borderRadius: "24px",
                backgroundColor: "#f5f5f5",
                border: "none",
                "& fieldset": { border: "none" },
                "&:hover": { backgroundColor: "#f0f0f0" },
                "&.Mui-focused": {
                  backgroundColor: "white",
                  "& fieldset": { border: "2px solid #667eea" },
                },
              },
            }}
          />
          <Button
            variant={showFilters ? "contained" : "outlined"}
            startIcon={<FilterList />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ borderRadius: "24px", textTransform: "none" }}
          >
            Filters
          </Button>
        </Box>

        {showFilters && (
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              pt: 2,
              borderTop: "1px solid #e0e0e0",
            }}
          >
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Country</InputLabel>
              <Select
                value={filters.country}
                label="Country"
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, country: e.target.value }))
                }
              >
                {countries.map((country) => (
                  <MenuItem key={country} value={country}>
                    {country}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>University</InputLabel>
              <Select
                value={filters.university}
                label="University"
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    university: e.target.value,
                  }))
                }
              >
                {universities.map((university) => (
                  <MenuItem key={university} value={university}>
                    {university}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              placeholder="Filter by interests..."
              value={filters.interests}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, interests: e.target.value }))
              }
              sx={{ minWidth: 200 }}
            />
          </Box>
        )}
      </Paper>

      {/* Results Count */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontWeight: 500 }}>
        {filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""} found
      </Typography>

      {/* Student Cards */}
      <Grid container spacing={2.5}>
        {filteredStudents.map((student) => (
          <Grid item xs={12} sm={6} lg={4} key={student.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s ease",
                borderRadius: "12px",
                border: "1px solid #e0e0e0",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 12px 24px rgba(0, 0, 0, 0.08)",
                  borderColor: "#667eea",
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2.5 }}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      mr: 2,
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      fontWeight: "bold",
                      fontSize: "1.2rem",
                    }}
                  >
                    {student.firstName[0]}
                    {student.lastName[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="600" sx={{ color: "#1a1a1a" }}>
                      {student.firstName} {student.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                      {student.major} • {student.year}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 0.5 }}>
                  <School
                    sx={{ fontSize: 16, color: "#667eea", flexShrink: 0 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                    {student.university}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", mb: 2.5, gap: 0.5 }}>
                  <LocationOn
                    sx={{ fontSize: 16, color: "#667eea", flexShrink: 0 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                    {student.country}
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    mb: 2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    color: "#555",
                    fontSize: "0.85rem",
                    lineHeight: 1.4,
                  }}
                >
                  {student.bio}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    gutterBottom
                    display="block"
                    sx={{ fontWeight: 500, mb: 0.75 }}
                  >
                    Interests
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {student.interests.slice(0, 3).map((interest, index) => (
                      <Chip
                        key={index}
                        label={interest}
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: "16px", height: 24 }}
                      />
                    ))}
                    {student.interests.length > 3 && (
                      <Chip
                        label={`+${student.interests.length - 3}`}
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: "16px", height: 24 }}
                      />
                    )}
                  </Box>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    gutterBottom
                    display="block"
                    sx={{ fontWeight: 500, mb: 0.75 }}
                  >
                    Languages
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {student.languages.map((language, index) => (
                      <Chip
                        key={index}
                        label={language}
                        size="small"
                        sx={{
                          borderRadius: "16px",
                          height: 24,
                          backgroundColor: "#667eea15",
                          color: "#667eea",
                          border: "1px solid #667eea30",
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </CardContent>

              <CardActions
                sx={{ justifyContent: "space-between", px: 2, pb: 2, pt: 0, gap: 1 }}
              >
                <Button
                  size="small"
                  onClick={() => handleViewProfile(student)}
                  sx={{ textTransform: "none", color: "#667eea" }}
                >
                  View Profile
                </Button>
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleMessage(student.id)}
                    sx={{ color: "#667eea" }}
                    title="Message"
                  >
                    <Message sx={{ fontSize: 20 }} />
                  </IconButton>
                  <Button
                    size="small"
                    variant={student.isConnected ? "outlined" : "contained"}
                    startIcon={<PersonAdd sx={{ fontSize: 18 }} />}
                    onClick={() => handleConnect(student.id)}
                    disabled={student.isConnected}
                    sx={{ borderRadius: "16px", textTransform: "none" }}
                  >
                    {student.isConnected ? "Connected" : "Connect"}
                  </Button>
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Profile Dialog */}
      <Dialog
        open={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: "12px" } }}
      >
        {selectedProfile && (
          <>
            <DialogTitle sx={{ pb: 1, borderBottom: "1px solid #e0e0e0" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6" fontWeight="600" sx={{ color: "#1a1a1a" }}>
                  {selectedProfile.firstName} {selectedProfile.lastName}
                </Typography>
                <IconButton onClick={() => setSelectedProfile(null)} size="small">
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", mb: 3.5 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mr: 3,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    fontWeight: "bold",
                    fontSize: "1.8rem",
                  }}
                >
                  {selectedProfile.firstName[0]}
                  {selectedProfile.lastName[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="600" sx={{ color: "#1a1a1a" }}>
                    {selectedProfile.firstName} {selectedProfile.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    {selectedProfile.major} • {selectedProfile.year}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 0.5 }}>
                    <School
                      sx={{ fontSize: 18, color: "#667eea" }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {selectedProfile.university}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <LocationOn
                      sx={{ fontSize: 18, color: "#667eea" }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {selectedProfile.country}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 2.5 }} />

              <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ color: "#1a1a1a" }}>
                About
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6 }}>
                {selectedProfile.bio}
              </Typography>

              <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ color: "#1a1a1a" }}>
                Interests
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                {selectedProfile.interests.map((interest, index) => (
                  <Chip
                    key={index}
                    label={interest}
                    variant="outlined"
                    sx={{ borderRadius: "16px", height: 28 }}
                  />
                ))}
              </Box>

              <Typography
                variant="subtitle2"
                fontWeight="600"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", color: "#1a1a1a" }}
              >
                <Language sx={{ mr: 1, fontSize: 20 }} />
                Languages
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {selectedProfile.languages.map((language, index) => (
                  <Chip
                    key={index}
                    label={language}
                    sx={{
                      borderRadius: "16px",
                      height: 28,
                      backgroundColor: "#667eea15",
                      color: "#667eea",
                      border: "1px solid #667eea30",
                    }}
                  />
                ))}
              </Box>
            </DialogContent>
            <DialogActions sx={{ pt: 2, borderTop: "1px solid #e0e0e0", gap: 1 }}>
              <Button
                onClick={() => handleMessage(selectedProfile.id)}
                startIcon={<Message />}
                sx={{ textTransform: "none" }}
              >
                Message
              </Button>
              <Button
                variant="contained"
                onClick={() => handleConnect(selectedProfile.id)}
                startIcon={<PersonAdd />}
                disabled={selectedProfile.isConnected}
                sx={{ borderRadius: "8px", textTransform: "none" }}
              >
                {selectedProfile.isConnected ? "Connected" : "Connect"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default Networking;
