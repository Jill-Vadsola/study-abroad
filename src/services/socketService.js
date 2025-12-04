import io from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = {};
    this.isConnecting = false;
  }

  connect(userId) {
    // Prevent multiple connection attempts
    if (this.socket?.connected || this.isConnecting) {
      console.log("Socket already connected or connecting");
      return;
    }

    this.isConnecting = true;
    const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";

    console.log("Attempting to connect socket to:", backendUrl);

    this.socket = io(backendUrl, {
      query: {
        userId,
      },
      reconnection: true,
      reconnectionDelay: 3000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: 3,
      transports: ["websocket", "polling"],
    });

    this.socket.on("connect", () => {
      this.isConnecting = false;
      console.log("Socket connected successfully, socket ID:", this.socket.id);
      this.emit("connected", { message: "Connected to chat server" });
    });

    this.socket.on("connection_established", (data) => {
      this.isConnecting = false;
      console.log("Socket connection established:", data);
      this.emit("connected", data);
    });

    this.socket.on("receive_message", (data) => {
      console.log("Message received:", data);
      this.emit("message_received", data);
    });

    this.socket.on("message_sent", (data) => {
      console.log("Message sent confirmed:", data);
      this.emit("message_confirmed", data);
    });

    this.socket.on("user_typing", (data) => {
      console.log("User typing:", data);
      this.emit("typing_status", data);
    });

    this.socket.on("messages_marked_read", (data) => {
      console.log("Messages marked as read:", data);
      this.emit("read_confirmation", data);
    });

    this.socket.on("unread_count", (data) => {
      console.log("Unread count:", data);
      this.emit("unread_count_updated", data);
    });

    this.socket.on("online_users", (data) => {
      console.log("Online users:", data);
      this.emit("online_users_updated", data);
    });

    // Video call notifications
    this.socket.on("incoming-call", (data) => {
      console.log("Incoming video call notification:", data);
      this.emit("incoming_call", data);
    });

    this.socket.on("call-ended", (data) => {
      console.log("Video call ended notification:", data);
      this.emit("call_ended", data);
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
      this.isConnecting = false;
      this.emit("error", error);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      this.isConnecting = false;
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
      this.isConnecting = false;
      this.emit("disconnected");
    });

    // Register user for video call notifications
    if (userId) {
      console.log(`Emitting register event with userId: ${userId}`);
      this.socket.emit("register", { userId });
      console.log(`User ${userId} registered for video call notifications`);
    } else {
      console.warn('socketService.connect called without userId');
    }
  }

  disconnect() {
    if (this.socket?.connected) {
      this.socket.disconnect();
    }
  }

  sendMessage(recipientId, message, messageType = "text") {
    if (!this.socket?.connected) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit("send_message", {
      recipientId,
      message,
      messageType,
    });
  }

  notifyTyping(recipientId) {
    if (!this.socket?.connected) return;
    this.socket.emit("typing", { recipientId });
  }

  notifyStopTyping(recipientId) {
    if (!this.socket?.connected) return;
    this.socket.emit("stop_typing", { recipientId });
  }

  markAsRead(messageIds) {
    if (!this.socket?.connected) return;
    this.socket.emit("mark_as_read", { messageIds });
  }

  getUnreadCount() {
    if (!this.socket?.connected) return;
    this.socket.emit("get_unread_count");
  }

  broadcastOnline(userId) {
    if (!this.socket?.connected) return;
    this.socket.emit("user_online", { userId });
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(data));
    }
  }

  isConnected() {
    return this.socket?.connected ?? false;
  }
}

export default new SocketService();
