import React, { createContext, useContext, useState } from "react";
import { Snackbar, Alert, AlertTitle } from "@mui/material";

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (
    message,
    severity = "info",
    title = "",
    duration = 6000
  ) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      message,
      severity, // 'success', 'error', 'warning', 'info'
      title,
      duration,
      open: true,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const showSuccess = (message, title = "Success") => {
    return showToast(message, "success", title);
  };

  const showError = (message, title = "Error") => {
    return showToast(message, "error", title, 8000); // Longer duration for errors
  };

  const showWarning = (message, title = "Warning") => {
    return showToast(message, "warning", title);
  };

  const showInfo = (message, title = "Info") => {
    return showToast(message, "info", title);
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  const value = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    clearAllToasts,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Render all active toasts */}
      {toasts.map((toast, index) => (
        <Snackbar
          key={toast.id}
          open={toast.open}
          autoHideDuration={toast.duration > 0 ? toast.duration : null}
          onClose={() => removeToast(toast.id)}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          sx={{
            mt: index * 7, // Stack multiple toasts
            maxWidth: "500px",
          }}
        >
          <Alert
            onClose={() => removeToast(toast.id)}
            severity={toast.severity}
            variant="filled"
            sx={{
              width: "100%",
              minWidth: "300px",
            }}
          >
            {toast.title && (
              <AlertTitle sx={{ fontWeight: "bold" }}>{toast.title}</AlertTitle>
            )}
            {toast.message}
          </Alert>
        </Snackbar>
      ))}
    </ToastContext.Provider>
  );
};

export default ToastContext;
