import React, { createContext, useContext, useState, useEffect } from "react";
import apiService, { setGlobalToast } from "../services/enhancedApi";
import secureStorage from "../utils/secureStorage";
import { useToast } from "./ToastContext";

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

// Entity types
export const ENTITY_TYPES = {
  STUDENT: "student",
  MENTOR: "mentor",
  UNIVERSITY: "university",
};

// Entity-specific permissions and features
export const ENTITY_PERMISSIONS = {
  [ENTITY_TYPES.STUDENT]: {
    canApplyToJobs: true,
    canJoinEvents: true,
    canRequestMentorship: true,
    canAccessResources: true,
    canChat: true,
    canViewProfiles: true,
    dashboard: "/student-dashboard",
  },
  [ENTITY_TYPES.MENTOR]: {
    canOfferMentorship: true,
    canCreateEvents: true,
    canPostJobs: false,
    canAccessResources: true,
    canChat: true,
    canViewProfiles: true,
    canManageAvailability: true,
    dashboard: "/mentor-dashboard",
  },
  [ENTITY_TYPES.UNIVERSITY]: {
    canPostJobs: true,
    canCreateEvents: true,
    canManageStudents: true,
    canPostAnnouncements: true,
    canAccessAnalytics: true,
    canChat: true,
    canViewProfiles: true,
    dashboard: "/university-dashboard",
  },
};

export const UserProvider = ({ children }) => {
  const toast = useToast();

  const [user, setUser] = useState(() => {
    return secureStorage.getUser();
  });

  const [token, setToken] = useState(() => {
    return secureStorage.getToken();
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return secureStorage.isAuthenticated();
  });

  // Set global toast for API service
  useEffect(() => {
    setGlobalToast(toast);
  }, [toast]);

  useEffect(() => {
    if (user && token) {
      secureStorage.setUser(user);
      secureStorage.setToken(token);
      setIsAuthenticated(true);
    } else {
      secureStorage.clearAll();
      setIsAuthenticated(false);
    }
  }, [user, token]);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
  };

  const logout = async () => {
    try {
      await apiService.logout();
      setUser(null);
      setToken(null);
      secureStorage.clearAll();
      return { success: true, message: "Logged out successfully" };
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout even if API call fails
      setUser(null);
      setToken(null);
      secureStorage.clearAll();
      return { success: true, message: "Logged out successfully" };
    }
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  const hasPermission = (permission) => {
    if (!user || !user.entityType) return false;
    return ENTITY_PERMISSIONS[user.entityType]?.[permission] || false;
  };

  const getEntityDisplayName = (entityType) => {
    switch (entityType) {
      case ENTITY_TYPES.STUDENT:
        return "Student";
      case ENTITY_TYPES.MENTOR:
        return "Mentor";
      case ENTITY_TYPES.UNIVERSITY:
        return "University";
      default:
        return "User";
    }
  };

  const getEntityIcon = (entityType) => {
    switch (entityType) {
      case ENTITY_TYPES.STUDENT:
        return "🎓";
      case ENTITY_TYPES.MENTOR:
        return "👩‍🏫";
      case ENTITY_TYPES.UNIVERSITY:
        return "🏛️";
      default:
        return "👤";
    }
  };

  const value = {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    updateUser,
    hasPermission,
    getEntityDisplayName,
    getEntityIcon,
    entityTypes: ENTITY_TYPES,
    permissions: ENTITY_PERMISSIONS,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
