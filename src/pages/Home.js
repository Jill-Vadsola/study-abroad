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

      {/* Stats Section */}
      <Box sx={{ mb: 8 }}>
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  textAlign: "center",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {stat.number}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Features Section */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          gutterBottom
          sx={{ mb: 6, fontWeight: "bold" }}
        >
          Everything You Need to Succeed
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: "center", p: 3 }}>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography
                    variant="h6"
                    component="h3"
                    gutterBottom
                    fontWeight="bold"
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "center", pb: 3 }}>
                  <Button
                    variant="contained"
                    onClick={feature.action}
                    startIcon={<TrendingUp />}
                  >
                    {feature.buttonText}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Call to Action */}
      <Box
        sx={{
          textAlign: "center",
          py: 6,
          backgroundColor: "primary.main",
          color: "white",
          borderRadius: 3,
          mb: 4,
        }}
      >
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Ready to Start Your Journey?
        </Typography>
        <Typography variant="h6" paragraph sx={{ opacity: 0.9 }}>
          Join thousands of international students already connected on
          StudyConnect
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate("/register")}
          sx={{
            backgroundColor: "white",
            color: "primary.main",
            px: 4,
            py: 1.5,
            "&:hover": {
              backgroundColor: "grey.100",
            },
          }}
        >
          Join Now - It's Free!
        </Button>
      </Box>
    </Container>
  );
};

export default Home;
