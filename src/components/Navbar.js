import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme as useMuiTheme,
  Switch,
  FormControlLabel,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Brightness4,
  Brightness7,
  School,
  AccountCircle,
  Logout,
  Dashboard,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useUser } from "../contexts/UserContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, isAuthenticated, logout, getEntityDisplayName, getEntityIcon } =
    useUser();
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const menuItems = [
    { text: "Feed", path: "/feed" },
    { text: "Activity", path: "/activity" },
    { text: "Connections", path: "/connections" },
    { text: "Resources", path: "/resources" },
    { text: "Events", path: "/events" },
    { text: "Jobs", path: "/jobs" },
    { text: "Chat", path: "/chat" },
  ];

  const authItems = [
    { text: "Login", path: "/login" },
    { text: "Register", path: "/register" },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = async () => {
    try {
      handleUserMenuClose();
      // Navigate immediately before logout completes
      navigate("/", { replace: true });
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleDashboard = () => {
    handleUserMenuClose();
    if (user?.entityType) {
      const dashboardPath =
        user.entityType === "student"
          ? "/student-dashboard"
          : user.entityType === "mentor"
          ? "/mentor-dashboard"
          : user.entityType === "university"
          ? "/university-dashboard"
          : "/";
      navigate(dashboardPath);
    }
  };

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        <ListItem>
          <Box display="flex" alignItems="center" sx={{ py: 2 }}>
            <School sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" color="primary">
              StudyConnect
            </Typography>
          </Box>
        </ListItem>

        {/* User info in mobile drawer */}
        {isAuthenticated && user && (
          <>
            <ListItem>
              <Box display="flex" alignItems="center" gap={1} sx={{ py: 1 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                  {getEntityIcon(user.entityType)}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {user.name || user.email}
                  </Typography>
                  <Chip
                    label={getEntityDisplayName(user.entityType)}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </Box>
            </ListItem>
            <Divider />
          </>
        )}

        {/* Menu items - only show if authenticated */}
        {isAuthenticated &&
          menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton onClick={() => handleNavigation(item.path)}>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}

        {/* Auth items for mobile - only show if not authenticated */}
        {!isAuthenticated &&
          authItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton onClick={() => handleNavigation(item.path)}>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}

        {/* User actions for mobile */}
        {isAuthenticated && (
          <>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton onClick={handleDashboard}>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </>
        )}

        <ListItem>
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={toggleDarkMode}
                color="primary"
              />
            }
            label="Dark Mode"
          />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          {/* Logo and Title */}
          <Box display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
            <School sx={{ mr: 1, color: "primary.main" }} />
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: "bold",
                cursor: "pointer",
                color: "primary.main",
              }}
              onClick={() => navigate("/")}
            >
              StudyConnect
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box display="flex" alignItems="center" gap={2}>
              {/* Menu items - only show if authenticated */}
              {isAuthenticated &&
                menuItems.map((item) => (
                  <Button
                    key={item.text}
                    color="inherit"
                    onClick={() => navigate(item.path)}
                    sx={{ color: "text.primary" }}
                  >
                    {item.text}
                  </Button>
                ))}

              {/* User section - only show if authenticated */}
              {isAuthenticated && user ? (
                <Box display="flex" alignItems="center" gap={2} ml={2}>
                  <Chip
                    avatar={
                      <Avatar
                        sx={{ bgcolor: "primary.main", width: 24, height: 24 }}
                      >
                        {getEntityIcon(user.entityType)}
                      </Avatar>
                    }
                    label={getEntityDisplayName(user.entityType)}
                    variant="outlined"
                    size="small"
                    color="primary"
                  />

                  <IconButton
                    onClick={handleUserMenuOpen}
                    size="small"
                    sx={{ color: "text.primary" }}
                  >
                    <AccountCircle />
                  </IconButton>

                  <Menu
                    anchorEl={userMenuAnchor}
                    open={Boolean(userMenuAnchor)}
                    onClose={handleUserMenuClose}
                    onClick={handleUserMenuClose}
                    PaperProps={{
                      elevation: 0,
                      sx: {
                        overflow: "visible",
                        filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                        mt: 1.5,
                        "& .MuiAvatar-root": {
                          width: 32,
                          height: 32,
                          ml: -0.5,
                          mr: 1,
                        },
                      },
                    }}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  >
                    <MenuItem disabled>
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        {getEntityIcon(user.entityType)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {user.name || user.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getEntityDisplayName(user.entityType)}
                        </Typography>
                      </Box>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleDashboard}>
                      <Dashboard fontSize="small" sx={{ mr: 1 }} />
                      Dashboard
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <Logout fontSize="small" sx={{ mr: 1 }} />
                      Logout
                    </MenuItem>
                  </Menu>
                </Box>
              ) : (
                /* Auth Buttons - only show if not authenticated */
                <Box display="flex" gap={1} ml={2}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/login")}
                    size="small"
                  >
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => navigate("/register")}
                    size="small"
                  >
                    Register
                  </Button>
                </Box>
              )}

              {/* Theme Toggle */}
              <IconButton
                onClick={toggleDarkMode}
                color="inherit"
                sx={{ ml: 1 }}
              >
                {darkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Box>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;
