import secureStorage from "../utils/secureStorage";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3001/api";

class ResourcesApiService {
  async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}/resources${endpoint}`;
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
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "An error occurred");
      }

      return data;
    } catch (error) {
      console.error("Resources API Request failed:", error);
      throw error;
    }
  }

  // Get all resources with pagination and filters
  async getAllResources(page = 1, limit = 10, category = null, search = null) {
    let endpoint = `?page=${page}&limit=${limit}`;
    if (category) endpoint += `&category=${category}`;
    if (search) endpoint += `&search=${search}`;

    return this.makeRequest(endpoint, { method: "GET" });
  }

  // Get popular resources
  async getPopularResources(limit = 5) {
    return this.makeRequest(`/popular?limit=${limit}`, { method: "GET" });
  }

  // Get latest resources
  async getLatestResources(limit = 5) {
    return this.makeRequest(`/latest?limit=${limit}`, { method: "GET" });
  }

  // Get resources by category
  async getResourcesByCategory(category, limit = 10) {
    return this.makeRequest(`/category/${category}?limit=${limit}`, {
      method: "GET",
    });
  }

  // Search resources
  async searchResources(query, limit = 10) {
    return this.makeRequest(`/search/${query}?limit=${limit}`, {
      method: "GET",
    });
  }

  // Get resource statistics
  async getResourceStats() {
    return this.makeRequest(`/stats`, { method: "GET" });
  }

  // Get resource details
  async getResourceById(resourceId) {
    return this.makeRequest(`/${resourceId}`, { method: "GET" });
  }

  // Create new resource (admin only)
  async createResource(resourceData) {
    return this.makeRequest("", {
      method: "POST",
      body: JSON.stringify(resourceData),
    });
  }

  // Update resource (admin only)
  async updateResource(resourceId, updateData) {
    return this.makeRequest(`/${resourceId}`, {
      method: "PATCH",
      body: JSON.stringify(updateData),
    });
  }

  // Delete resource (admin only)
  async deleteResource(resourceId) {
    return this.makeRequest(`/${resourceId}`, { method: "DELETE" });
  }

  // Like/unlike a resource
  async likeResource(resourceId) {
    return this.makeRequest(`/${resourceId}/like`, { method: "POST" });
  }
}

export default new ResourcesApiService();
