import secureStorage from "../utils/secureStorage";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3001/api";

class JobsApiService {
  async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}/jobs${endpoint}`;
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
      console.error("Jobs API Request failed:", error);
      throw error;
    }
  }

  // Get all jobs with filters and pagination
  async getAllJobs(
    page = 1,
    limit = 10,
    filters = {}
  ) {
    let endpoint = `?page=${page}&limit=${limit}`;
    if (filters.jobType) endpoint += `&jobType=${filters.jobType}`;
    if (filters.workType) endpoint += `&workType=${filters.workType}`;
    if (filters.experienceLevel)
      endpoint += `&experienceLevel=${filters.experienceLevel}`;
    if (filters.location) endpoint += `&location=${filters.location}`;
    if (filters.search) endpoint += `&search=${filters.search}`;

    return this.makeRequest(endpoint, { method: "GET" });
  }

  // Get recent jobs
  async getRecentJobs(limit = 5) {
    return this.makeRequest(`/recent?limit=${limit}`, { method: "GET" });
  }

  // Get jobs that sponsor visas
  async getVisaSponsorJobs(limit = 10) {
    return this.makeRequest(`/visa-sponsors?limit=${limit}`, { method: "GET" });
  }

  // Get jobs by type
  async getJobsByType(type, limit = 10) {
    return this.makeRequest(`/type/${type}?limit=${limit}`, { method: "GET" });
  }

  // Search jobs
  async searchJobs(query, limit = 10) {
    return this.makeRequest(`/search/${query}?limit=${limit}`, {
      method: "GET",
    });
  }

  // Get job details
  async getJobById(jobId) {
    return this.makeRequest(`/${jobId}`, { method: "GET" });
  }

  // Get user's job applications
  async getUserJobApplications() {
    return this.makeRequest(`/my-applications`, { method: "GET" });
  }

  // Create new job (admin only)
  async createJob(jobData) {
    return this.makeRequest("", {
      method: "POST",
      body: JSON.stringify(jobData),
    });
  }

  // Update job (admin only)
  async updateJob(jobId, updateData) {
    return this.makeRequest(`/${jobId}`, {
      method: "PATCH",
      body: JSON.stringify(updateData),
    });
  }

  // Delete job (admin only)
  async deleteJob(jobId) {
    return this.makeRequest(`/${jobId}`, { method: "DELETE" });
  }

  // Apply for a job
  async applyForJob(jobId, applicationData = {}) {
    return this.makeRequest(`/${jobId}/apply`, {
      method: "POST",
      body: JSON.stringify(applicationData),
    });
  }
}

export default new JobsApiService();
