import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Container,
  Grid,
  Paper,
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Badge,
  InputAdornment,
  Chip,
  Button,
  useTheme,
  useMediaQuery,
  Drawer,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import {
  Send,
  Search,
  AttachFile,
  EmojiEmotions,
  Menu,
  Close,
  Circle,
  Add,
} from "@mui/icons-material";
import { useUser } from "../contexts/UserContext";
import { useToast } from "../contexts/ToastContext";
import chatApi from "../services/chatApi";
import socketService from "../services/socketService";
import { connectionsApi } from "../services/connectionsApi";

const Chat = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user } = useUser();
  const toast = useToast();
  const location = useLocation();

  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);
  const [availableConnections, setAvailableConnections] = useState([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const messagesEndRef = useRef(null);

  // Load conversations on mount
  useEffect(() => {
    if (user?.id) {
      loadConversations();
      socketService.connect(user.id);

      // Listen for incoming messages
      socketService.on("message_received", handleIncomingMessage);
      socketService.on("typing_status", handleTypingStatus);
      socketService.on("disconnected", () => {
        setTimeout(() => socketService.connect(user.id), 3000);
      });

      // Polling: Check for new messages every 2 seconds when a chat is selected
      const pollInterval = setInterval(() => {
        if (selectedChat?.userId) {
          const userId = selectedChat.userId;
          chatApi.getConversation(userId)
            .then(response => {
              let messagesData = [];
              if (Array.isArray(response)) {
                messagesData = response;
              } else if (response.data && Array.isArray(response.data)) {
                messagesData = response.data;
              }

              if (messagesData.length > 0) {
                const formattedMessages = messagesData.map((msg) => ({
                  id: msg._id,
                  senderId: msg.senderId._id || msg.senderId,
                  text: msg.message,
                  timestamp: new Date(msg.timestamp).toLocaleTimeString(),
                  isOwn: (msg.senderId._id || msg.senderId) === user.id,
                  isRead: msg.isRead,
                }));

                setMessages((prev) => {
                  const prevCount = prev[userId]?.length || 0;
                  if (prevCount !== formattedMessages.length) {
                    return {
                      ...prev,
                      [userId]: formattedMessages,
                    };
                  }
                  return prev;
                });
              }
            })
            .catch(() => {
              // Silently fail on poll errors
            });
        }
      }, 2000);

      return () => {
        socketService.off("message_received", handleIncomingMessage);
        socketService.off("typing_status", handleTypingStatus);
        clearInterval(pollInterval);
      };
    }
  }, [user?.id, selectedChat?.userId]);

  // Handle navigation from other pages (Connections, Dashboard)
  useEffect(() => {
    if (location.state?.selectedUser && conversations.length > 0) {
      const selectedUser = location.state.selectedUser;
      const userId = selectedUser.userId || selectedUser.id;

      // Check if user is in conversations
      const existingConversation = conversations.find((conv) => conv.userId === userId);

      if (existingConversation) {
        // Chat exists, select it
        handleChatSelect(existingConversation);
      } else {
        // Start new chat with the user
        handleStartNewChat({
          id: userId,
          userId,
          name: selectedUser.name,
          avatar: selectedUser.avatar,
          university: selectedUser.university,
          lastMessage: "No messages yet",
          lastMessageTime: "Just now",
          isOnline: true,
          status: "online",
        });
      }

      // Clear the state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.selectedUser, conversations]);

  // Load conversations from API
  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await chatApi.getUserConversations();

      const conversationData = Array.isArray(response)
        ? response
        : response?.success && response?.data
        ? response.data
        : Array.isArray(response?.data)
        ? response.data
        : [];

      if (conversationData && conversationData.length > 0) {
        const conversationList = conversationData.map((conv) => {
          const otherParticipant = conv.user;

          if (!otherParticipant) {
            return null;
          }

          const userId = otherParticipant._id || otherParticipant.id;

          return {
            id: userId,
            name: `${otherParticipant.firstName || "Unknown"} ${otherParticipant.lastName || ""}`.trim(),
            university: otherParticipant.studentProfile?.university || otherParticipant.university || "Unknown",
            avatar: otherParticipant.profileImageUrl,
            lastMessage: conv.lastMessage || "No messages yet",
            lastMessageTime: formatTime(conv.lastMessageTime),
            unreadCount: conv.unreadCount || 0,
            isOnline: true,
            status: "online",
            userId,
          };
        }).filter(Boolean);

        setConversations(conversationList);
      } else {
        setConversations([]);
      }
    } catch (error) {
      toast.showError(
        error.response?.data?.message || error.message || "Failed to load conversations"
      );
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle incoming messages via Socket
  const handleIncomingMessage = (data) => {
    const { senderId, message: messageText, timestamp, id } = data;

    setMessages((prev) => ({
      ...prev,
      [senderId]: [
        ...(prev[senderId] || []),
        {
          id,
          senderId,
          text: messageText,
          timestamp: new Date(timestamp).toLocaleTimeString(),
          isOwn: false,
          isRead: false,
        },
      ],
    }));

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.userId === senderId) {
          return {
            ...conv,
            lastMessage: messageText,
            lastMessageTime: formatTime(timestamp),
            unreadCount: conv.unreadCount + 1,
          };
        }
        return conv;
      })
    );

    if (selectedChat?.userId === senderId) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  // Handle typing indicators
  const handleTypingStatus = (data) => {
    const { userId, isTyping } = data;
    setTypingUsers((prev) => ({
      ...prev,
      [userId]: isTyping,
    }));
  };

  // Format time for display
  const formatTime = (date) => {
    if (!date) return "Just now";
    const now = new Date();
    const msgDate = new Date(date);
    const diffMs = now - msgDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return msgDate.toLocaleDateString();
  };

  // Load conversation messages
  const loadConversationMessages = async (userId) => {
    if (!userId) {
      return;
    }

    try {
      const response = await chatApi.getConversation(userId);

      let messagesData = [];

      if (Array.isArray(response)) {
        messagesData = response;
      } else if (response.success && Array.isArray(response.data)) {
        messagesData = response.data;
      } else if (response.data && Array.isArray(response.data)) {
        messagesData = response.data;
      }

      if (messagesData.length > 0) {
        const formattedMessages = messagesData.map((msg) => ({
          id: msg._id,
          senderId: msg.senderId._id || msg.senderId,
          text: msg.message,
          timestamp: new Date(msg.timestamp).toLocaleTimeString(),
          isOwn: (msg.senderId._id || msg.senderId) === user.id,
          isRead: msg.isRead,
        }));

        setMessages((prev) => ({
          ...prev,
          [userId]: formattedMessages,
        }));
      } else {
        setMessages((prev) => ({
          ...prev,
          [userId]: [],
        }));
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.showError(error.response?.data?.message || error.message || "Failed to load messages");
      }

      setMessages((prev) => ({
        ...prev,
        [userId]: [],
      }));
    } finally {
      setLoadingMessages((prev) => ({
        ...prev,
        [userId]: false,
      }));
    }
  };

  // Load available connections for new chat
  const loadAvailableConnections = async () => {
    try {
      setLoadingConnections(true);
      const response = await connectionsApi.getUserConnections("accepted");

      const connectionsList = Array.isArray(response) ? response : response?.data || [];

      if (connectionsList.length > 0) {
        const conversationUserIds = conversations.map((c) => c.userId);
        const available = connectionsList.filter(
          (conn) => !conversationUserIds.includes(conn.otherUser?._id)
        );

        const formatted = available.map((conn) => {
          let userId = conn.otherUser?._id ||
                       conn.otherUser?.id ||
                       conn._id ||
                       conn.id;

          if (!userId && conn.otherUser) {
            userId = Object.values(conn.otherUser).find(
              (val) => typeof val === "string" && val.length === 24
            );
          }

          const otherUser = conn.otherUser || conn.user || conn;

          return {
            id: userId,
            name: `${otherUser?.firstName || "Unknown"} ${otherUser?.lastName || ""}`.trim(),
            university:
              otherUser?.profile?.university ||
              otherUser?.studentProfile?.university ||
              otherUser?.university ||
              "Unknown",
            avatar: otherUser?.profileImageUrl || otherUser?.avatar,
            userId,
          };
        });

        setAvailableConnections(formatted);
      } else {
        setAvailableConnections([]);
      }
    } catch (error) {
      toast.showError("Failed to load available connections");
      setAvailableConnections([]);
    } finally {
      setLoadingConnections(false);
    }
  };

  // Start new chat with a connection
  const handleStartNewChat = (connection) => {
    setSelectedChat(connection);
    setNewChatDialogOpen(false);
    // Initialize empty messages array for new conversation
    if (!messages[connection.userId]) {
      setMessages((prev) => ({
        ...prev,
        [connection.userId]: [],
      }));
      setLoadingMessages((prev) => ({
        ...prev,
        [connection.userId]: false,
      }));
    }
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  const filteredContacts = conversations.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.university.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat) return;

    const messageText = message.trim();
    const recipientId = selectedChat.userId || selectedChat.id;

    if (!recipientId) {
      console.error("No recipient ID available", selectedChat);
      toast.showError("Invalid recipient. Please try again.");
      return;
    }

    // Validate MongoDB ObjectId format (24 hex characters)
    const isValidObjectId = /^[0-9a-f]{24}$/i.test(recipientId);

    if (!isValidObjectId) {
      toast.showError("Invalid recipient. Please try again.");
      return;
    }

    setSendingMessage(true);

    try {
      // Send via API (also broadcasts via Socket)
      await chatApi.sendMessage(recipientId, messageText);

      // Optimistically add message to UI
      const newMessage = {
        id: Date.now(),
        senderId: user.id,
        text: messageText,
        timestamp: new Date().toLocaleTimeString(),
        isOwn: true,
        isRead: true,
      };

      setMessages((prev) => ({
        ...prev,
        [recipientId]: [...(prev[recipientId] || []), newMessage],
      }));

      setMessage("");

      // Auto-scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.showError(error.message || "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleChatSelect = (contact) => {
    setSelectedChat(contact);
    const chatUserId = contact.userId || contact.id;

    if (chatUserId) {
      setLoadingMessages((prev) => ({
        ...prev,
        [chatUserId]: true,
      }));
      if (!messages[chatUserId]) {
        setMessages((prev) => ({
          ...prev,
          [chatUserId]: [],
        }));
      }
      loadConversationMessages(chatUserId);
    }
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedChat]);

  const chatList = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: "#fafafa" }}>
      {/* Search Header */}
      <Box sx={{ p: 2.5, borderBottom: 1, borderColor: "divider", backgroundColor: "white" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight="bold" sx={{ color: "#1a1a1a" }}>
            Messages
          </Typography>
          <Button
            startIcon={<Add />}
            size="small"
            onClick={() => {
              loadAvailableConnections();
              setNewChatDialogOpen(true);
            }}
            variant="contained"
            sx={{ textTransform: "none", borderRadius: "20px", px: 2 }}
          >
            New Chat
          </Button>
        </Box>
        <TextField
          fullWidth
          size="small"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "24px",
              backgroundColor: "#f0f0f0",
              border: "none",
              "& fieldset": { border: "none" },
              "&:hover": { backgroundColor: "#e8e8e8" },
              "&.Mui-focused": {
                backgroundColor: "white",
                "& fieldset": { border: "2px solid #667eea" },
              },
            },
          }}
        />
      </Box>

      {/* Contacts List */}
      <List sx={{ flexGrow: 1, overflow: "auto" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress size={40} />
          </Box>
        ) : filteredContacts.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {conversations.length === 0
                ? "No conversations yet. Start a new chat!"
                : "No matching conversations"}
            </Typography>
          </Box>
        ) : (
          filteredContacts.map((contact) => (
            <React.Fragment key={contact.id}>
            <ListItem
              button
              onClick={() => handleChatSelect(contact)}
              selected={selectedChat?.id === contact.id}
              sx={{
                mx: 1,
                my: 0.5,
                borderRadius: "12px",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "#f0f0f0",
                },
                "&.Mui-selected": {
                  backgroundColor: "#667eea15",
                  borderLeft: "4px solid #667eea",
                  pl: 1.5,
                  "&:hover": {
                    backgroundColor: "#667eea20",
                  },
                },
              }}
            >
              <ListItemAvatar>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  badgeContent={
                    contact.isOnline ? (
                      <Circle sx={{ color: "success.main", fontSize: 12 }} />
                    ) : null
                  }
                >
                  <Avatar
                    src={contact.avatar}
                    sx={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      width: 56,
                      height: 56,
                      fontWeight: "bold",
                      fontSize: "1.25rem",
                    }}
                  >
                    {!contact.avatar &&
                      contact.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 1,
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="600" sx={{ color: "#1a1a1a" }}>
                      {contact.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                      {contact.lastMessageTime}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: "0.7rem", display: "block", mb: 0.5 }}
                    >
                      {contact.university}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      {contact.unreadCount > 0 && (
                        <Badge
                          badgeContent={contact.unreadCount}
                          color="primary"
                          sx={{
                            "& .MuiBadge-badge": {
                              height: 20,
                              minWidth: 20,
                              borderRadius: "10px",
                              fontSize: "0.65rem",
                            },
                          }}
                        />
                      )}
                      <Typography
                        variant="body2"
                        color={contact.unreadCount > 0 ? "#1a1a1a" : "text.secondary"}
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontWeight: contact.unreadCount > 0 ? "500" : "400",
                          fontSize: "0.85rem",
                        }}
                      >
                        {contact.lastMessage}
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          </React.Fragment>
          ))
        )}
      </List>
    </Box>
  );

  const chatWindow = selectedChat ? (() => {
    return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Chat Header */}
      <Paper elevation={1} sx={{ p: 2, borderRadius: 0, borderBottom: "1px solid #e0e0e0" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {isMobile && (
              <IconButton onClick={() => setMobileDrawerOpen(true)}>
                <Menu />
              </IconButton>
            )}
            <Avatar
              src={selectedChat.avatar}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                width: 50,
                height: 50,
                fontWeight: "bold",
              }}
            >
              {!selectedChat.avatar &&
                selectedChat.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="600" sx={{ color: "#1a1a1a" }}>
                {selectedChat.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                {selectedChat.status}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Messages Area */}
      <Box
        sx={{ flexGrow: 1, overflow: "auto", p: 3, backgroundColor: "#ffffff" }}
      >
        {loadingMessages[selectedChat.userId] ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            <CircularProgress />
          </Box>
        ) : messages[selectedChat.userId] && messages[selectedChat.userId].length === 0 ? (
          <Box sx={{ textAlign: "center", p: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <Typography variant="body2" color="text.secondary">
              No messages yet. Say hello!
            </Typography>
          </Box>
        ) : messages[selectedChat.userId] && messages[selectedChat.userId].length > 0 ? (
          <>
            {messages[selectedChat.userId]?.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: "flex",
                  justifyContent: msg.isOwn ? "flex-end" : "flex-start",
                  mb: 2.5,
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    px: 2,
                    maxWidth: "65%",
                    backgroundColor: msg.isOwn ? "#667eea" : "#f0f0f0",
                    color: msg.isOwn ? "white" : "#1a1a1a",
                    borderRadius: msg.isOwn
                      ? "20px 20px 4px 20px"
                      : "20px 20px 20px 4px",
                    wordBreak: "break-word",
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <Typography variant="body2" sx={{ lineHeight: 1.5 }}>{msg.text}</Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      textAlign: "right",
                      mt: 0.75,
                      opacity: msg.isOwn ? 0.85 : 0.7,
                      fontSize: "0.7rem",
                    }}
                  >
                    {msg.timestamp}
                  </Typography>
                </Paper>
              </Box>
            ))}
            {typingUsers[selectedChat.userId] && (
              <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {selectedChat.name} is typing
                </Typography>
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  {[0, 1, 2].map((i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: "text.secondary",
                        animation: `bounce 1.4s infinite`,
                        animationDelay: `${i * 0.2}s`,
                        "@keyframes bounce": {
                          "0%, 80%, 100%": { opacity: 0.5 },
                          "40%": { opacity: 1 },
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ textAlign: "center", p: 3 }}>
            <Typography color="text.secondary">
              Unable to load messages. Please try again.
            </Typography>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Paper elevation={1} sx={{ p: 2, borderRadius: 0, borderTop: "1px solid #e0e0e0", backgroundColor: "white" }}>
        <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
          <IconButton size="small" disabled={sendingMessage} sx={{ color: "text.secondary" }}>
            <AttachFile />
          </IconButton>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sendingMessage}
            variant="outlined"
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "24px",
                backgroundColor: "#f5f5f5",
                border: "none",
                "& fieldset": { border: "none" },
                "&:hover": { backgroundColor: "#f0f0f0" },
                "&.Mui-focused": {
                  backgroundColor: "white",
                  "& fieldset": { border: "2px solid #667eea" },
                },
              },
              "& .MuiOutlinedInput-input": {
                padding: "12px 16px",
                fontSize: "0.95rem",
              },
            }}
          />
          <IconButton size="small" disabled={sendingMessage} sx={{ color: "text.secondary" }}>
            <EmojiEmotions />
          </IconButton>
          <IconButton
            onClick={handleSendMessage}
            disabled={!message.trim() || sendingMessage}
            sx={{
              color: "primary.main",
              backgroundColor: "#667eea10",
              borderRadius: "50%",
              width: 40,
              height: 40,
              "&:hover": {
                backgroundColor: "#667eea20",
              },
              "&.Mui-disabled": {
                color: "action.disabled",
              },
            }}
          >
            {sendingMessage ? (
              <CircularProgress size={20} />
            ) : (
              <Send />
            )}
          </IconButton>
        </Box>
      </Paper>
    </Box>
    );
  })() : (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        p: 4,
        backgroundColor: "#ffffff",
      }}
    >
      <Box sx={{ mb: 3, p: 3, backgroundColor: "#f5f5f5", borderRadius: "50%", width: 100, height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography sx={{ fontSize: "3rem" }}>💬</Typography>
      </Box>
      <Typography variant="h6" sx={{ color: "#1a1a1a", mb: 1, fontWeight: 600 }}>
        No conversation selected
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 300 }}>
        Select a conversation from the list to start chatting or create a new chat with a connection.
      </Typography>
      <Button
        variant="contained"
        onClick={() => isMobile && setMobileDrawerOpen(true)}
        sx={{ borderRadius: "20px", textTransform: "none", px: 3 }}
      >
        {isMobile ? "Open Conversations" : "Select a Conversation"}
      </Button>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3, height: "calc(100vh - 100px)", display: "flex", flexDirection: "column" }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: "#1a1a1a" }}>
          Messages
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Connect and chat with fellow international students in real-time.
        </Typography>
      </Box>

      <Paper elevation={1} sx={{ height: "100%", overflow: "hidden", borderRadius: "12px", border: "1px solid #e0e0e0" }}>
        {isMobile ? (
          <>
            {/* Mobile Layout */}
            <Drawer
              variant="temporary"
              anchor="left"
              open={mobileDrawerOpen}
              onClose={() => setMobileDrawerOpen(false)}
              ModalProps={{ keepMounted: true }}
              sx={{
                "& .MuiDrawer-paper": { width: 280, boxSizing: "border-box" },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 2,
                }}
              >
                <Typography variant="h6">Conversations</Typography>
                <IconButton onClick={() => setMobileDrawerOpen(false)}>
                  <Close />
                </IconButton>
              </Box>
              {chatList}
            </Drawer>
            {chatWindow}
          </>
        ) : (
          <Grid container sx={{ height: "100%" }}>
            {/* Desktop Layout */}
            <Grid
              item
              xs={3.5}
              sx={{ borderRight: "1px solid #e0e0e0", height: "100%" }}
            >
              {chatList}
            </Grid>
            <Grid item xs={8.5} sx={{ height: "100%" }}>
              {chatWindow}
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* New Chat Dialog */}
      <Dialog
        open={newChatDialogOpen}
        onClose={() => setNewChatDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Start New Chat</DialogTitle>
        <DialogContent sx={{ minHeight: 300 }}>
          {loadingConnections ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : availableConnections.length === 0 ? (
            <Box sx={{ textAlign: "center", p: 3 }}>
              <Typography color="text.secondary">
                {conversations.length === 0
                  ? "You don't have any connections yet"
                  : "You're already chatting with all your connections"}
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {availableConnections.map((connection) => (
                <ListItem
                  key={connection.id}
                  button
                  onClick={() => handleStartNewChat(connection)}
                  sx={{
                    p: 1.5,
                    mb: 1,
                    bgcolor: "grey.50",
                    borderRadius: 1,
                    "&:hover": { bgcolor: "grey.100" },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={connection.avatar}
                      sx={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      }}
                    >
                      {!connection.avatar &&
                        connection.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={connection.name}
                    secondary={connection.university}
                    primaryTypographyProps={{
                      variant: "body2",
                      sx: { fontWeight: 500 },
                    }}
                    secondaryTypographyProps={{ variant: "caption" }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Chat;
