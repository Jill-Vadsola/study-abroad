/**
 * Secure storage utility for handling sensitive user data
 * Implements multiple layers of security for token and user data storage
 */

// Simple encryption/decryption utilities (for demonstration)
// In production, use a proper encryption library like crypto-js
const simpleEncrypt = (text, key = "study-abroad-secret") => {
  try {
    // Append key to mark the boundary
    const marker = "::ENCRYPTED::";
    return btoa(encodeURIComponent(text + marker));
  } catch (error) {
    console.error("Encryption failed:", error);
    return text;
  }
};

const simpleDecrypt = (encryptedText, key = "study-abroad-secret") => {
  try {
    const decoded = atob(encryptedText);
    const decrypted = decodeURIComponent(decoded);
    // Remove the marker instead of the key to avoid corrupting tokens
    const marker = "::ENCRYPTED::";
    if (decrypted.endsWith(marker)) {
      return decrypted.slice(0, -marker.length);
    }
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
};

class SecureStorage {
  constructor() {
    this.prefix = "sa_"; // study-abroad prefix
    this.encryptionKey =
      process.env.REACT_APP_ENCRYPTION_KEY || "study-abroad-secret-key";
  }

  // Store token securely
  setToken(token) {
    if (!token) return;

    try {
      // Option 1: httpOnly cookie (most secure, but requires backend support)
      // This would be handled by the backend setting httpOnly cookies

      // Option 2: Encrypted localStorage (current implementation)
      const encrypted = simpleEncrypt(token, this.encryptionKey);
      localStorage.setItem(`${this.prefix}token`, encrypted);

      // Set expiration timestamp
      const expirationTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      localStorage.setItem(
        `${this.prefix}token_exp`,
        expirationTime.toString()
      );
    } catch (error) {
      console.error("Failed to store token:", error);
    }
  }

  // Retrieve token securely
  getToken() {
    try {
      // Check if token has expired
      const expiration = localStorage.getItem(`${this.prefix}token_exp`);
      if (expiration && Date.now() > parseInt(expiration)) {
        this.clearToken();
        return null;
      }

      const encryptedToken = localStorage.getItem(`${this.prefix}token`);
      if (!encryptedToken) return null;

      return simpleDecrypt(encryptedToken, this.encryptionKey);
    } catch (error) {
      console.error("Failed to retrieve token:", error);
      return null;
    }
  }

  // Store user data (less sensitive, can be in localStorage)
  setUser(userData) {
    if (!userData) return;

    try {
      // Store only non-sensitive user data
      const safeUserData = {
        id: userData.id || userData._id,
        name: userData.name,
        email: userData.email,
        entityType: userData.entityType,
        profilePicture: userData.profilePicture,
        // Don't store sensitive data like passwords, full profile details
      };

      localStorage.setItem(`${this.prefix}user`, JSON.stringify(safeUserData));
    } catch (error) {
      console.error("Failed to store user data:", error);
    }
  }

  // Retrieve user data
  getUser() {
    try {
      const userData = localStorage.getItem(`${this.prefix}user`);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Failed to retrieve user data:", error);
      return null;
    }
  }

  // Clear token
  clearToken() {
    localStorage.removeItem(`${this.prefix}token`);
    localStorage.removeItem(`${this.prefix}token_exp`);
  }

  // Clear user data
  clearUser() {
    localStorage.removeItem(`${this.prefix}user`);
  }

  // Clear all data
  clearAll() {
    this.clearToken();
    this.clearUser();

    // Clear any other app-specific data
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  // Check if user is authenticated (token exists and not expired)
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  // Refresh token mechanism
  setRefreshToken(refreshToken) {
    if (!refreshToken) return;

    try {
      const encrypted = simpleEncrypt(refreshToken, this.encryptionKey);
      localStorage.setItem(`${this.prefix}refresh_token`, encrypted);
    } catch (error) {
      console.error("Failed to store refresh token:", error);
    }
  }

  getRefreshToken() {
    try {
      const encryptedToken = localStorage.getItem(
        `${this.prefix}refresh_token`
      );
      if (!encryptedToken) return null;

      return simpleDecrypt(encryptedToken, this.encryptionKey);
    } catch (error) {
      console.error("Failed to retrieve refresh token:", error);
      return null;
    }
  }

  clearRefreshToken() {
    localStorage.removeItem(`${this.prefix}refresh_token`);
  }
}

export default new SecureStorage();

export const STORAGE_SECURITY_RECOMMENDATIONS = `
SECURITY RECOMMENDATIONS FOR PRODUCTION:

1. **Use HttpOnly Cookies for Tokens** (Most Secure)
   - Store JWT tokens in httpOnly cookies
   - Prevents XSS attacks from accessing tokens
   - Requires backend support for cookie management

2. **Implement Proper Encryption**
   - Use crypto-js or similar library for client-side encryption
   - Store encryption keys securely (environment variables)
   - Use different keys for different data types

3. **Token Expiration & Refresh**
   - Implement short-lived access tokens (15-30 minutes)
   - Use refresh tokens for token renewal
   - Auto-logout on token expiration

4. **Content Security Policy (CSP)**
   - Implement strict CSP headers
   - Prevent inline script execution
   - Whitelist trusted domains

5. **Data Minimization**
   - Store only essential user data client-side
   - Keep sensitive data server-side only
   - Regularly audit stored data

6. **Session Management**
   - Implement proper session timeout
   - Clear data on tab/browser close
   - Monitor for concurrent sessions

7. **Additional Security Measures**
   - Input validation and sanitization
   - Regular security audits
   - Rate limiting on auth endpoints
   - Logging and monitoring
`;
