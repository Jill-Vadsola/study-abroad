import secureStorage from "../utils/secureStorage";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3001/api";

// Global toast instance will be set by UserContext
let globalToast = null;

export const setGlobalToast = (toastInstance) => {
  globalToast = toastInstance;
};

class ApiService {
  async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = secureStorage.getToken();

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Handle different content types
      let data;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (!response.ok) {
        const errorMessage =
          data.message ||
          data.error ||
          `HTTP ${response.status}: ${response.statusText}`;

        // Show global error toast
        if (globalToast && !options.suppressErrorToast) {
          globalToast.showError(errorMessage, "API Error");
        }

        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      // Show success toast for certain operations
      if (options.showSuccessToast && globalToast) {
        globalToast.showSuccess(
          options.successMessage || "Operation completed successfully"
        );
      }

      return data;
    } catch (error) {
      console.error("API Request failed:", error);

      // Handle network errors
      if (!error.status) {
        const networkErrorMessage =
          "Network error. Please check your connection and try again.";

        if (globalToast && !options.suppressErrorToast) {
          globalToast.showError(networkErrorMessage, "Connection Error");
        }

        error.message = networkErrorMessage;
      }

      throw error;
    }
  }

  // Authentication endpoints
  async register(userData) {
    return this.makeRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
      showSuccessToast: true,
      successMessage: "Account created successfully! Welcome to StudyConnect!",
    });
  }

  async login(credentials) {
    return this.makeRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
      showSuccessToast: true,
      successMessage: "Welcome back! Login successful.",
    });
  }

  async logout() {
    try {
      await this.makeRequest("/auth/logout", {
        method: "POST",
        suppressErrorToast: true, // Handle logout errors gracefully
      });
    } catch (error) {
      console.error("Server logout error:", error);
      // Continue with client-side logout even if server fails
    }

    // Clear client-side data using secure storage
    secureStorage.clearAll();

    // Show success message
    if (globalToast) {
      globalToast.showSuccess("Logged out successfully", "Goodbye!");
    }

    return { success: true, message: "Logged out successfully" };
  }

  async getCurrentUser() {
    return this.makeRequest("/auth/me", {
      suppressErrorToast: true, // Don't show error for auth checks
    });
  }

  async getProfile() {
    return this.makeRequest("/auth/profile");
  }

  // Health check
  async healthCheck() {
    return this.makeRequest("/health", {
      suppressErrorToast: true,
    });
  }

  // Generic CRUD operations with toast support
  async get(endpoint, options = {}) {
    return this.makeRequest(endpoint, {
      method: "GET",
      ...options,
    });
  }

  async post(endpoint, data, options = {}) {
    return this.makeRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
      ...options,
    });
  }

  async put(endpoint, data, options = {}) {
    return this.makeRequest(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
      ...options,
    });
  }

  async delete(endpoint, options = {}) {
    return this.makeRequest(endpoint, {
      method: "DELETE",
      ...options,
    });
  }
}

export default new ApiService();
