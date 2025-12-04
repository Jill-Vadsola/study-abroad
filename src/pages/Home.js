import React from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  useTheme,
  Paper,
} from "@mui/material";
import {
  School,
  People,
  Event,
  Work,
  Chat,
  MenuBook,
  TrendingUp,
  Language,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const features = [
    {
      icon: <People fontSize="large" color="primary" />,
      title: "Connect with Students",
      description:
        "Find and connect with fellow international students from your university or country.",
      action: () => navigate("/networking"),
      buttonText: "Start Networking",
    },
    {
      icon: <MenuBook fontSize="large" color="primary" />,
      title: "Resource Guides",
      description:
        "Access curated guides for scholarships, visa regulations, and local living information.",
      action: () => navigate("/resources"),
      buttonText: "Browse Resources",
    },
    {
      icon: <Event fontSize="large" color="primary" />,
      title: "Events & Webinars",
      description:
        "Stay updated with upcoming events, webinars, and important deadlines.",
      action: () => navigate("/events"),
      buttonText: "View Events",
    },
    {
      icon: <Work fontSize="large" color="primary" />,
      title: "Job Opportunities",
      description:
        "Discover job and internship opportunities in your host country.",
      action: () => navigate("/jobs"),
      buttonText: "Find Jobs",
    },
    {
      icon: <Chat fontSize="large" color="primary" />,
      title: "Real-time Chat",
      description:
        "Connect instantly with other students through our messaging platform.",
      action: () => navigate("/chat"),
      buttonText: "Start Chatting",
    },
    {
      icon: <Language fontSize="large" color="primary" />,
      title: "Global Community",
      description:
        "Join a diverse community of international students from around the world.",
      action: () => navigate("/networking"),
      buttonText: "Join Community",
    },
  ];

  const stats = [
    { number: "10,000+", label: "Students Connected" },
    { number: "50+", label: "Countries Represented" },
    { number: "500+", label: "Universities" },
    { number: "1,000+", label: "Success Stories" },
  ];

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box
        sx={{
          textAlign: "center",
          py: { xs: 6, md: 10 },
          background: `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.secondary.light}20)`,
          borderRadius: 3,
          mb: 6,
        }}
      >
        <School sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: "bold",
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 3,
          }}
        >
          Welcome to StudyConnect
        </Typography>
        <Typography
          variant="h5"
          color="text.secondary"
          paragraph
          sx={{ maxWidth: 600, mx: "auto", mb: 4 }}
        >
          Your gateway to connecting with fellow international students,
          accessing resources, and building a successful academic journey
          abroad.
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/register")}
            sx={{ px: 4, py: 1.5 }}
          >
            Get Started
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate("/networking")}
            sx={{ px: 4, py: 1.5 }}
          >
            Explore Network
          </Button>
        </Box>
      </Box>

    </Container>
  );
};

export default Home;
