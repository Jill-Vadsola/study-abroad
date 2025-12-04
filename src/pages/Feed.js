import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Avatar,
  IconButton,
  Button,
  TextField,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Menu,
  MenuItem,
  Paper,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Comment,
  Share,
  MoreVert,
  Add,
  Send,
  Image,
  Link,
  Public,
  Group,
  Lock,
  Close,
  EmojiEmotions,
  AttachFile,
} from '@mui/icons-material';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../contexts/ToastContext';
import feedApi from '../services/feedApi';
import ImageUpload, { PostImageUpload } from '../components/ImageUpload';

// Format time helper
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = diffInHours / 24;

  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  } else if (diffInDays < 7) {
    return `${Math.floor(diffInDays)}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};

// Memoized PostCard component
const PostCard = React.memo(({
  post,
  user,
  commentStates,
  onLike,
  onShare,
  onComment,
  onCommentStateChange
}) => {
  const isLiked = post.interactions?.likes?.some(like => like.userId === user?.id);

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        {/* Post Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={post.author?.profileImage}
            alt={post.author?.name}
            sx={{ mr: 2 }}
          >
            {post.author?.name?.charAt(0)}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {post.author?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {post.author?.role} • {formatTimeAgo(post.createdAt)}
            </Typography>
          </Box>
          <IconButton size="small">
            <MoreVert />
          </IconButton>
        </Box>

        {/* Post Content */}
        <Typography variant="body1" sx={{ mb: 2 }}>
          {post.content}
        </Typography>

        {/* Post Tags */}
        {post.tags?.length > 0 && (
          <Box sx={{ mb: 2 }}>
            {post.tags.map((tag, index) => (
              <Chip
                key={index}
                label={`#${tag}`}
                size="small"
                variant="outlined"
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>
        )}

        {/* Post Images */}
        {post.images?.length > 0 && (
          <Box sx={{ mb: 2 }}>
            {post.images.map((image, index) => {
              console.log('Rendering image:', image);
              return (
                <Box
                  key={index}
                  component="img"
                  src={image}
                  alt="Post image"
                  onError={(e) => console.error('Image failed to load:', image, e)}
                  onLoad={() => console.log('Image loaded successfully:', image)}
                  sx={{
                    width: '100%',
                    maxHeight: 400,
                    objectFit: 'cover',
                    borderRadius: 1,
                    mb: 1
                  }}
                />
              );
            })}
          </Box>
        )}

        {/* Link Preview */}
        {post.linkUrl && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" color="primary">
              {post.linkTitle || 'Link'}
            </Typography>
            {post.linkDescription && (
              <Typography variant="body2" color="text.secondary">
                {post.linkDescription}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              {post.linkUrl}
            </Typography>
          </Paper>
        )}

        {/* Post Stats */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {post.stats?.likes} likes • {post.stats?.comments} comments • {post.stats?.shares} shares
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {post.stats?.views} views
          </Typography>
        </Box>
      </CardContent>

      <Divider />

      {/* Post Actions */}
      <CardActions sx={{ justifyContent: 'space-around' }}>
        <Button
          startIcon={isLiked ? <Favorite /> : <FavoriteBorder />}
          onClick={() => onLike(post.id)}
          color={isLiked ? 'error' : 'inherit'}
          size="small"
        >
          Like
        </Button>
        <Button startIcon={<Comment />} size="small">
          Comment
        </Button>
        <Button
          startIcon={<Share />}
          onClick={() => onShare(post.id)}
          size="small"
        >
          Share
        </Button>
      </CardActions>

      <Divider />

      {/* Comments Section */}
      <Box sx={{ p: 2 }}>
        {/* Recent Comments */}
        {post.interactions?.comments?.slice(-3).map((comment, index) => (
          <Box key={index} sx={{ display: 'flex', mb: 1 }}>
            <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
              U
            </Avatar>
            <Box>
              <Typography variant="body2">
                <strong>User</strong> {comment.content}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatTimeAgo(comment.createdAt)}
              </Typography>
            </Box>
          </Box>
        ))}

        {/* Add Comment */}
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
            {user?.firstName?.charAt(0)}
          </Avatar>
          <TextField
            fullWidth
            size="small"
            placeholder="Write a comment..."
            value={commentStates[post.id] || ''}
            onChange={(e) => onCommentStateChange(post.id, e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onComment(post.id);
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => onComment(post.id)}
                    disabled={!commentStates[post.id]?.trim()}
                  >
                    <Send />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>
      </Box>
    </Card>
  );
});

PostCard.displayName = 'PostCard';

