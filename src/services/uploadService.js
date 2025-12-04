import secureStorage from "../utils/secureStorage";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3001/api";

class UploadService {
  async uploadImage(file) {
    try {
      if (!file) {
        throw new Error("No file provided");
      }

      const token = secureStorage.getToken();
      const formData = new FormData();
      formData.append("file", file);

      const config = {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      };

      const response = await fetch(`${API_BASE_URL}/upload`, config);

      // Check if endpoint exists
      if (response.status === 404) {
        console.warn("Upload endpoint not implemented at /api/upload. Image upload skipped.");
        return { url: null, skipped: true };
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      return data; // Should return { url: "..." }
    } catch (error) {
      console.warn("Image upload failed, continuing without image:", error.message);
      // Return null URL to skip image upload without blocking the main operation
      return { url: null, error: error.message };
    }
  }

  async uploadMultiple(files) {
    try {
      const uploadPromises = files.map((file) => this.uploadImage(file));
      const results = await Promise.all(uploadPromises);
      // Filter out failed uploads, return only successful ones
      return results
        .filter((result) => result.url)
        .map((result) => result.url);
    } catch (error) {
      console.warn("Multiple upload had issues, continuing with available files:", error);
      return [];
    }
  }
}

export default new UploadService();
