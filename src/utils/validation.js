// Validation utility functions for forms

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
export const urlRegex =
  /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

// Common validation rules
export const validationRules = {
  required: (value, fieldName = "Field") => {
    if (!value || (typeof value === "string" && value.trim() === "")) {
      return `${fieldName} is required`;
    }
    return "";
  },

  email: (value) => {
    if (!value) return "";
    if (!emailRegex.test(value)) {
      return "Please enter a valid email address";
    }
    return "";
  },

  password: (value) => {
    if (!value) return "";
    const errors = [];

    if (value.length < 8) {
      errors.push("at least 8 characters");
    }
    if (!/(?=.*[a-z])/.test(value)) {
      errors.push("one lowercase letter");
    }
    if (!/(?=.*[A-Z])/.test(value)) {
      errors.push("one uppercase letter");
    }
    if (!/(?=.*\d)/.test(value)) {
      errors.push("one number");
    }
    if (!/(?=.*[@$!%*?&])/.test(value)) {
      errors.push("one special character (@$!%*?&)");
    }

    if (errors.length > 0) {
      return `Password must contain ${errors.join(", ")}`;
    }
    return "";
  },

  confirmPassword: (password, confirmPassword) => {
    if (!confirmPassword) return "";
    if (password !== confirmPassword) {
      return "Passwords do not match";
    }
    return "";
  },

  phone: (value) => {
    if (!value) return "";
    if (!phoneRegex.test(value)) {
      return "Please enter a valid phone number";
    }
    return "";
  },

  url: (value) => {
    if (!value) return "";
    if (!urlRegex.test(value)) {
      return "Please enter a valid URL";
    }
    return "";
  },

  minLength: (value, min, fieldName = "Field") => {
    if (!value) return "";
    if (value.length < min) {
      return `${fieldName} must be at least ${min} characters long`;
    }
    return "";
  },

  maxLength: (value, max, fieldName = "Field") => {
    if (!value) return "";
    if (value.length > max) {
      return `${fieldName} must be no more than ${max} characters long`;
    }
    return "";
  },

  arrayMinLength: (array, min, fieldName = "Field") => {
    if (!array || !Array.isArray(array)) return "";
    if (array.length < min) {
      return `Please select at least ${min} ${fieldName.toLowerCase()}`;
    }
    return "";
  },

  numeric: (value, fieldName = "Field") => {
    if (!value) return "";
    if (isNaN(value) || isNaN(parseFloat(value))) {
      return `${fieldName} must be a valid number`;
    }
    return "";
  },

  range: (value, min, max, fieldName = "Field") => {
    if (!value) return "";
    const num = parseFloat(value);
    if (isNaN(num)) {
      return `${fieldName} must be a valid number`;
    }
    if (num < min || num > max) {
      return `${fieldName} must be between ${min} and ${max}`;
    }
    return "";
  },
};

// Entity-specific validations
export const entityValidations = {
  student: {
    university: (value) => validationRules.required(value, "University"),
    major: (value) => validationRules.required(value, "Major"),
    academicLevel: (value) => validationRules.required(value, "Academic level"),
    destinationCountry: (value) =>
      validationRules.required(value, "Destination country"),
    interests: (value) => validationRules.arrayMinLength(value, 1, "interests"),
  },

  mentor: {
    currentPosition: (value) =>
      validationRules.required(value, "Current position"),
    company: (value) => validationRules.required(value, "Company"),
    yearsOfExperience: (value) => {
      const requiredError = validationRules.required(
        value,
        "Years of experience"
      );
      if (requiredError) return requiredError;

      const numericError = validationRules.numeric(
        value,
        "Years of experience"
      );
      if (numericError) return numericError;

      return validationRules.range(value, 0, 50, "Years of experience");
    },
    expertise: (value) =>
      validationRules.arrayMinLength(value, 1, "areas of expertise"),
    availability: (value) => validationRules.required(value, "Availability"),
  },

  university: {
    universityName: (value) =>
      validationRules.required(value, "University name"),
    contactPerson: (value) => validationRules.required(value, "Contact person"),
    establishedYear: (value) => {
      const requiredError = validationRules.required(value, "Established year");
      if (requiredError) return requiredError;

      const numericError = validationRules.numeric(value, "Established year");
      if (numericError) return numericError;

      const currentYear = new Date().getFullYear();
      return validationRules.range(
        value,
        1000,
        currentYear,
        "Established year"
      );
    },
    programs: (value) =>
      validationRules.arrayMinLength(value, 1, "programs offered"),
    websiteUrl: (value) => {
      const requiredError = validationRules.required(value, "Website URL");
      if (requiredError) return requiredError;
      return validationRules.url(value);
    },
  },
};

// Comprehensive form validator
export const validateForm = (formData, entityType = null) => {
  const errors = {};

  // Common validations
  if (formData.firstName !== undefined) {
    const error =
      validationRules.required(formData.firstName, "First name") ||
      validationRules.minLength(formData.firstName, 2, "First name") ||
      validationRules.maxLength(formData.firstName, 50, "First name");
    if (error) errors.firstName = error;
  }

  if (formData.lastName !== undefined) {
    const error =
      validationRules.required(formData.lastName, "Last name") ||
      validationRules.minLength(formData.lastName, 2, "Last name") ||
      validationRules.maxLength(formData.lastName, 50, "Last name");
    if (error) errors.lastName = error;
  }

  if (formData.email !== undefined) {
    const error =
      validationRules.required(formData.email, "Email") ||
      validationRules.email(formData.email);
    if (error) errors.email = error;
  }

  if (formData.password !== undefined) {
    const error =
      validationRules.required(formData.password, "Password") ||
      validationRules.password(formData.password);
    if (error) errors.password = error;
  }

  if (formData.confirmPassword !== undefined) {
    const error = validationRules.confirmPassword(
      formData.password,
      formData.confirmPassword
    );
    if (error) errors.confirmPassword = error;
  }

  if (formData.phoneNumber !== undefined) {
    const error =
      validationRules.required(formData.phoneNumber, "Phone number") ||
      validationRules.phone(formData.phoneNumber);
    if (error) errors.phoneNumber = error;
  }

  if (formData.country !== undefined) {
    const error = validationRules.required(formData.country, "Country");
    if (error) errors.country = error;
  }

  if (formData.bio !== undefined && formData.bio) {
    const error = validationRules.maxLength(formData.bio, 500, "Bio");
    if (error) errors.bio = error;
  }

  // Entity-specific validations
  if (entityType && entityValidations[entityType]) {
    const entityRules = entityValidations[entityType];

    Object.keys(entityRules).forEach((field) => {
      if (formData[field] !== undefined) {
        const error = entityRules[field](formData[field]);
        if (error) errors[field] = error;
      }
    });
  }

  return errors;
};

// Real-time field validation
export const validateField = (
  fieldName,
  value,
  formData = {},
  entityType = null
) => {
  const tempFormData = { ...formData, [fieldName]: value };
  const errors = validateForm(tempFormData, entityType);
  return errors[fieldName] || "";
};

// Login form validation
export const validateLoginForm = (formData) => {
  const errors = {};

  const emailError =
    validationRules.required(formData.email, "Email") ||
    validationRules.email(formData.email);
  if (emailError) errors.email = emailError;

  const passwordError = validationRules.required(formData.password, "Password");
  if (passwordError) errors.password = passwordError;

  return errors;
};

export default {
  validationRules,
  entityValidations,
  validateForm,
  validateField,
  validateLoginForm,
};
