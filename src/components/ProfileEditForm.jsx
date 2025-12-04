import React, { useState, useEffect } from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Button,
  Box,
  Grid,
  DialogActions,
  Autocomplete,
  Typography,
  Divider,
} from '@mui/material';
import { ProfileImageUpload } from './ImageUpload';

const ProfileEditForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    country: '',
    bio: '',
    profileImageUrl: '',
    studentProfile: {
      university: '',
      major: '',
      academicLevel: '',
      gpa: '',
      destinationCountry: '',
      interests: [],
    },
    mentorProfile: {
      currentPosition: '',
      company: '',
      yearsOfExperience: '',
      expertise: [],
      mentorshipAreas: [],
      linkedInProfile: '',
      mentorshipPrice: 0,
      paymentCurrency: 'usd',
    },
    universityProfile: {
      universityName: '',
      department: '',
      position: '',
      academicPrograms: [],
      contact: '',
    },
  });

  // Initialize form data from user prop
  useEffect(() => {
    console.log("ProfileEditForm received user:", user);
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        country: user.country || '',
        bio: user.bio || '',
        profileImageUrl: user.profileImageUrl || '',
        studentProfile: {
          // Support both nested structure (studentProfile.university) and flat structure (university at top level)
          university: user.studentProfile?.university || user.university || '',
          major: user.studentProfile?.major || user.major || '',
          academicLevel: user.studentProfile?.academicLevel || user.academicLevel || '',
          gpa: user.studentProfile?.gpa || user.gpa || '',
          destinationCountry: user.studentProfile?.destinationCountry || user.destinationCountry || '',
          interests: user.studentProfile?.interests || user.interests || [],
        },
        mentorProfile: {
          currentPosition: user.currentPosition || user.mentorProfile?.currentPosition || '',
          company: user.company || user.mentorProfile?.company || '',
          yearsOfExperience: user.yearsOfExperience || user.mentorProfile?.yearsOfExperience || '',
          expertise: user.expertise || user.mentorProfile?.expertise || [],
          mentorshipAreas: user.mentorshipAreas || user.mentorProfile?.mentorshipAreas || [],
          linkedInProfile: user.linkedInProfile || user.mentorProfile?.linkedInProfile || '',
          mentorshipPrice: user.mentorshipPrice || user.mentorProfile?.mentorshipPrice || 0,
          paymentCurrency: user.paymentCurrency || user.mentorProfile?.paymentCurrency || 'usd',
        },
        universityProfile: {
          universityName: user.universityProfile?.universityName || '',
          department: user.universityProfile?.department || '',
          position: user.universityProfile?.position || '',
          academicPrograms: user.universityProfile?.academicPrograms || [],
          contact: user.universityProfile?.contact || '',
        },
      });
      console.log("ProfileEditForm formData set to:", {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        country: user.country || '',
        bio: user.bio || '',
        university: user.university || '',
        major: user.major || '',
        academicLevel: user.academicLevel || '',
        destinationCountry: user.destinationCountry || '',
        interests: user.interests || [],
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [section, subField] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [subField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  // Common field options
  const academicLevels = ['Undergraduate', 'Graduate', 'PhD', 'Postdoc'];
  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany',
    'France', 'Netherlands', 'Sweden', 'Denmark', 'Japan', 'South Korea',
    'Singapore', 'New Zealand', 'Switzerland', 'Austria', 'Ireland'
  ];
  const interestOptions = [
    'Computer Science', 'Engineering', 'Business', 'Medicine', 'Arts',
    'Literature', 'Psychology', 'Economics', 'International Relations',
    'Environmental Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology'
  ];

  return (
    <Box component="form" sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Profile Image
          </Typography>
          <ProfileImageUpload
            currentImage={formData.profileImageUrl}
            onUploadSuccess={(result) => {
              handleInputChange('profileImageUrl', result.imageUrl || result.fileUrl);
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Basic Information
          </Typography>
        </Grid>

        {/* Common Fields */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="First Name"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Last Name"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone Number"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Autocomplete
            options={countries}
            value={formData.country}
            onChange={(event, newValue) => handleInputChange('country', newValue || '')}
            renderInput={(params) => <TextField {...params} label="Country" />}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Bio"
            multiline
            rows={3}
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Tell others about yourself..."
          />
        </Grid>

        {/* Remove the manual profile image URL field since we have upload now */}

        {/* Student-specific fields */}
        {user?.entityType === 'student' && (
          <>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Academic Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="University"
                value={formData.studentProfile.university}
                onChange={(e) => handleInputChange('studentProfile.university', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Major"
                value={formData.studentProfile.major}
                onChange={(e) => handleInputChange('studentProfile.major', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Academic Level</InputLabel>
                <Select
                  value={formData.studentProfile.academicLevel}
                  onChange={(e) => handleInputChange('studentProfile.academicLevel', e.target.value)}
                  label="Academic Level"
                >
                  {academicLevels.map((level) => (
                    <MenuItem key={level} value={level}>{level}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="GPA"
                type="number"
                inputProps={{ step: "0.01", min: "0", max: "4.0" }}
                value={formData.studentProfile.gpa}
                onChange={(e) => handleInputChange('studentProfile.gpa', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={countries}
                value={formData.studentProfile.destinationCountry}
                onChange={(event, newValue) => handleInputChange('studentProfile.destinationCountry', newValue || '')}
                renderInput={(params) => <TextField {...params} label="Destination Country" />}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={interestOptions}
                value={formData.studentProfile.interests}
                onChange={(event, newValue) => handleInputChange('studentProfile.interests', newValue)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} label="Interests" placeholder="Select your interests" />
                )}
              />
            </Grid>
          </>
        )}

        {/* Mentor-specific fields */}
        {user?.entityType === 'mentor' && (
          <>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Professional Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Current Position"
                value={formData.mentorProfile.currentPosition}
                onChange={(e) => handleInputChange('mentorProfile.currentPosition', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company"
                value={formData.mentorProfile.company}
                onChange={(e) => handleInputChange('mentorProfile.company', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Years of Experience"
                type="number"
                value={formData.mentorProfile.yearsOfExperience}
                onChange={(e) => handleInputChange('mentorProfile.yearsOfExperience', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="LinkedIn Profile"
                value={formData.mentorProfile.linkedInProfile}
                onChange={(e) => handleInputChange('mentorProfile.linkedInProfile', e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={interestOptions}
                value={formData.mentorProfile.expertise}
                onChange={(event, newValue) => handleInputChange('mentorProfile.expertise', newValue)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} label="Expertise Areas" placeholder="Select your expertise" />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={interestOptions}
                value={formData.mentorProfile.mentorshipAreas}
                onChange={(event, newValue) => handleInputChange('mentorProfile.mentorshipAreas', newValue)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} label="Mentorship Areas" placeholder="Areas you can mentor in" />
                )}
              />
            </Grid>
          </>
        )}

        {/* University-specific fields */}
        {user?.entityType === 'university' && (
          <>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                University Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="University Name"
                value={formData.universityProfile.universityName}
                onChange={(e) => handleInputChange('universityProfile.universityName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                value={formData.universityProfile.department}
                onChange={(e) => handleInputChange('universityProfile.department', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Position"
                value={formData.universityProfile.position}
                onChange={(e) => handleInputChange('universityProfile.position', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Information"
                value={formData.universityProfile.contact}
                onChange={(e) => handleInputChange('universityProfile.contact', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={interestOptions}
                value={formData.universityProfile.academicPrograms}
                onChange={(event, newValue) => handleInputChange('universityProfile.academicPrograms', newValue)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} label="Academic Programs" placeholder="Select academic programs offered" />
                )}
              />
            </Grid>
          </>
        )}
      </Grid>

      <DialogActions sx={{ px: 0, pt: 3 }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Save Changes
        </Button>
      </DialogActions>
    </Box>
  );
};

export default ProfileEditForm;