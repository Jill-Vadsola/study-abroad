import secureStorage from "../utils/secureStorage";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3001/api";

class EventsApiService {
  async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}/events${endpoint}`;
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
      console.error("Events API Request failed:", error);
      throw error;
    }
  }

  // Get all events with pagination and filters
  async getAllEvents(page = 1, limit = 10, type = null, search = null) {
    let endpoint = `?page=${page}&limit=${limit}`;
    if (type) endpoint += `&type=${type}`;
    if (search) endpoint += `&search=${search}`;

    return this.makeRequest(endpoint, { method: "GET" });
  }

  // Get upcoming events
  async getUpcomingEvents(limit = 5) {
    return this.makeRequest(`/upcoming?limit=${limit}`, { method: "GET" });
  }

  // Get events by type
  async getEventsByType(type, limit = 10) {
    return this.makeRequest(`/type/${type}?limit=${limit}`, { method: "GET" });
  }

  // Get event details
  async getEventById(eventId) {
    return this.makeRequest(`/${eventId}`, { method: "GET" });
  }

  // Get user's event registrations
  async getUserEventRegistrations() {
    return this.makeRequest(`/my-registrations`, { method: "GET" });
  }

  // Create new event (admin only)
  async createEvent(eventData) {
    return this.makeRequest("", {
      method: "POST",
      body: JSON.stringify(eventData),
    });
  }

  // Update event (admin only)
  async updateEvent(eventId, updateData) {
    return this.makeRequest(`/${eventId}`, {
      method: "PATCH",
      body: JSON.stringify(updateData),
    });
  }

  // Delete event (admin only)
  async deleteEvent(eventId) {
    return this.makeRequest(`/${eventId}`, { method: "DELETE" });
  }

  // Register for an event
  async registerForEvent(eventId) {
    return this.makeRequest(`/${eventId}/register`, { method: "POST" });
  }

  // Unregister from an event
  async unregisterFromEvent(eventId) {
    return this.makeRequest(`/${eventId}/unregister`, { method: "POST" });
  }
}

export default new EventsApiService();
