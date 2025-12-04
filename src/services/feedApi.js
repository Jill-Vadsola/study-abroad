import ApiService from './api';

class FeedApiService {
  // Get user's personalized feed
  async getFeed(page = 1, limit = 20) {
    return ApiService.makeRequest(`/feed?page=${page}&limit=${limit}`, {
      method: 'GET',
    });
  }

  // Create a new post
  async createPost(postData) {
    return ApiService.makeRequest('/feed/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
      successMessage: 'Post created successfully!',
      errorMessage: 'Failed to create post',
    });
  }

  // Get posts by a specific user
  async getUserPosts(userId, page = 1, limit = 20) {
    return ApiService.makeRequest(`/feed/user/${userId}?page=${page}&limit=${limit}`, {
      method: 'GET',
    });
  }

  // Like/Unlike a post
  async toggleLike(postId) {
    return ApiService.makeRequest(`/feed/posts/${postId}/like`, {
      method: 'PUT',
      successMessage: null, // Silent success
      errorMessage: 'Failed to update like',
    });
  }

  // Add comment to a post
  async addComment(postId, content) {
    return ApiService.makeRequest(`/feed/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
      successMessage: 'Comment added successfully!',
      errorMessage: 'Failed to add comment',
    });
  }

  // Share a post
  async sharePost(postId) {
    return ApiService.makeRequest(`/feed/posts/${postId}/share`, {
      method: 'POST',
      successMessage: 'Post shared successfully!',
      errorMessage: 'Failed to share post',
    });
  }

  // Get user's activity feed
  async getActivity(page = 1, limit = 50) {
    return ApiService.makeRequest(`/feed/activity?page=${page}&limit=${limit}`, {
      method: 'GET',
    });
  }

  // Log custom activity
  async logActivity(type, description, targetId = null, targetModel = null, metadata = {}) {
    return ApiService.makeRequest('/feed/activity/log', {
      method: 'POST',
      body: JSON.stringify({
        type,
        description,
        targetId,
        targetModel,
        metadata,
      }),
      successMessage: null, // Silent logging
      errorMessage: null,
    });
  }
}

export default new FeedApiService();