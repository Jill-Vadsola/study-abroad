import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
} from '@mui/material';
import { CallEnd as CallEndIcon, Videocam as VideocamIcon } from '@mui/icons-material';
import mentorshipApi from '../services/mentorshipApi';
import secureStorage from '../utils/secureStorage';

const VideoConferenceDialog = ({
  open,
  onClose,
  mentorshipId,
  currentUser,
  otherUser,
  onSessionEnd,
  roomName: initialRoomName,
}) => {
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(3600); // 1 hour in seconds
  const [jitsiAPI, setJitsiAPI] = useState(null);

  // If roomName is provided (mentor joining), use it directly
  useEffect(() => {
    if (initialRoomName && open) {
      // Mentor joining existing call
      setSessionData({
        _id: `${mentorshipId}_mentor`,
        mentorshipId,
        roomName: initialRoomName,
      });
    }
  }, [initialRoomName, open, mentorshipId]);

  // Initialize Jitsi Meet
  useEffect(() => {
    if (open && sessionData) {
      initializeJitsiMeet();
    }
  }, [open, sessionData]);

  // Countdown timer
  useEffect(() => {
    if (!sessionData || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleEndCall('time-limit');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionData, timeRemaining]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((3600 - timeRemaining) / 3600) * 100;
  };

  const initializeJitsiMeet = () => {
    // Load Jitsi Meet script if not already loaded
    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.onload = () => {
        createJitsiRoom();
      };
      document.body.appendChild(script);
    } else {
      createJitsiRoom();
    }
  };

  const createJitsiRoom = () => {
    const domain = 'meet.jit.si';
    const options = {
      roomName: sessionData.roomName,
      width: '100%',
      height: 500,
      parentNode: document.getElementById('jitsi-container'),
      configOverrides: {
        disableSimulcast: false,
        startAudioMuted: false,
        startVideoMuted: false,
        disableRemoteMute: false,
      },
      interfaceConfigOverrides: {
        DISABLE_AUDIO_LEVELS: true,
        SHOW_JITSI_WATERMARK: false,
        MOBILE_APP_PROMO: false,
        // Try to make moderator optional
        DEFAULT_REMOTE_DISPLAY_NAME: 'Participant',
        SHOW_MODAL_ON_LAUNCH: false,
      },
      userInfo: {
        displayName: `${currentUser?.firstName} ${currentUser?.lastName || ''}`,
        email: currentUser?.email,
      },
    };

    try {
      const api = new window.JitsiMeetExternalAPI(domain, options);
      setJitsiAPI(api);

      // Handle API events
      api.addEventListener('videoConferenceLeft', () => {
        handleEndCall('user-left');
      });

      api.addEventListener('readyToClose', () => {
        handleEndCall('ready-to-close');
      });
    } catch (err) {
      console.error('Failed to initialize Jitsi:', err);
      setError('Failed to initialize video conference');
    }
  };

  const handleStartCall = async () => {
    try {
      setLoading(true);
      setError('');

      const token = secureStorage.getToken();
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      // Check if can call
      const canCallResponse = await fetch(
        `http://localhost:3001/api/video-session/can-call/${mentorshipId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!canCallResponse.ok) {
        const data = await canCallResponse.json();
        throw new Error(data.message || 'Cannot initiate call');
      }

      // Start video session
      const response = await fetch(
        `http://localhost:3001/api/video-session/start/${mentorshipId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to start video session');
      }

      const session = await response.json();
      setSessionData(session);
      setTimeRemaining(3600);
    } catch (err) {
      console.error('Failed to start call:', err);
      setError(err.message || 'Failed to start video call');
    } finally {
      setLoading(false);
    }
  };

  const handleEndCall = async (reason = 'user-ended') => {
    try {
      if (sessionData) {
        const token = secureStorage.getToken();
        if (token) {
          await fetch(
            `http://localhost:3001/api/video-session/${sessionData._id}/end`,
            {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                endedBy: currentUser?.entityType || 'student',
              }),
            }
          );
        }
      }

      // Dispose Jitsi API
      if (jitsiAPI) {
        jitsiAPI.dispose();
        setJitsiAPI(null);
      }

      setSessionData(null);
      setTimeRemaining(3600);
      onSessionEnd?.(reason);
      onClose();
    } catch (err) {
      console.error('Failed to end call:', err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <VideocamIcon color="primary" />
            <Typography variant="h6">Video Conference with {otherUser?.firstName}</Typography>
          </Box>
          {sessionData && (
            <Chip
              label={formatTime(timeRemaining)}
              color={timeRemaining < 300 ? 'error' : 'primary'}
              variant="outlined"
            />
          )}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {!sessionData ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Click below to start your video conference with your mentor. You have up to 1 hour for this session.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<VideocamIcon />}
              onClick={handleStartCall}
              disabled={loading}
              sx={{ borderRadius: '20px', px: 4 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Start Video Call'}
            </Button>
          </Box>
        ) : (
          <Box>
            {/* Progress bar showing remaining time */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Session Duration: {formatTime(timeRemaining)} remaining
              </Typography>
              <LinearProgress
                variant="determinate"
                value={getProgressPercentage()}
                sx={{
                  mt: 1,
                  height: 8,
                  backgroundColor: '#f0f0f0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor:
                      timeRemaining < 300
                        ? '#ff9800'
                        : timeRemaining < 60
                        ? '#f44336'
                        : '#4caf50',
                  },
                }}
              />
            </Box>

            {/* Jitsi Meet iframe container */}
            <Box
              id="jitsi-container"
              sx={{
                width: '100%',
                height: 500,
                borderRadius: 1,
                overflow: 'hidden',
                backgroundColor: '#000',
              }}
            />

            {/* Warning when time is running out */}
            {timeRemaining < 300 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Your video conference session will end in {formatTime(timeRemaining)}. Please wrap up your conversation.
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={() => !sessionData && onClose()} color="inherit">
          {sessionData ? 'Minimize' : 'Close'}
        </Button>
        {sessionData && (
          <Button
            onClick={() => handleEndCall('user-ended')}
            variant="contained"
            color="error"
            startIcon={<CallEndIcon />}
          >
            End Call
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default VideoConferenceDialog;
