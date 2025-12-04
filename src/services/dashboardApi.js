import ApiService from "./enhancedApi";

class DashboardApiService {
  // Student Dashboard APIs
  async getStudentDashboard() {
    return ApiService.makeRequest("/dashboard/student", {
      method: "GET",
    });
  }

  async getStudentConnections() {
    return ApiService.makeRequest("/dashboard/student/connections", {
      method: "GET",
    });
  }

  async getStudentRecommendations() {
    return ApiService.makeRequest("/dashboard/student/recommendations", {
      method: "GET",
    });
  }

  async getStudentActivity() {
    return ApiService.makeRequest("/dashboard/student/activity", {
      method: "GET",
    });
  }

  // Mentor Dashboard APIs
  async getMentorDashboard() {
    return ApiService.makeRequest("/dashboard/mentor", {
      method: "GET",
    });
  }

  async getMentorMentees() {
    return ApiService.makeRequest("/dashboard/mentor/mentees", {
      method: "GET",
    });
  }

  async getMentorRequests() {
    return ApiService.makeRequest("/dashboard/mentor/requests", {
      method: "GET",
    });
  }

  async getMentorStats() {
    return ApiService.makeRequest("/dashboard/mentor/stats", {
      method: "GET",
    });
  }

  async acceptMentorshipRequest(connectionId) {
    return ApiService.makeRequest(`/connections/${connectionId}/accept`, {
      method: "PUT",
      showSuccessToast: true,
      successMessage: "Mentorship request accepted successfully!",
    });
  }

  async rejectMentorshipRequest(requestId) {
    return ApiService.makeRequest(
      `/dashboard/mentor/requests/${requestId}/reject`,
      {
        method: "POST",
        showSuccessToast: true,
        successMessage: "Mentorship request declined",
      }
    );
  }

  // University Dashboard APIs
  async getUniversityDashboard() {
    return ApiService.makeRequest("/dashboard/university", {
      method: "GET",
    });
  }

  async getUniversityStudents() {
    return ApiService.makeRequest("/dashboard/university/students", {
      method: "GET",
    });
  }

  async getUniversityApplications() {
    return ApiService.makeRequest("/dashboard/university/applications", {
      method: "GET",
    });
  }

  async getUniversityStats() {
    return ApiService.makeRequest("/dashboard/university/stats", {
      method: "GET",
    });
  }

  async acceptApplication(applicationId) {
    return ApiService.makeRequest(
      `/dashboard/university/applications/${applicationId}/accept`,
      {
        method: "POST",
        showSuccessToast: true,
        successMessage: "Application accepted successfully!",
      }
    );
  }

  async rejectApplication(applicationId) {
    return ApiService.makeRequest(
      `/dashboard/university/applications/${applicationId}/reject`,
      {
        method: "POST",
        showSuccessToast: true,
        successMessage: "Application declined",
      }
    );
  }

  // Common APIs for all dashboards
  async sendConnectionRequest(entityId, entityType) {
    return ApiService.makeRequest("/connections/request", {
      method: "POST",
      body: JSON.stringify({ entityId, entityType }),
      showSuccessToast: true,
      successMessage: `Connection request sent to ${entityType}!`,
    });
  }

  async updateAvailability(available) {
    return ApiService.makeRequest("/profile/availability", {
      method: "PUT",
      body: JSON.stringify({ available }),
      showSuccessToast: true,
      successMessage: `Availability status updated to ${
        available ? "Available" : "Unavailable"
      }`,
    });
  }

  // University Action APIs
  async acceptApplication(applicationId) {
    return ApiService.makeRequest(
      `/dashboard/university/applications/${applicationId}/accept`,
      {
        method: "POST",
        showSuccessToast: true,
        successMessage: "Application accepted successfully!",
      }
    );
  }

  async rejectApplication(applicationId) {
    return ApiService.makeRequest(
      `/dashboard/university/applications/${applicationId}/reject`,
      {
        method: "POST",
        showSuccessToast: true,
        successMessage: "Application declined",
      }
    );
  }

  // Mentor Action APIs
  async acceptMentorshipRequest(requestId) {
    return ApiService.makeRequest(
      `/dashboard/mentor/requests/${requestId}/accept`,
      {
        method: "POST",
        showSuccessToast: true,
        successMessage: "Mentorship request accepted successfully!",
      }
    );
  }

  async rejectMentorshipRequest(requestId) {
    return ApiService.makeRequest(
      `/dashboard/mentor/requests/${requestId}/reject`,
      {
        method: "POST",
        showSuccessToast: true,
        successMessage: "Mentorship request declined",
      }
    );
  }

  async updateMentorAvailability(available) {
    return ApiService.makeRequest("/dashboard/mentor/availability", {
      method: "PUT",
      body: JSON.stringify({ available }),
      showSuccessToast: true,
      successMessage: `Availability status updated to ${
        available ? "Available" : "Unavailable"
      }`,
    });
  }

  // Connection Management APIs
  async sendConnectionRequest(entityId, entityType) {
    return ApiService.makeRequest(
      `/dashboard/connect/${entityId}/${entityType}`,
      {
        method: "POST",
        showSuccessToast: true,
        successMessage: `Connection request sent to ${entityType}!`,
      }
    );
  }

  async updateAcceptingStudents(accepting) {
    return ApiService.makeRequest("/dashboard/university/accepting-students", {
      method: "PUT",
      body: JSON.stringify({ accepting }),
      showSuccessToast: true,
      successMessage: `Application status updated to ${
        accepting ? "Accepting" : "Not Accepting"
      } students`,
    });
  }

  async updateProfile(profileData) {
    return ApiService.makeRequest("/dashboard/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
      showSuccessToast: true,
      successMessage: "Profile updated successfully!",
    });
  }
}

// Create and export a singleton instance
const dashboardApi = new DashboardApiService();
export default dashboardApi;
