import ApiService from './api';

class ImageUploadService {
  // Upload profile image
  async uploadProfileImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    return ApiService.makeRequest('/uploads/profile', {
      method: 'POST',
      body: formData,
      successMessage: 'Profile image uploaded successfully!',
      errorMessage: 'Failed to upload profile image',
    });
  }

  // Upload post images (multiple)
  async uploadPostImages(files) {
    const formData = new FormData();

    // Add each file to FormData
    Array.from(files).forEach((file, index) => {
      formData.append('images', file);
    });

    return ApiService.makeRequest('/uploads/posts', {
      method: 'POST',
      body: formData,
      successMessage: `${files.length} image(s) uploaded successfully!`,
      errorMessage: 'Failed to upload images',
    });
  }

  // Upload single file
  async uploadFile(file, type = 'public') {
    const formData = new FormData();
    formData.append('file', file);

    return ApiService.makeRequest(`/uploads/file/${type}`, {
      method: 'POST',
      body: formData,
      successMessage: 'File uploaded successfully!',
      errorMessage: 'Failed to upload file',
    });
  }

  // Get file info
  async getFileInfo(fileUrl) {
    return ApiService.makeRequest(`/uploads/info?fileUrl=${encodeURIComponent(fileUrl)}`, {
      method: 'GET',
    });
  }

  // Delete file
  async deleteFile(fileUrl) {
    return ApiService.makeRequest('/uploads/file', {
      method: 'DELETE',
      body: JSON.stringify({ fileUrl }),
      headers: {
        'Content-Type': 'application/json',
      },
      successMessage: 'File deleted successfully!',
      errorMessage: 'Failed to delete file',
    });
  }

  // Get upload configuration
  async getUploadConfig() {
    return ApiService.makeRequest('/uploads/config', {
      method: 'GET',
    });
  }

  // Validate file on server
  async validateFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    return ApiService.makeRequest('/uploads/validate', {
      method: 'POST',
      body: formData,
    });
  }

  // Utility: Validate image file
  validateImageFile(file, maxSizeMB = 10) {
    const errors = [];

    // Check if file exists
    if (!file) {
      errors.push('No file selected');
      return errors;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      errors.push(`File size must be less than ${maxSizeMB}MB`);
    }

    return errors;
  }

  // Utility: Validate multiple image files
  validateImageFiles(files, maxSizeMB = 10, maxCount = 5) {
    const errors = [];

    if (!files || files.length === 0) {
      errors.push('No files selected');
      return errors;
    }

    if (files.length > maxCount) {
      errors.push(`Maximum ${maxCount} files allowed`);
    }

    Array.from(files).forEach((file, index) => {
      const fileErrors = this.validateImageFile(file, maxSizeMB);
      fileErrors.forEach(error => {
        errors.push(`File ${index + 1}: ${error}`);
      });
    });

    return errors;
  }

  // Utility: Create image preview
  createImagePreview(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  // Utility: Resize image before upload (using Canvas)
  async resizeImage(file, maxWidth = 1200, maxHeight = 800, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and resize image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            // Create new file with resized image
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          },
          file.type,
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }

  // Utility: Generate image URL from backend path or S3 URL
  getImageUrl(imagePath) {
    if (!imagePath) return null;
    
    // If it's already a full URL (including S3 URLs), return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If it's a legacy backend path (starts with /api/uploads), construct full URL
    if (imagePath.startsWith('/api/uploads') || imagePath.startsWith('/uploads')) {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      return `${baseUrl}${imagePath}`;
    }
    
    // For any other path format, treat as relative path
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    return `${baseUrl}/uploads${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  }

  // Utility: Get file extension from filename
  getFileExtension(filename) {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  // Utility: Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default new ImageUploadService();