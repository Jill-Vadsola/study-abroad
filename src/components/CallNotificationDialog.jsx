import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Call as CallIcon,
  Close as CloseIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';

const CallNotificationDialog = ({
  open,
  onClose,
  onJoinCall,
  callData,
  mentorProfile,
}) => {
  if (!callData) return null;

  const handleJoinCall = () => {
    onJoinCall(callData);
    onClose();
  };

  const handleDecline = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleDecline}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
      }}
    >
      <DialogTitle
        sx={{
          color: 'white',
          textAlign: 'center',
          fontWeight: 'bold',
          pb: 1,
        }}
      >
        <CallIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Incoming Video Call
      </DialogTitle>

      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 4,
          backgroundColor: 'white',
          color: '#1a1a1a',
        }}
      >
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mb: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontSize: '2rem',
            fontWeight: 'bold',
          }}
        >
          {callData?.studentName?.charAt(0) || 'S'}
        </Avatar>

        <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
          {callData?.studentName}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          wants to have a video call with you
        </Typography>

        <Chip
          label="Video Call"
          color="primary"
          icon={<CallIcon />}
          sx={{
            mb: 2,
            height: 32,
            fontSize: '0.9rem',
          }}
        />

        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
          1-hour mentoring session
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          backgroundColor: 'white',
          p: 2,
          gap: 1,
          justifyContent: 'center',
          borderTop: '1px solid #e0e0e0',
        }}
      >
        <Button
          onClick={handleDecline}
          variant="outlined"
          color="error"
          startIcon={<CloseIcon />}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            minWidth: 120,
          }}
        >
          Decline
        </Button>

        <Button
          onClick={handleJoinCall}
          variant="contained"
          color="success"
          startIcon={<PhoneIcon />}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            minWidth: 120,
          }}
        >
          Join Call
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CallNotificationDialog;
