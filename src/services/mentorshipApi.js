import ApiService from "./enhancedApi";

/**
 * Mentorship API Service
 *
 * Handles all mentorship-related API calls:
 * - Apply for mentorship
 * - Get pending applications
 * - Get active mentorships
 * - Accept/reject applications
 */

class MentorshipApiService {
  /**
   * Apply for mentorship with a mentor
   *
   * @param {string} mentorId - ID of the mentor
   * @param {string} message - Application message
   * @param {string} goals - Mentorship goals
   * @param {string} availability - Availability info
   * @param {number} mentorshipPrice - Price in cents
   * @param {string} paymentCurrency - Currency code
   * @returns {Promise} Application response with payment details if paid
   */
  async applyForMentorship(
    mentorId,
    message,
    goals,
    availability,
    mentorshipPrice,
    paymentCurrency
  ) {
    return ApiService.makeRequest("/mentorship/apply", {
      method: "POST",
      body: JSON.stringify({
        mentorId,
        applicationMessage: message,
        goals,
        availability,
        mentorshipPrice,
        paymentCurrency,
      }),
    });
  }

  /**
   * Get pending mentorship applications for current mentor
   *
   * @returns {Promise<Array>} Array of pending applications
   */
  async getPendingApplications() {
    return ApiService.makeRequest("/mentorship/pending-applications", {
      method: "GET",
    });
  }

  /**
   * Get active mentorships for current mentor
   *
   * @returns {Promise<Array>} Array of active mentees
   */
  async getActiveMentorships() {
    return ApiService.makeRequest("/mentorship/my-mentees", {
      method: "GET",
    });
  }

  /**
   * Get student's active and pending mentorships
   *
   * @returns {Promise<Array>} Array of mentorships
   */
  async getStudentMentorships() {
    return ApiService.makeRequest("/mentorship/my-mentors", {
      method: "GET",
    });
  }

  /**
   * Accept a mentorship application
   *
   * @param {string} mentorshipId - ID of the mentorship to accept
   * @returns {Promise} Response from server
   */
  async acceptMentorshipApplication(mentorshipId) {
    return ApiService.makeRequest(`/mentorship/${mentorshipId}/accept`, {
      method: "PUT",
      body: JSON.stringify({}),
    });
  }

  /**
   * Reject a mentorship application
   *
   * @param {string} mentorshipId - ID of the mentorship to reject
   * @param {string} rejectionReason - Reason for rejection (optional)
   * @returns {Promise} Response from server
   */
  async rejectMentorshipApplication(mentorshipId, rejectionReason) {
    return ApiService.makeRequest(`/mentorship/${mentorshipId}/reject`, {
      method: "PUT",
      body: JSON.stringify({
        rejectionReason,
      }),
    });
  }

  /**
   * Check if a mentorship application already exists
   *
   * @param {string} mentorId - ID of the mentor to check
   * @returns {Promise} Mentorship status or null if not exists
   */
  async getMentorshipStatus(mentorId) {
    return ApiService.makeRequest(`/mentorship/check-status/${mentorId}`, {
      method: "GET",
    });
  }

  /**
   * Get mentorship statistics for current mentor
   *
   * @returns {Promise} Statistics object with counts and earnings
   */
  async getMentorshipStats() {
    return ApiService.makeRequest("/mentorship/stats/mentor", {
      method: "GET",
    });
  }
}

// Create and export a singleton instance
const mentorshipApi = new MentorshipApiService();
export default mentorshipApi;
