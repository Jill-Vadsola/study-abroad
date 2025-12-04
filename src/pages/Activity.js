import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Button,
  Divider,
} from '@mui/material';
import {
  Favorite,
  Comment,
  Share,
  PersonAdd,
  School,
  Work,
  Event,
  Message,
  Notifications,
  TrendingUp,
} from '@mui/icons-material';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../contexts/ToastContext';
import feedApi from '../services/feedApi';

const Activity = () => {
  const { user } = useUser();
  const toast = useToast();
  
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadInitialActivity();
  }, []);

  const loadInitialActivity = async () => {
    try {
      setLoading(true);
      const response = await feedApi.getActivity(1, 50);
      if (response?.activities) {
        setActivities(response.activities);
        setHasMore(response.pagination?.hasNext || false);
        setPage(1);
      }
    } catch (error) {
      console.error('Failed to load activity:', error);
      toast.showError('Failed to load activity feed');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreActivity = async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const response = await feedApi.getActivity(nextPage, 50);
      
      if (response?.activities) {
        setActivities(prev => [...prev, ...response.activities]);
        setHasMore(response.pagination?.hasNext || false);
        setPage(nextPage);
      }
    } catch (error) {
      console.error('Failed to load more activity:', error);
      toast.showError('Failed to load more activity');
    } finally {
      setLoadingMore(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'post_liked': return <Favorite color="error" />;
      case 'post_commented': return <Comment color="primary" />;
      case 'post_shared': return <Share color="action" />;
      case 'connection_accepted': return <PersonAdd color="success" />;
      case 'connection_requested': return <PersonAdd color="warning" />;
      case 'profile_updated': return <School color="info" />;
      case 'mentor_request': return <Work color="secondary" />;
      case 'university_application': return <School color="primary" />;
      case 'message_sent': return <Message color="info" />;
      case 'event_registered': return <Event color="primary" />;
      case 'achievement_earned': return <TrendingUp color="success" />;
      default: return <Notifications />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'post_liked': return 'error';
      case 'post_commented': return 'primary';
      case 'connection_accepted': return 'success';
      case 'mentor_request': return 'secondary';
      case 'achievement_earned': return 'success';
      default: return 'default';
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = diffInMs / (1000 * 60);
    const diffInHours = diffInMinutes / 60;
    const diffInDays = diffInHours / 24;

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const ActivityItem = ({ activity }) => (
    <ListItem alignItems="flex-start">
      <ListItemAvatar>
        <Avatar 
          src={activity.user?.profileImage}
          sx={{ bgcolor: `${getActivityColor(activity.type)}.light` }}
        >
          {getActivityIcon(activity.type)}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1">
              {activity.description}
            </Typography>
            <Chip
              label={activity.type.replace('_', ' ')}
              size="small"
              color={getActivityColor(activity.type)}
              variant="outlined"
            />
          </Box>
        }
        secondary={
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {formatTimeAgo(activity.timestamp)}
            </Typography>
            {activity.user && activity.user.id !== user?.id && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                by {activity.user.name}
              </Typography>
            )}
          </Box>
        }
      />
    </ListItem>
  );

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, pb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Activity Feed
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Stay updated with recent activities from your network and connections.
      </Typography>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {activities.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Notifications sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No recent activity
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Activity from your connections will appear here
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {activities.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ActivityItem activity={activity} />
                  {index < activities.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Load More Button */}
      {hasMore && activities.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={loadMoreActivity}
            disabled={loadingMore}
            startIcon={loadingMore ? <CircularProgress size={20} /> : null}
          >
            {loadingMore ? 'Loading...' : 'Load More Activity'}
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default Activity;