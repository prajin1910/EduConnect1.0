import { ChevronDown, MessageCircle, Send, User, Users } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useToast } from "../../contexts/ToastContext";
import { activityAPI, chatAPI } from "../../services/api";

interface ChatUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface Conversation {
  user: ChatUser;
  lastMessage: Message | null;
  unreadCount: number;
}

const UserChatEnhanced: React.FC = React.memo(() => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [allUsers, setAllUsers] = useState<ChatUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isSearching, setIsSearching] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Debounce search
    const searchTimeout = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch();
      } else {
        filterUsers();
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery, selectedFilter]);

  useEffect(() => {
    // Update filtered users when allUsers changes
    if (!searchQuery.trim()) {
      filterUsers();
    }
  }, [allUsers]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const performSearch = async () => {
    if (!searchQuery.trim()) {
      filterUsers();
      return;
    }

    setIsSearching(true);
    try {
      filterUsers();
    } catch (error: any) {
      console.error("Search failed:", error);
      filterUsers();
    } finally {
      setIsSearching(false);
    }
  };

  const loadInitialData = async () => {
    try {
      await Promise.all([loadConversations(), loadAllUsers()]);
    } catch (error: any) {
      showToast(error.message || "Failed to load chat data", "error");
    }
  };

  const loadConversations = async () => {
    try {
      const response = await chatAPI.getConversations();
      setConversations(response);
    } catch (error: any) {
      console.error("Failed to load conversations:", error);
      setConversations([]);
    }
  };

  const loadAllUsers = async () => {
    try {
      const response = await chatAPI.getAllUsers();
      setAllUsers(response);
    } catch (error: any) {
      console.error("Failed to load users:", error);
      setAllUsers([]);
      showToast("Failed to load users for chat", "error");
    }
  };

  const filterUsers = () => {
    const currentUserId = getCurrentUserId();
    let filtered = allUsers.filter((user) => user.id !== currentUserId);

    if (selectedFilter !== "all") {
      filtered = filtered.filter((user) => {
        const userRole = user.role.toLowerCase();
        const filterRole = selectedFilter.toLowerCase();
        return userRole === filterRole;
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.email.split("@")[0].toLowerCase().includes(query) ||
          (user.department && user.department.toLowerCase().includes(query))
      );
    }

    setFilteredUsers(filtered);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const selectUser = async (user: ChatUser) => {
    setSelectedUser(user);
    setShowUserDropdown(false);
    setSearchQuery("");

    try {
      const response = await chatAPI.getChatHistory(user.id);
      setMessages(response);

      await chatAPI.markMessagesAsRead(user.id);
      loadConversations();
    } catch (error: any) {
      showToast(error.message || "Failed to load chat history", "error");
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedUser || loading) return;

    setLoading(true);
    try {
      const response = await chatAPI.sendMessage({
        receiverId: selectedUser.id,
        message: newMessage,
      });

      setMessages((prev) => [...prev, response]);
      setNewMessage("");

      loadConversations();

      const activityType =
        selectedUser.role === "ALUMNI"
          ? "ALUMNI_CHAT"
          : selectedUser.role === "PROFESSOR"
          ? "PROFESSOR_CHAT"
          : "ALUMNI_CHAT";
      try {
        await activityAPI.logActivity(
          activityType,
          `Sent message to ${selectedUser.name}`
        );
      } catch (activityError) {
        console.warn("Failed to log chat activity:", activityError);
      }

      showToast("Message sent successfully!", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to send message", "error");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUserId = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.id;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-3xl p-6 border border-teal-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Messages</h2>
              <p className="text-teal-600 font-medium">
                Connect with students, alumni, and faculty
              </p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-teal-600">
              {conversations.length}
            </div>
            <div className="text-sm text-gray-600">Active Chats</div>
          </div>
        </div>
      </div>

      {/* Enhanced Chat Interface */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 h-[600px]">
          {/* Enhanced Conversations Sidebar */}
          <div className="lg:col-span-1 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 flex flex-col">
            {/* Enhanced Search and Filter Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="space-y-4">
                {/* New Chat Button */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3 font-semibold"
                  >
                    <Users className="h-5 w-5" />
                    <span>Start New Chat</span>
                    <ChevronDown className="h-5 w-5" />
                  </button>

                  {/* Enhanced User Dropdown */}
                  {showUserDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 max-h-80 overflow-hidden">
                      <div className="p-4">
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300"
                        />

                        {/* Filter buttons */}
                        <div className="flex space-x-2 mt-3">
                          {[
                            "all",
                            "student",
                            "professor",
                            "alumni",
                            "management",
                          ].map((filter) => (
                            <button
                              key={filter}
                              onClick={() => setSelectedFilter(filter)}
                              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                selectedFilter === filter
                                  ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="max-h-48 overflow-y-auto">
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <button
                              key={user.id}
                              onClick={() => selectUser(user)}
                              className="w-full text-left p-4 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 transition-all duration-300 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                                  <User className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-900">
                                    {user.name}
                                  </div>
                                  <div className="text-sm text-teal-600 font-medium">
                                    {user.email}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {user.role} • {user.department}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            {isSearching ? "Searching..." : "No users found"}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {conversations.length > 0 ? (
                conversations.map((conversation) => (
                  <button
                    key={conversation.user.id}
                    onClick={() => selectUser(conversation.user)}
                    className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 transition-all duration-300 ${
                      selectedUser?.id === conversation.user.id
                        ? "bg-gradient-to-r from-teal-50 to-cyan-50 border-l-4 border-l-teal-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        {conversation.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold shadow-lg">
                            {conversation.unreadCount}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {conversation.user.name}
                          </h4>
                          {conversation.lastMessage && (
                            <span className="text-xs text-gray-500 ml-2">
                              {formatTime(conversation.lastMessage.timestamp)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-teal-600 font-medium">
                          {conversation.user.role}
                        </p>
                        {conversation.lastMessage && (
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {conversation.lastMessage.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="font-semibold text-gray-600 mb-2">
                    No Conversations
                  </h4>
                  <p className="text-sm text-gray-500">
                    Start a new chat to begin messaging
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Chat Area */}
          <div className="lg:col-span-2 flex flex-col">
            {selectedUser ? (
              <>
                {/* Enhanced Chat Header */}
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-6 text-white">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                      <p className="text-teal-100 font-medium">
                        {selectedUser.role} • {selectedUser.department}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enhanced Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === getCurrentUserId()
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-6 py-4 rounded-3xl shadow-lg ${
                            message.senderId === getCurrentUserId()
                              ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white"
                              : "bg-white border border-gray-200 text-gray-800"
                          }`}
                        >
                          <p className="font-medium">{message.message}</p>
                          <p
                            className={`text-xs mt-2 ${
                              message.senderId === getCurrentUserId()
                                ? "text-teal-100"
                                : "text-gray-500"
                            }`}
                          >
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Enhanced Message Input */}
                <div className="bg-white border-t border-gray-200 p-6">
                  <form onSubmit={sendMessage} className="flex space-x-4">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300 font-medium"
                    />
                    <button
                      type="submit"
                      disabled={loading || !newMessage.trim()}
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-4 rounded-2xl hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <Send className="h-6 w-6" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="bg-gradient-to-b from-gray-50 to-white p-12 text-center h-full flex items-center justify-center">
                <div>
                  <div className="w-24 h-24 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="h-12 w-12 text-teal-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-600 mb-3">
                    Select a Conversation
                  </h3>
                  <p className="text-gray-500 text-lg">
                    Choose a conversation from the sidebar or start a new chat
                    to begin messaging.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default UserChatEnhanced;
