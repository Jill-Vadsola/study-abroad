import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import { CustomThemeProvider } from "./contexts/ThemeContext";
import { UserProvider } from "./contexts/UserContext";
import { ToastProvider } from "./contexts/ToastContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Resources from "./pages/Resources";
import Events from "./pages/Events";
import Jobs from "./pages/Jobs";
import Chat from "./pages/Chat";
import StudentDashboard from "./pages/StudentDashboard";
import MentorDashboard from "./pages/MentorDashboard";
import UniversityDashboard from "./pages/UniversityDashboard";
import Feed from "./pages/Feed";
import Activity from "./pages/Activity";
import Connections from "./components/Connections";

function App() {
  return (
    <CustomThemeProvider>
      <ToastProvider>
        <UserProvider>
          <Router>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
              }}
            >
              <Navbar />
              <Box component="main" sx={{ flexGrow: 1, pt: 2 }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />

                  {/* Protected Routes */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/connections"
                    element={
                      <ProtectedRoute>
                        <Connections />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/feed"
                    element={
                      <ProtectedRoute>
                        <Feed />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/activity"
                    element={
                      <ProtectedRoute>
                        <Activity />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/resources"
                    element={
                      <ProtectedRoute>
                        <Resources />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/events"
                    element={
                      <ProtectedRoute>
                        <Events />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/jobs"
                    element={
                      <ProtectedRoute>
                        <Jobs />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/chat"
                    element={
                      <ProtectedRoute>
                        <Chat />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student-dashboard"
                    element={
                      <ProtectedRoute>
                        <StudentDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/mentor-dashboard"
                    element={
                      <ProtectedRoute>
                        <MentorDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/university-dashboard"
                    element={
                      <ProtectedRoute>
                        <UniversityDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch-all route for undefined paths */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Box>
            </Box>
          </Router>
        </UserProvider>
      </ToastProvider>
    </CustomThemeProvider>
  );
}

export default App;
