import React, { useState } from "react";
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  FormHelperText,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  School,
  CheckCircle,
  Error,
  Person,
  Business,
  EmojiPeople,
  ArrowBack,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useUser, ENTITY_TYPES } from "../contexts/UserContext";
import { useToast } from "../contexts/ToastContext";
import ApiService from "../services/enhancedApi";
import { validateForm, validateField } from "../utils/validation";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const toast = useToast();
  const [step, setStep] = useState(1); // 1: Entity selection, 2: Form
  const [selectedEntityType, setSelectedEntityType] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    entityType: "",
    phoneNumber: "",
    country: "",
    bio: "",
    // Student fields
    university: "",
    major: "",
    academicLevel: "",
    destinationCountry: "",
    interests: [],
    // Mentor fields
    currentPosition: "",
    company: "",
    yearsOfExperience: "",
    expertise: [],
    mentorshipAreas: [],
    availableForMentoring: false,
    // University fields
    universityName: "",
    department: "",
    contactPerson: "",
    contactTitle: "",
    academicPrograms: [],
    websiteUrl: "",
    acceptingStudents: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [currentStepValid, setCurrentStepValid] = useState(false);

  const entityTypes = [
    {
      type: ENTITY_TYPES.STUDENT,
      title: "Student",
      description:
        "I'm an international student looking to connect and access resources",
      icon: <School sx={{ fontSize: 40 }} />,
      color: "primary",
    },
    {
      type: ENTITY_TYPES.MENTOR,
      title: "Mentor",
      description:
        "I want to mentor international students and share my experience",
      icon: <EmojiPeople sx={{ fontSize: 40 }} />,
      color: "secondary",
    },
    {
      type: ENTITY_TYPES.UNIVERSITY,
      title: "University",
      description: "I represent a university and want to connect with students",
      icon: <Business sx={{ fontSize: 40 }} />,
      color: "success",
    },
  ];

  const countries = [
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "France",
    "Netherlands",
    "Sweden",
    "Norway",
    "Denmark",
    "Switzerland",
    "Japan",
    "South Korea",
    "Singapore",
    "New Zealand",
    "Italy",
    "Spain",
  ];

  const interestOptions = [
    "Computer Science",
    "Engineering",
    "Business",
    "Medicine",
    "Arts",
    "Literature",
    "Music",
    "Sports",
    "Photography",
    "Travel",
    "Cooking",
    "Language Exchange",
    "Volunteer Work",
    "Research",
    "Internships",
    "Networking",
    "Cultural Events",
    "Study Groups",
  ];

  const expertiseOptions = [
    "Software Engineering",
    "Data Science",
    "Business Strategy",
    "Marketing",
    "Finance",
    "Healthcare",
    "Education",
    "Research",
    "Entrepreneurship",
    "International Relations",
    "Language Teaching",
    "Career Development",
    "Academic Writing",
    "Project Management",
  ];

  const mentorshipAreas = [
    "Academic Guidance",
    "Career Development",
    "Job Search",
    "Interview Preparation",
    "Networking",
    "Cultural Adaptation",
    "Language Support",
    "Research Guidance",
    "Entrepreneurship",
    "Personal Development",
  ];

  const academicPrograms = [
    "Computer Science",
    "Engineering",
    "Business Administration",
    "Medicine",
    "Law",
    "Arts & Humanities",
    "Social Sciences",
    "Natural Sciences",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Psychology",
    "Economics",
    "International Relations",
  ];

  const handleEntityTypeSelect = (entityType) => {
    setSelectedEntityType(entityType);
    setFormData((prev) => ({ ...prev, entityType }));
    setStep(2);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Real-time validation for all fields
    const fieldError = validateField(name, value, formData, selectedEntityType);
    setErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));

    // Check if current step is valid
    validateCurrentStep();
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Validate field on blur
    const fieldError = validateField(name, value, formData, selectedEntityType);
    setErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));

    validateCurrentStep();
  };

  const validateCurrentStep = () => {
    const stepErrors = validateForm(formData, selectedEntityType);
    setErrors(stepErrors);
    const hasErrors = Object.keys(stepErrors).length > 0;
    setCurrentStepValid(!hasErrors);
    return !hasErrors;
  };

  const validateFormSubmission = () => {
    const formErrors = validateForm(formData, selectedEntityType);
    setErrors(formErrors);

    // Mark all fields as touched for consistency
    const allFields = Object.keys(formData);
    const touchedFields = {};
    allFields.forEach((field) => {
      touchedFields[field] = true;
    });
    setTouched(touchedFields);

    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFormSubmission()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare the registration data
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        entityType: selectedEntityType,
        phoneNumber: formData.phoneNumber,
        country: formData.country,
        bio: formData.bio,
      };

      // Add entity-specific fields based on the selected entity type
      if (selectedEntityType === "student") {
        registrationData.university = formData.university;
        registrationData.major = formData.major;
        registrationData.academicLevel = formData.academicLevel;
        registrationData.destinationCountry = formData.destinationCountry;
        registrationData.interests = formData.interests;
      } else if (selectedEntityType === "mentor") {
        registrationData.currentPosition = formData.currentPosition;
        registrationData.company = formData.company;
        registrationData.yearsOfExperience = parseInt(
          formData.yearsOfExperience
        );
        registrationData.expertise = formData.expertise;
        registrationData.mentorshipAreas = formData.mentorshipAreas;
        registrationData.availableForMentoring = formData.availableForMentoring;
      } else if (selectedEntityType === "university") {
        registrationData.universityName = formData.universityName;
        registrationData.department = formData.department;
        registrationData.contactPerson = formData.contactPerson;
        registrationData.contactTitle = formData.contactTitle;
        registrationData.academicPrograms = formData.academicPrograms;
        registrationData.websiteUrl = formData.websiteUrl;
        registrationData.acceptingStudents = formData.acceptingStudents;
      }

      console.log("Registration attempt:", registrationData);

      // Call the backend API (toast notifications handled by enhanced API)
      const response = await ApiService.register(registrationData);

      if (response.token) {
        // Update the user context (this will handle secure storage)
        login(response.user, response.token);

        // Navigate based on entity type or to networking page
        const entityDashboard =
          response.user?.entityType === "student"
            ? "/student-dashboard"
            : response.user?.entityType === "mentor"
            ? "/mentor-dashboard"
            : response.user?.entityType === "university"
            ? "/university-dashboard"
            : "/networking";

        // Small delay to show success message before navigation
        setTimeout(() => {
          navigate(entityDashboard);
        }, 1500);
      } else {
        throw new Error("No token received from server");
      }
    } catch (error) {
      console.error("Registration error:", error);
      // All errors are handled by the global toast system in enhanced API
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // TODO: Implement social login
    console.log(`${provider} registration clicked`);
  };

  const renderStepOne = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" textAlign="center" gutterBottom>
        Choose Your Account Type
      </Typography>
      <Typography
        variant="body2"
        textAlign="center"
        color="text.secondary"
        sx={{ mb: 4 }}
      >
        Select the type of account that best describes you
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        {entityTypes.map((entity) => (
          <Grid item xs={12} md={4} key={entity.type}>
            <Card
              sx={{
                cursor: "pointer",
                transition: "all 0.3s ease",
                border:
                  selectedEntityType === entity.type
                    ? "2px solid"
                    : "1px solid",
                borderColor:
                  selectedEntityType === entity.type
                    ? "primary.main"
                    : "divider",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
              onClick={() => handleEntityTypeSelect(entity.type)}
            >
              <CardContent sx={{ textAlign: "center", p: 3 }}>
                <Box sx={{ mb: 2, color: entity.color }}>{entity.icon}</Box>
                <Typography variant="h6" gutterBottom>
                  {entity.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {entity.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderStudentForm = () => (
    <>
      <TextField
        name="university"
        label="Current University"
        value={formData.university}
        onChange={handleChange}
        onBlur={handleBlur}
        fullWidth
        margin="normal"
        error={!!errors.university}
        helperText={errors.university || "Enter your current university"}
        InputProps={{
          endAdornment: formData.university && !errors.university && (
            <InputAdornment position="end">
              <CheckCircle color="success" fontSize="small" />
            </InputAdornment>
          ),
        }}
      />
      <TextField
        name="major"
        label="Major/Field of Study"
        value={formData.major}
        onChange={handleChange}
        onBlur={handleBlur}
        fullWidth
        margin="normal"
        error={!!errors.major}
        helperText={errors.major || "Enter your field of study"}
        InputProps={{
          endAdornment: formData.major && !errors.major && (
            <InputAdornment position="end">
              <CheckCircle color="success" fontSize="small" />
            </InputAdornment>
          ),
        }}
      />
      <FormControl fullWidth margin="normal" error={!!errors.academicLevel}>
        <InputLabel>Academic Level</InputLabel>
        <Select
          name="academicLevel"
          value={formData.academicLevel}
          onChange={handleChange}
          onBlur={handleBlur}
          label="Academic Level"
        >
          <MenuItem value="undergraduate">Undergraduate</MenuItem>
          <MenuItem value="graduate">Graduate</MenuItem>
          <MenuItem value="phd">PhD</MenuItem>
          <MenuItem value="postdoc">Post-doc</MenuItem>
        </Select>
        {errors.academicLevel && (
          <FormHelperText>{errors.academicLevel}</FormHelperText>
        )}
      </FormControl>
      <FormControl
        fullWidth
        margin="normal"
        error={!!errors.destinationCountry}
      >
        <InputLabel>Destination Country</InputLabel>
        <Select
          name="destinationCountry"
          value={formData.destinationCountry}
          onChange={handleChange}
          onBlur={handleBlur}
          label="Destination Country"
        >
          {countries.map((country) => (
            <MenuItem key={country} value={country}>
              {country}
            </MenuItem>
          ))}
        </Select>
        {errors.destinationCountry && (
          <FormHelperText>{errors.destinationCountry}</FormHelperText>
        )}
      </FormControl>
      <FormControl fullWidth margin="normal" error={!!errors.interests}>
        <InputLabel>Interests</InputLabel>
        <Select
          name="interests"
          multiple
          value={formData.interests}
          onChange={handleChange}
          onBlur={handleBlur}
          label="Interests"
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} size="small" />
              ))}
            </Box>
          )}
        >
          {interestOptions.map((interest) => (
            <MenuItem key={interest} value={interest}>
              {interest}
            </MenuItem>
          ))}
        </Select>
        {errors.interests && (
          <FormHelperText>{errors.interests}</FormHelperText>
        )}
      </FormControl>
    </>
  );

  const renderMentorForm = () => (
    <>
      <TextField
        name="currentPosition"
        label="Current Position/Title"
        value={formData.currentPosition}
        onChange={handleChange}
        onBlur={handleBlur}
        fullWidth
        margin="normal"
        error={!!errors.currentPosition}
        helperText={errors.currentPosition || "Enter your current job title"}
        InputProps={{
          endAdornment: formData.currentPosition && !errors.currentPosition && (
            <InputAdornment position="end">
              <CheckCircle color="success" fontSize="small" />
            </InputAdornment>
          ),
        }}
      />
      <TextField
        name="company"
        label="Company/Organization"
        value={formData.company}
        onChange={handleChange}
        onBlur={handleBlur}
        fullWidth
        margin="normal"
        error={!!errors.company}
        helperText={errors.company || "Enter your company or organization"}
        InputProps={{
          endAdornment: formData.company && !errors.company && (
            <InputAdornment position="end">
              <CheckCircle color="success" fontSize="small" />
            </InputAdornment>
          ),
        }}
      />
      <TextField
        name="yearsOfExperience"
        label="Years of Experience"
        type="number"
        value={formData.yearsOfExperience}
        onChange={handleChange}
        onBlur={handleBlur}
        fullWidth
        margin="normal"
        error={!!errors.yearsOfExperience}
        helperText={
          errors.yearsOfExperience ||
          "Enter your years of professional experience"
        }
        inputProps={{ min: 0 }}
        InputProps={{
          endAdornment: formData.yearsOfExperience &&
            !errors.yearsOfExperience && (
              <InputAdornment position="end">
                <CheckCircle color="success" fontSize="small" />
              </InputAdornment>
            ),
        }}
      />
      <FormControl fullWidth margin="normal" error={!!errors.expertise}>
        <InputLabel>Areas of Expertise</InputLabel>
        <Select
          name="expertise"
          multiple
          value={formData.expertise}
          onChange={handleChange}
          onBlur={handleBlur}
          label="Areas of Expertise"
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} size="small" />
              ))}
            </Box>
          )}
        >
          {expertiseOptions.map((expertise) => (
            <MenuItem key={expertise} value={expertise}>
              {expertise}
            </MenuItem>
          ))}
        </Select>
        {errors.expertise && (
          <FormHelperText>{errors.expertise}</FormHelperText>
        )}
      </FormControl>
      <FormControl fullWidth margin="normal" error={!!errors.mentorshipAreas}>
        <InputLabel>Mentorship Areas</InputLabel>
        <Select
          name="mentorshipAreas"
          multiple
          value={formData.mentorshipAreas}
          onChange={handleChange}
          onBlur={handleBlur}
          label="Mentorship Areas"
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} size="small" />
              ))}
            </Box>
          )}
        >
          {mentorshipAreas.map((area) => (
            <MenuItem key={area} value={area}>
              {area}
            </MenuItem>
          ))}
        </Select>
        {errors.mentorshipAreas && (
          <FormHelperText>{errors.mentorshipAreas}</FormHelperText>
        )}
      </FormControl>
      <FormControlLabel
        control={
          <Checkbox
            name="availableForMentoring"
            checked={formData.availableForMentoring}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                availableForMentoring: e.target.checked,
              }))
            }
          />
        }
        label="Currently available for mentoring"
      />
    </>
  );

  const renderUniversityForm = () => (
    <>
      <TextField
        name="universityName"
        label="University Name"
        value={formData.universityName}
        onChange={handleChange}
        onBlur={handleBlur}
        fullWidth
        margin="normal"
        error={!!errors.universityName}
        helperText={
          errors.universityName || "Enter the official university name"
        }
        InputProps={{
          endAdornment: formData.universityName && !errors.universityName && (
            <InputAdornment position="end">
              <CheckCircle color="success" fontSize="small" />
            </InputAdornment>
          ),
        }}
      />
      <TextField
        name="department"
        label="Department/Faculty"
        value={formData.department}
        onChange={handleChange}
        onBlur={handleBlur}
        fullWidth
        margin="normal"
        error={!!errors.department}
        helperText={errors.department || "Enter your department or faculty"}
        InputProps={{
          endAdornment: formData.department && !errors.department && (
            <InputAdornment position="end">
              <CheckCircle color="success" fontSize="small" />
            </InputAdornment>
          ),
        }}
      />
      <TextField
        name="contactPerson"
        label="Contact Person Name"
        value={formData.contactPerson}
        onChange={handleChange}
        onBlur={handleBlur}
        fullWidth
        margin="normal"
        error={!!errors.contactPerson}
        helperText={
          errors.contactPerson || "Enter the main contact person's name"
        }
        InputProps={{
          endAdornment: formData.contactPerson && !errors.contactPerson && (
            <InputAdornment position="end">
              <CheckCircle color="success" fontSize="small" />
            </InputAdornment>
          ),
        }}
      />
      <TextField
        name="contactTitle"
        label="Contact Person Title"
        value={formData.contactTitle}
        onChange={handleChange}
        onBlur={handleBlur}
        fullWidth
        margin="normal"
        error={!!errors.contactTitle}
        helperText={
          errors.contactTitle || "Enter the contact person's job title"
        }
        InputProps={{
          endAdornment: formData.contactTitle && !errors.contactTitle && (
            <InputAdornment position="end">
              <CheckCircle color="success" fontSize="small" />
            </InputAdornment>
          ),
        }}
      />
      <FormControl fullWidth margin="normal" error={!!errors.academicPrograms}>
        <InputLabel>Academic Programs Offered</InputLabel>
        <Select
          name="academicPrograms"
          multiple
          value={formData.academicPrograms}
          onChange={handleChange}
          onBlur={handleBlur}
          label="Academic Programs Offered"
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} size="small" />
              ))}
            </Box>
          )}
        >
          {academicPrograms.map((program) => (
            <MenuItem key={program} value={program}>
              {program}
            </MenuItem>
          ))}
        </Select>
        {errors.academicPrograms && (
          <FormHelperText>{errors.academicPrograms}</FormHelperText>
        )}
      </FormControl>
      <TextField
        name="websiteUrl"
        label="University Website"
        type="url"
        value={formData.websiteUrl}
        onChange={handleChange}
        onBlur={handleBlur}
        fullWidth
        margin="normal"
        error={!!errors.websiteUrl}
        helperText={
          errors.websiteUrl || "Enter the university's official website URL"
        }
        InputProps={{
          endAdornment: formData.websiteUrl && !errors.websiteUrl && (
            <InputAdornment position="end">
              <CheckCircle color="success" fontSize="small" />
            </InputAdornment>
          ),
        }}
      />
      <FormControlLabel
        control={
          <Checkbox
            name="acceptingStudents"
            checked={formData.acceptingStudents}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                acceptingStudents: e.target.checked,
              }))
            }
          />
        }
        label="Currently accepting international students"
      />
    </>
  );

  const renderStepTwo = () => (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={() => setStep(1)} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5">
          Complete Your {selectedEntityType} Profile
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit}>
        {/* Common fields for all entity types */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            name="firstName"
            label="First Name"
            value={formData.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth
            margin="normal"
            error={!!errors.firstName}
            helperText={errors.firstName || "Enter your first name"}
            InputProps={{
              endAdornment: formData.firstName && !errors.firstName && (
                <InputAdornment position="end">
                  <CheckCircle color="success" fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            name="lastName"
            label="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth
            margin="normal"
            error={!!errors.lastName}
            helperText={errors.lastName || "Enter your last name"}
            InputProps={{
              endAdornment: formData.lastName && !errors.lastName && (
                <InputAdornment position="end">
                  <CheckCircle color="success" fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <TextField
          name="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          fullWidth
          margin="normal"
          error={!!errors.email}
          helperText={errors.email || "Enter a valid email address"}
          InputProps={{
            endAdornment: formData.email && !errors.email && (
              <InputAdornment position="end">
                <CheckCircle color="success" fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <TextField
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth
            margin="normal"
            error={!!errors.password}
            helperText={
              errors.password ||
              "Must contain 8+ chars, uppercase, lowercase, number, special char"
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {formData.password && !errors.password && !showPassword && (
                    <CheckCircle
                      color="success"
                      fontSize="small"
                      sx={{ mr: 1 }}
                    />
                  )}
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            name="confirmPassword"
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth
            margin="normal"
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword || "Repeat your password"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {formData.confirmPassword &&
                    !errors.confirmPassword &&
                    !showConfirmPassword && (
                      <CheckCircle
                        color="success"
                        fontSize="small"
                        sx={{ mr: 1 }}
                      />
                    )}
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <TextField
          name="phoneNumber"
          label="Phone Number"
          value={formData.phoneNumber}
          onChange={handleChange}
          onBlur={handleBlur}
          fullWidth
          margin="normal"
          error={!!errors.phoneNumber}
          helperText={
            errors.phoneNumber || "Enter your phone number (optional)"
          }
          InputProps={{
            endAdornment: formData.phoneNumber && !errors.phoneNumber && (
              <InputAdornment position="end">
                <CheckCircle color="success" fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl fullWidth margin="normal" error={!!errors.country}>
          <InputLabel>Country</InputLabel>
          <Select
            name="country"
            value={formData.country}
            onChange={handleChange}
            onBlur={handleBlur}
            label="Country"
          >
            {countries.map((country) => (
              <MenuItem key={country} value={country}>
                {country}
              </MenuItem>
            ))}
          </Select>
          {errors.country && <FormHelperText>{errors.country}</FormHelperText>}
        </FormControl>
        <TextField
          name="bio"
          label="Bio"
          multiline
          rows={3}
          value={formData.bio}
          onChange={handleChange}
          onBlur={handleBlur}
          fullWidth
          margin="normal"
          placeholder="Tell us about yourself..."
          error={!!errors.bio}
          helperText={errors.bio || "Tell us about yourself (optional)"}
          InputProps={{
            endAdornment: formData.bio && !errors.bio && (
              <InputAdornment position="end">
                <CheckCircle color="success" fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        {/* Entity-specific fields */}
        {selectedEntityType === "student" && renderStudentForm()}
        {selectedEntityType === "mentor" && renderMentorForm()}
        {selectedEntityType === "university" && renderUniversityForm()}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{
            mt: 3,
            mb: 2,
            py: 1.5,
            position: "relative",
          }}
        >
          {loading && (
            <CircularProgress
              size={20}
              sx={{
                position: "absolute",
                left: "50%",
                marginLeft: "-10px",
              }}
            />
          )}
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </Box>
    </Box>
  );

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <School sx={{ fontSize: 40, color: "primary.main", mr: 1 }} />
            <Typography component="h1" variant="h4" fontWeight="bold">
              Join StudyConnect
            </Typography>
          </Box>

          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            sx={{ mb: 4 }}
          >
            Create your account and start connecting with international students
            worldwide.
          </Typography>

          {errors.general && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {errors.general}
            </Alert>
          )}

          {step === 1 ? renderStepOne() : renderStepTwo()}

          {step === 2 && (
            <>

              <Box textAlign="center">
                <Typography variant="body2">
                  Already have an account?{" "}
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => navigate("/login")}
                    sx={{ textDecoration: "none", fontWeight: "bold" }}
                  >
                    Sign in here
                  </Link>
                </Typography>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
