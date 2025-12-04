import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  IconButton,
  Avatar,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  CloudUpload,
  PhotoCamera,
  Delete,
  Preview,
  Close,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useToast } from '../contexts/ToastContext';
import imageUploadApi from '../services/imageUploadApi';

const ImageUpload = ({ 
  type = 'profile', // 'profile', 'posts', 'general'
  multiple = false,
  onUploadSuccess,
  onUploadError,
  currentImage = null,
  maxFiles = 5,
  maxSizeMB = 10,
  disabled = false,
  showPreview = true,
  buttonVariant = 'contained',
  buttonText = 'Upload Image',
  acceptedFormats = 'image/*'
}) => {
  const toast = useToast();
  const fileInputRef = useRef(null);
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [errors, setErrors] = useState([]);

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    setErrors([]);

    // Validate files
    const validationErrors = multiple 
      ? imageUploadApi.validateImageFiles(files, maxSizeMB, maxFiles)
      : imageUploadApi.validateImageFile(files[0], maxSizeMB);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSelectedFiles(files);

    // Generate previews if enabled
    if (showPreview) {
      try {
        const previews = await Promise.all(
          files.map(file => imageUploadApi.createImagePreview(file))
        );
        setPreviewImages(previews);
        setPreviewOpen(true);
      } catch (error) {
        console.error('Error generating previews:', error);
        // Continue with upload even if preview fails
        await handleUpload(files);
      }
    } else {
      await handleUpload(files);
    }
  };

  const handleUpload = async (files = selectedFiles) => {
    if (!files.length) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      let result;

      if (type === 'profile') {
        result = await imageUploadApi.uploadProfileImage(files[0]);
      } else if (type === 'posts' && multiple) {
        result = await imageUploadApi.uploadPostImages(files);
      } else {
        result = await imageUploadApi.uploadFile(files[0], type);
      }

      setUploadProgress(100);
      
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }

      // Clear state
      setSelectedFiles([]);
      setPreviewImages([]);
      setPreviewOpen(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Upload error:', error);
      
      if (onUploadError) {
        onUploadError(error);
      }
      
      toast.showError('Failed to upload image(s)');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previewImages.filter((_, i) => i !== index);
    
    setSelectedFiles(newFiles);
    setPreviewImages(newPreviews);
    
    if (newFiles.length === 0) {
      setPreviewOpen(false);
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatFileSize = (size) => {
    return imageUploadApi.formatFileSize(size);
  };

  return (
    <Box>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats}
        multiple={multiple}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={disabled || uploading}
      />

      {/* Upload button */}
      <Button
        variant={buttonVariant}
        onClick={openFileDialog}
        disabled={disabled || uploading}
        startIcon={type === 'profile' ? <PhotoCamera /> : <CloudUpload />}
        sx={{ mb: 1 }}
      >
        {uploading ? 'Uploading...' : buttonText}
      </Button>

      {/* Current image preview (for profile type) */}
      {type === 'profile' && currentImage && (
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={imageUploadApi.getImageUrl(currentImage)}
            sx={{ width: 80, height: 80 }}
          />
          <Typography variant="body2" color="text.secondary">
            Current profile image
          </Typography>
        </Box>
      )}

      {/* Upload progress */}
      {uploading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={uploadProgress} 
            sx={{ mb: 1 }}
          />
          <Typography variant="body2" color="text.secondary" align="center">
            Uploading... {Math.round(uploadProgress)}%
          </Typography>
        </Box>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errors.map((error, index) => (
            <Typography key={index} variant="body2">
              {error}
            </Typography>
          ))}
        </Alert>
      )}

      {/* File information */}
      {selectedFiles.length > 0 && !previewOpen && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              Selected Files ({selectedFiles.length})
            </Typography>
            <List dense>
              {selectedFiles.map((file, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar>
                      <PhotoCamera />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={file.name}
                    secondary={formatFileSize(file.size)}
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      onClick={() => handleRemoveFile(index)}
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog 
        open={previewOpen} 
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Preview Images ({selectedFiles.length})
            <IconButton onClick={() => setPreviewOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={2}>
            {previewImages.map((preview, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <Box
                    sx={{
                      position: 'relative',
                      paddingBottom: '75%', // 4:3 aspect ratio
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      component="img"
                      src={preview}
                      alt={selectedFiles[index]?.name}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.9)',
                        },
                      }}
                      size="small"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                  <CardContent sx={{ pt: 1, pb: '8px !important' }}>
                    <Typography variant="body2" noWrap>
                      {selectedFiles[index]?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(selectedFiles[index]?.size)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={() => handleUpload()}
            disabled={uploading || selectedFiles.length === 0}
            startIcon={uploading ? <LinearProgress /> : <CloudUpload />}
          >
            {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Image(s)`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Simple version for quick profile image upload
export const ProfileImageUpload = ({ currentImage, onUploadSuccess, disabled = false }) => {
  return (
    <ImageUpload
      type="profile"
      currentImage={currentImage}
      onUploadSuccess={onUploadSuccess}
      disabled={disabled}
      buttonText="Upload Profile Photo"
      buttonVariant="outlined"
      maxSizeMB={5}
      showPreview={false}
    />
  );
};

// Simple version for post images
export const PostImageUpload = ({ onUploadSuccess, disabled = false, maxImages = 5 }) => {
  return (
    <ImageUpload
      type="posts"
      multiple={true}
      maxFiles={maxImages}
      onUploadSuccess={onUploadSuccess}
      disabled={disabled}
      buttonText="Add Images"
      buttonVariant="outlined"
      maxSizeMB={10}
      showPreview={true}
    />
  );
};

export default ImageUpload;