const Feed = () => {
  const { user } = useUser();
  const toast = useToast();
  
  // State management
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Create post state
  const [newPost, setNewPost] = useState({
    content: '',
    type: 'text',
    visibility: 'public',
    tags: [],
    images: [],
    linkUrl: '',
    linkTitle: '',
    linkDescription: ''
  });
  
  // Comment states for each post
  const [commentStates, setCommentStates] = useState({});

  useEffect(() => {
    loadInitialFeed();
  }, []);

  const loadInitialFeed = async () => {
    try {
      setLoading(true);
      const response = await feedApi.getFeed(1, 20);
      if (response?.posts) {
        setPosts(response.posts);
        setHasMore(response.pagination?.hasNext || false);
        setPage(1);
      }
    } catch (error) {
      console.error('Failed to load feed:', error);
      toast.showError('Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const response = await feedApi.getFeed(nextPage, 20);
      
      if (response?.posts) {
        setPosts(prev => [...prev, ...response.posts]);
        setHasMore(response.pagination?.hasNext || false);
        setPage(nextPage);
      }
    } catch (error) {
      console.error('Failed to load more posts:', error);
      toast.showError('Failed to load more posts');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.content.trim()) {
      toast.showError('Please enter post content');
      return;
    }

    try {
      const postData = {
        content: newPost.content,
        type: newPost.type,
        visibility: newPost.visibility,
        tags: newPost.tags,
        images: newPost.images,
        linkUrl: newPost.linkUrl || undefined,
        linkTitle: newPost.linkTitle || undefined,
        linkDescription: newPost.linkDescription || undefined,
      };

      const response = await feedApi.createPost(postData);
      if (response) {
        // Add new post to the top of the feed
        setPosts(prev => [response, ...prev]);
        setCreatePostOpen(false);
        // Reset form
        setNewPost({
          content: '',
          type: 'text',
          visibility: 'public',
          tags: [],
          images: [],
          linkUrl: '',
          linkTitle: '',
          linkDescription: ''
        });
      }
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const handleLike = useCallback(async (postId) => {
    try {
      const response = await feedApi.toggleLike(postId);
      if (response) {
        // Update the post in the feed
        setPosts(prev => prev.map(post =>
          post.id === postId ? response.post : post
        ));
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  }, []);

  const handleComment = useCallback(async (postId) => {
    const commentContent = commentStates[postId] || '';
    if (!commentContent.trim()) return;

    try {
      const response = await feedApi.addComment(postId, commentContent);
      if (response) {
        // Update the post with new comment
        setPosts(prev => prev.map(post =>
          post.id === postId ? response.post : post
        ));
        // Clear comment input
        setCommentStates(prev => ({ ...prev, [postId]: '' }));
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  }, [commentStates]);

  const handleShare = useCallback(async (postId) => {
    try {
      const response = await feedApi.sharePost(postId);
      if (response) {
        // Update the post with new share count
        setPosts(prev => prev.map(post =>
          post.id === postId ? response.post : post
        ));
      }
    } catch (error) {
      console.error('Failed to share post:', error);
    }
  }, []);

  const updateCommentState = useCallback((postId, value) => {
    setCommentStates(prev => ({ ...prev, [postId]: value }));
  }, []);


  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, pb: 4 }}>
      {/* Create Post FAB */}
      <Fab
        color="primary"
        aria-label="create post"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setCreatePostOpen(true)}
      >
        <Add />
      </Fab>

      {/* Create Post Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar src={user?.profileImageUrl} sx={{ mr: 2 }}>
              {user?.firstName?.charAt(0)}
            </Avatar>
            <TextField
              fullWidth
              placeholder="What's on your mind?"
              variant="outlined"
              onClick={() => setCreatePostOpen(true)}
              InputProps={{ readOnly: true }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          user={user}
          commentStates={commentStates}
          onLike={handleLike}
          onShare={handleShare}
          onComment={handleComment}
          onCommentStateChange={updateCommentState}
        />
      ))}

      {/* Load More Button */}
      {hasMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={loadMorePosts}
            disabled={loadingMore}
            startIcon={loadingMore ? <CircularProgress size={20} /> : null}
          >
            {loadingMore ? 'Loading...' : 'Load More Posts'}
          </Button>
        </Box>
      )}

      {/* Create Post Dialog */}
      <Dialog
        open={createPostOpen}
        onClose={() => setCreatePostOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "12px" } }}
      >
        {/* Dialog Header */}
        <Box sx={{ p: 2.5, borderBottom: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a1a" }}>
            Create Post
          </Typography>
          <IconButton onClick={() => setCreatePostOpen(false)} size="small" sx={{ color: "text.secondary" }}>
            <Close />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 0 }}>
          {/* User Info Section */}
          <Box sx={{ p: 2.5, borderBottom: "1px solid #e0e0e0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar
                src={user?.profileImageUrl}
                sx={{
                  width: 48,
                  height: 48,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  fontWeight: "bold",
                  fontSize: "1.2rem"
                }}
              >
                {user?.firstName?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#1a1a1a" }}>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <FormControl size="small" sx={{ mt: 0.5 }}>
                  <Select
                    value={newPost.visibility}
                    onChange={(e) => setNewPost(prev => ({ ...prev, visibility: e.target.value }))}
                    startAdornment={
                      newPost.visibility === 'public' ? <Public sx={{ mr: 0.75, fontSize: 18 }} /> :
                      newPost.visibility === 'connections' ? <Group sx={{ mr: 0.75, fontSize: 18 }} /> :
                      <Lock sx={{ mr: 0.75, fontSize: 18 }} />
                    }
                    sx={{
                      "& .MuiOutlinedInput-input": { py: 0.5, fontSize: "0.875rem" },
                      "& .MuiOutlinedInput-root": { borderRadius: "6px" }
                    }}
                  >
                    <MenuItem value="public">Public</MenuItem>
                    <MenuItem value="connections">Connections</MenuItem>
                    <MenuItem value="private">Private</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>

          {/* Main Content Section */}
          <Box sx={{ p: 2.5 }}>
            {/* Post Content TextField */}
            <TextField
              fullWidth
              multiline
              rows={5}
              placeholder="What's on your mind?"
              value={newPost.content}
              onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
              variant="outlined"
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #e0e0e0",
                  fontSize: "0.95rem",
                  "& fieldset": { border: "none" },
                  "&:hover": { backgroundColor: "#f0f0f0" },
                  "&.Mui-focused": {
                    backgroundColor: "white",
                    "& fieldset": { border: "2px solid #667eea" },
                  },
                },
              }}
            />

            {/* Link Content Section */}
            {newPost.type === 'link' && (
              <Paper sx={{ p: 2, mb: 2, backgroundColor: "#f9f9f9", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
                <TextField
                  fullWidth
                  label="Link URL"
                  value={newPost.linkUrl}
                  onChange={(e) => setNewPost(prev => ({ ...prev, linkUrl: e.target.value }))}
                  sx={{ mb: 1.5 }}
                  variant="outlined"
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Link Title (optional)"
                  value={newPost.linkTitle}
                  onChange={(e) => setNewPost(prev => ({ ...prev, linkTitle: e.target.value }))}
                  sx={{ mb: 1.5 }}
                  variant="outlined"
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Link Description (optional)"
                  value={newPost.linkDescription}
                  onChange={(e) => setNewPost(prev => ({ ...prev, linkDescription: e.target.value }))}
                  variant="outlined"
                  size="small"
                  multiline
                  rows={2}
                />
              </Paper>
            )}

            {/* Image Upload Section */}
            <Box sx={{ mb: 2 }}>
              <PostImageUpload
                onUploadSuccess={(result) => {
                  setNewPost(prev => ({
                    ...prev,
                    images: result.imageUrls || [result.fileUrl],
                    type: 'image'
                  }));
                }}
                disabled={false}
                maxImages={5}
              />

              {/* Show selected images grid */}
              {newPost.images.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "#1a1a1a", display: "block", mb: 1 }}>
                    SELECTED IMAGES ({newPost.images.length}/5)
                  </Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 1 }}>
                    {newPost.images.map((imageUrl, index) => (
                      <Box
                        key={index}
                        sx={{
                          position: "relative",
                          aspectRatio: "1",
                          borderRadius: "8px",
                          overflow: "hidden",
                          border: "2px solid #e0e0e0",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            borderColor: "#667eea",
                            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
                          }
                        }}
                      >
                        <Box
                          component="img"
                          src={imageUrl}
                          alt={`Selected ${index + 1}`}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                          }}
                        />
                        <IconButton
                          sx={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            bgcolor: "rgba(0, 0, 0, 0.6)",
                            color: "white",
                            p: 0.5,
                            width: 28,
                            height: 28,
                            "&:hover": {
                              bgcolor: "rgba(0, 0, 0, 0.8)",
                            },
                          }}
                          size="small"
                          onClick={() => {
                            setNewPost(prev => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== index)
                            }));
                          }}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>

            {/* Content Actions Toolbar */}
            <Box sx={{
              p: 1.5,
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
              display: "flex",
              gap: 0.5,
              border: "1px solid #e0e0e0"
            }}>
              <Chip
                icon={<Link />}
                label="Link"
                onClick={() => setNewPost(prev => ({ ...prev, type: prev.type === 'link' ? 'text' : 'link' }))}
                variant={newPost.type === 'link' ? 'filled' : 'outlined'}
                color={newPost.type === 'link' ? 'primary' : 'default'}
                sx={{ borderRadius: "6px" }}
              />
            </Box>
          </Box>
        </DialogContent>

        {/* Dialog Actions */}
        <Box sx={{ p: 2.5, borderTop: "1px solid #e0e0e0", display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
          <Button
            onClick={() => setCreatePostOpen(false)}
            sx={{
              textTransform: "none",
              color: "#666",
              borderRadius: "8px",
              px: 2.5
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreatePost}
            disabled={!newPost.content.trim()}
            startIcon={<Send sx={{ fontSize: "18px" }} />}
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              px: 3,
              fontWeight: 600,
              background: newPost.content.trim() ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : undefined,
            }}
          >
            Post
          </Button>
        </Box>
      </Dialog>
    </Container>
  );
};

export default Feed;