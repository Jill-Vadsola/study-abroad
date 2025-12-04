import secureStorage from "../utils/secureStorage";

const API_BASE_URL = "http://localhost:3001/api";

class ConnectionsApi {
  // Get auth token from secure storage
  getAuthToken() {
    return secureStorage.getToken();
  }

  // Get auth headers
  getAuthHeaders() {
    const token = this.getAuthToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Send connection request
  async sendConnectionRequest(toUserId, message = "", metadata = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/connections/request`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          toUserId,
          message,
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error sending connection request:", error);
      throw error;
    }
  }

  // Get user's connections
  async getUserConnections(status = null) {
    try {
      const url = new URL(`${API_BASE_URL}/connections`);
      if (status) {
        url.searchParams.append("status", status);
      }

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching connections:", error);
      throw error;
    }
  }

  // Get pending requests received by user
  async getPendingRequests() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/connections/requests/received`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      throw error;
    }
  }

  // Get requests sent by user
  async getSentRequests() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/connections/requests/sent`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching sent requests:", error);
      throw error;
    }
  }

  // Get potential connections (recommendations)
  async getPotentialConnections(entityType = null, limit = 10) {
    try {
      const url = new URL(`${API_BASE_URL}/connections/potential`);
      if (entityType) {
        url.searchParams.append("entityType", entityType);
      }
      url.searchParams.append("limit", limit.toString());

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching potential connections:", error);
      throw error;
    }
  }

  // Get connection statistics
  async getConnectionStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/connections/stats`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching connection stats:", error);
      throw error;
    }
  }

  // Accept connection request
  async acceptConnection(connectionId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/connections/${connectionId}/accept`,
        {
          method: "PUT",
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error accepting connection:", error);
      throw error;
    }
  }

  // Reject connection request
  async rejectConnection(connectionId, reason = "") {
    try {
      const response = await fetch(
        `${API_BASE_URL}/connections/${connectionId}/reject`,
        {
          method: "PUT",
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error rejecting connection:", error);
      throw error;
    }
  }

  // Cancel sent connection request
  async cancelConnection(connectionId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/connections/${connectionId}/cancel`,
        {
          method: "DELETE",
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error cancelling connection:", error);
      throw error;
    }
  }

  // Block connection
  async blockConnection(connectionId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/connections/${connectionId}/block`,
        {
          method: "PUT",
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error blocking connection:", error);
      throw error;
    }
  }

  // Remove connection
  async removeConnection(connectionId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/connections/${connectionId}`,
        {
          method: "DELETE",
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error removing connection:", error);
      throw error;
    }
  }

  // ============== MENTORSHIP PAYMENT ENDPOINTS ==============

  // Apply for mentorship (with payment pre-authorization if paid)
  async applyForMentorship(toUserId, message, goals = "", availability = "") {
    try {
      const response = await fetch(
        `${API_BASE_URL}/connections/mentorship/apply`,
        {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify({
            toUserId,
            message,
            goals,
            availability,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error applying for mentorship:", error);
      throw error;
    }
  }

  // Accept mentorship request (mentor accepts and confirms payment if paid)
  async acceptMentorshipRequest(connectionId, paymentMethodId = null) {
    try {
      const body = {};
      if (paymentMethodId) {
        body.paymentMethodId = paymentMethodId;
      }

      const response = await fetch(
        `${API_BASE_URL}/connections/${connectionId}/accept-mentorship`,
        {
          method: "PUT",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error accepting mentorship request:", error);
      throw error;
    }
  }

  // Reject mentorship request (mentor rejects and cancels payment intent if paid)
  async rejectMentorshipRequest(connectionId, reason = "") {
    try {
      const response = await fetch(
        `${API_BASE_URL}/connections/${connectionId}/reject-mentorship`,
        {
          method: "PUT",
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error rejecting mentorship request:", error);
      throw error;
    }
  }

  // Request refund for paid mentorship (within 30 days)
  async requestRefundForMentorship(connectionId, reason) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/connections/${connectionId}/refund`,
        {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error requesting refund:", error);
      throw error;
    }
  }

  // Get mentorship payment details
  async getMentorshipPaymentDetails(connectionId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/connections/${connectionId}/payment-details`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching payment details:", error);
      throw error;
    }
  }
}

export const connectionsApi = new ConnectionsApi();
