import secureStorage from "../utils/secureStorage";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3001/api";

class ApiService {
  async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = secureStorage.getToken();

    // Don't set Content-Type for FormData - let browser handle it
    const isFormData = options.body instanceof FormData;

    const config = {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(!isFormData && { "Content-Type": "application/json" }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "An error occurred");
      }

      return data;
    } catch (error) {
      console.error("API Request failed:", error);
      throw error;
    }
  }

  // Authentication endpoints
  async register(userData) {
    return this.makeRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.makeRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async getCurrentUser() {
    return this.makeRequest("/auth/me");
  }

  async logout() {
    try {
      await this.makeRequest("/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Server logout error:", error);
      // Continue with client-side logout even if server fails
    }

    // Clear client-side data using secure storage
    secureStorage.clearAll();

    return { success: true, message: "Logged out successfully" };
  }

  async getProfile() {
    return this.makeRequest("/auth/profile");
  }

  // Health check
  async healthCheck() {
    return this.makeRequest("/health");
  }

  // Generic HTTP methods
  async get(endpoint) {
    return this.makeRequest(endpoint, {
      method: "GET",
    });
  }

  async post(endpoint, body) {
    return this.makeRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async put(endpoint, body) {
    return this.makeRequest(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  async patch(endpoint, body) {
    return this.makeRequest(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  async delete(endpoint) {
    return this.makeRequest(endpoint, {
      method: "DELETE",
    });
  }
}

export default new ApiService();
