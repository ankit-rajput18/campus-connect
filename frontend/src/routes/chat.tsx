import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, ArrowLeft, Search, MoreVertical,
  Phone, Video, Circle, CheckCheck,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  getChats,
  getMessages,
  sendMessage as sendRestMessage,
  findOrCreateChat,
  getMe,
  isAuthenticated,
  type Chat,
  type ChatMessage,
} from "@/lib/api";
import {
  connectSocket,
  disconnectSocket,
  joinChat,
  sendSocketMessage,
  markChatRead,
  onNewMessage,
  offNewMessage,
  onMessagesRead,
  offMessagesRead,
} from "@/lib/socket";
import { toast } from "sonner";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "Messages — Campus Connect" }] }),
  component: ChatPage,
});

/**
 * Format ISO Date string to human readable message time (e.g. 10:32 AM)
 */
function formatMessageTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

/**
 * Format ISO Date string for chat thread sidebar list (e.g. 2m ago, Yesterday, 25 May)
 */
function formatLastMessageTime(isoString?: string): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;

    // Check if yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

    return d.toLocaleDateString([], { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

function ChatPage() {
  const nav = useNavigate();
  const [threads, setThreads] = useState<Chat[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [myId, setMyId] = useState<string>("");
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Guard route & load threads and self ID
  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("Please sign in to view messages.");
      nav({ to: "/auth" });
      return;
    }

    const initChats = async () => {
      setLoadingThreads(true);
      // Fetch self
      const meRes = await getMe();
      if (meRes.data?.user) {
        setMyId(meRes.data.user._id);
      }

      // Fetch active threads
      const chatsRes = await getChats();
      if (chatsRes.data?.chats) {
        setThreads(chatsRes.data.chats);
      } else {
        toast.error(chatsRes.error || "Failed to load chats");
      }
      setLoadingThreads(false);
    };

    initChats();

    // Connect Socket Client
    connectSocket();

    // Clean up on unmount
    return () => {
      disconnectSocket();
    };
  }, []);

  // 2. Set up Socket listeners for real-time messages
  useEffect(() => {
    const handleNewMessage = (data: { message: ChatMessage }) => {
      const { message } = data;

      // Check if message belongs to active thread
      if (message.chat === activeId) {
        setMessages((prev) => {
          // Prevent duplicates by replacing optimistic local message with the real one
          if (prev.some((m) => m._id === message._id)) return prev;

          const optimisticIndex = prev.findIndex((m) =>
            m._id.startsWith("optimistic_") &&
            m.sender._id === myId &&
            m.text === message.text &&
            Math.abs(new Date(m.createdAt).getTime() - new Date(message.createdAt).getTime()) < 5000
          );

          if (optimisticIndex !== -1) {
            const next = [...prev];
            next[optimisticIndex] = message;
            return next;
          }

          return [...prev, message];
        });
        // Instantly mark as read in DB and inform socket
        markChatRead(message.chat);
      }

      // Update thread lastMessage in sidebar list
      setThreads((prev) => {
        const existing = prev.find((t) => t._id === message.chat);
        if (existing) {
          return prev
            .map((t) =>
              t._id === message.chat
                ? {
                    ...t,
                    lastMessage: message.text,
                    lastMessageAt: message.createdAt,
                    unread: t._id === activeId ? 0 : (t.unread || 0) + 1,
                  }
                : t
            )
            .sort((a, b) => {
              const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
              const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
              return bTime - aTime;
            });
        } else {
          // If a new thread was created and a message arrived, reload threads
          getChats().then((res) => {
            if (res.data?.chats) setThreads(res.data.chats);
          });
          return prev;
        }
      });
    };

    const handleMessagesRead = (data: { chatId: string; userId: string }) => {
      if (data.chatId === activeId && data.userId !== myId) {
        setMessages((prev) =>
          prev.map((m) => (m.sender._id !== myId ? m : { ...m, read: true }))
        );
      }
    };

    onNewMessage(handleNewMessage);
    onMessagesRead(handleMessagesRead);

    return () => {
      offNewMessage(handleNewMessage);
      offMessagesRead(handleMessagesRead);
    };
  }, [activeId, myId]);

  // 3. Handle URL parameters (creating/opening thread from "Chat" button)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userIdParam = params.get("userId");

    if (userIdParam) {
      const openUserChat = async () => {
        // Call backend to find or create the thread
        const res = await findOrCreateChat(userIdParam);
        if (res.data?.chat) {
          const chat = res.data.chat;
          // Set thread list if not in there
          setThreads((prev) => {
            if (prev.some((t) => t._id === chat._id)) return prev;
            // Map correctly to enrich it
            const enriched: Chat = {
              ...chat,
              otherUser: chat.participants.find((p) => p._id !== myId)!,
              unread: 0,
            };
            return [enriched, ...prev];
          });
          setActiveId(chat._id);
        } else {
          toast.error("Could not start conversation: " + (res.error || ""));
        }

        // Clean up URL parameters
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      };

      if (myId) {
        openUserChat();
      }
    }
  }, [myId]);

  // 4. Scroll to bottom when messages load/change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // 5. Handle switching active chats
  const handleSelectThread = async (chatId: string) => {
    setActiveId(chatId);
    setLoadingMessages(true);

    // Join room on Socket
    joinChat(chatId);
    markChatRead(chatId);

    // Fetch messages history
    const res = await getMessages(chatId);
    if (res.data?.messages) {
      setMessages(res.data.messages);
    } else {
      toast.error(res.error || "Failed to load messages");
    }

    // Reset unread count locally in threads list
    setThreads((prev) =>
      prev.map((t) => (t._id === chatId ? { ...t, unread: 0 } : t))
    );

    setLoadingMessages(false);
  };

  // 6. Send a message
  const handleSendMessage = async () => {
    const text = input.trim();
    if (!text || !activeId) return;

    // Fast-path optimistic append to make UI snappy
    const optimisticMsg: ChatMessage = {
      _id: `optimistic_${Date.now()}`,
      chat: activeId,
      sender: { _id: myId, name: "You", avatar: "" },
      text,
      read: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInput("");

    // Emit via Socket (saves in DB & broadcasts to both)
    sendSocketMessage(activeId, text);

    // Clear and focus
    inputRef.current?.focus();
  };

  const active = threads.find((t) => t._id === activeId) ?? null;

  const filtered = threads.filter((t) =>
    t.otherUser?.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = threads.reduce((s, t) => s + (t.unread || 0), 0);

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] gap-4 overflow-hidden">
        {/* ── Sidebar: thread list ── */}
        <div
          className={`flex flex-col w-full md:w-80 lg:w-96 shrink-0 glass-card border border-white/70 rounded-[22px] shadow-card overflow-hidden ${active ? "hidden md:flex" : "flex"}`}
        >
          {/* Header */}
          <div className="px-5 pt-5 pb-4 border-b border-border/40">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="font-display text-xl font-bold">Messages</h1>
                {totalUnread > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {totalUnread} unread message{totalUnread > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations…"
                className="w-full bg-muted/50 rounded-[12px] pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/25 transition"
              />
            </div>
          </div>

          {/* Thread list */}
          <div className="flex-1 overflow-y-auto scroll-hide">
            {loadingThreads ? (
              <div className="flex items-center justify-center h-full">
                <svg className="animate-spin h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-sm font-semibold">No conversations yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Click "Chat" on a listing in the feed to start a connection.
                </p>
              </div>
            ) : (
              filtered.map((t) => {
                const other = t.otherUser || t.participants.find((p) => p._id !== myId);
                if (!other) return null;
                const isSelected = activeId === t._id;
                const hasUnread = t.unread > 0;

                return (
                  <motion.button
                    key={t._id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectThread(t._id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all duration-150 ${
                      isSelected ? "bg-primary/8" : "hover:bg-white/60"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={other.avatar || `https://i.pravatar.cc/100?img=${other.name.charCodeAt(0) % 70}`}
                        alt={other.name}
                        className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow-sm"
                      />
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-sm truncate ${hasUnread ? "font-bold text-foreground" : "font-semibold"}`}>
                          {other.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {formatLastMessageTime(t.lastMessageAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <span className={`text-xs truncate ${hasUnread ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                          {t.lastMessage || "No messages yet"}
                        </span>
                        {hasUnread && (
                          <span className="shrink-0 h-5 min-w-[20px] px-1.5 rounded-full gradient-bg text-white text-[10px] font-bold flex items-center justify-center">
                            {t.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Chat window ── */}
        <div
          className={`flex-1 flex flex-col glass-card border border-white/70 rounded-[22px] shadow-card overflow-hidden ${active ? "flex" : "hidden md:flex"}`}
        >
          {active ? (
            <>
              {/* Chat header */}
              {(() => {
                const other = active.otherUser || active.participants.find((p) => p._id !== myId);
                if (!other) return null;

                return (
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40 shrink-0">
                    <button
                      onClick={() => setActiveId(null)}
                      className="md:hidden grid h-8 w-8 place-items-center rounded-xl hover:bg-white/60 transition text-muted-foreground"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div className="relative">
                      <img
                        src={other.avatar || `https://i.pravatar.cc/100?img=${other.name.charCodeAt(0) % 70}`}
                        alt={other.name}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{other.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {other.department || "DYP DPU Student"}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="grid h-8 w-8 place-items-center rounded-xl hover:bg-white/60 transition text-muted-foreground">
                        <Phone className="h-4 w-4" />
                      </button>
                      <button className="grid h-8 w-8 place-items-center rounded-xl hover:bg-white/60 transition text-muted-foreground">
                        <Video className="h-4 w-4" />
                      </button>
                      <button className="grid h-8 w-8 place-items-center rounded-xl hover:bg-white/60 transition text-muted-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto scroll-hide px-4 py-4 space-y-3">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <svg className="animate-spin h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {messages.map((msg, i) => {
                      const isMe = msg.sender._id === myId || msg.sender === myId;
                      const other = active.otherUser || active.participants.find((p) => p._id !== myId);
                      const showAvatar =
                        !isMe &&
                        (i === 0 ||
                          messages[i - 1].sender._id === myId ||
                          messages[i - 1].sender === myId);

                      return (
                        <motion.div
                          key={msg._id}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                          className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          {/* Other user avatar */}
                          {!isMe && other && (
                            <div className="w-7 shrink-0">
                              {showAvatar && (
                                <img
                                  src={other.avatar || `https://i.pravatar.cc/100?img=${other.name.charCodeAt(0) % 70}`}
                                  alt={other.name}
                                  className="h-7 w-7 rounded-full object-cover ring-1 ring-white"
                                />
                              )}
                            </div>
                          )}
                          {/* Bubble */}
                          <div className={`max-w-[72%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                            <div
                              className={`px-4 py-2.5 rounded-[18px] text-sm leading-relaxed ${
                                isMe
                                  ? "gradient-bg text-white rounded-br-[6px] shadow-soft"
                                  : "bg-white/80 text-foreground rounded-bl-[6px] shadow-card border border-white/60"
                              }`}
                            >
                              {msg.text}
                            </div>
                            <div
                              className={`flex items-center gap-1 text-[10px] text-muted-foreground ${
                                isMe ? "flex-row-reverse" : ""
                              }`}
                            >
                              <span>{formatMessageTime(msg.createdAt)}</span>
                              {isMe && !msg._id.startsWith("optimistic_") && (
                                <CheckCheck className={`h-3 w-3 ${msg.read ? "text-sky-500" : "text-muted-foreground"}`} />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input bar */}
              {(() => {
                const other = active.otherUser || active.participants.find((p) => p._id !== myId);
                if (!other) return null;

                return (
                  <div className="px-4 py-3 border-t border-border/40 shrink-0">
                    <div className="flex items-center gap-2 bg-white/70 rounded-[16px] px-4 py-2 border border-white/60 shadow-card">
                      <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder={`Message ${other.name}…`}
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                      />
                      <motion.button
                        whileTap={{ scale: 0.88 }}
                        onClick={handleSendMessage}
                        disabled={!input.trim()}
                        className={`grid h-8 w-8 place-items-center rounded-[10px] transition-all duration-200 ${
                          input.trim() ? "gradient-bg text-white shadow-soft" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Send className="h-3.5 w-3.5" />
                      </motion.button>
                    </div>
                  </div>
                );
              })()}
            </>
          ) : (
            /* Empty state ─ no chat selected */
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <div className="grid h-20 w-20 place-items-center rounded-[24px] bg-muted/60 mb-5">
                <Send className="h-9 w-9 text-muted-foreground" />
              </div>
              <h3 className="font-display font-bold text-xl mb-2">Your messages</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Select a conversation from the left to start chatting with a student.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
