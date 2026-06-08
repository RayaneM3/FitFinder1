import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Send, MoreVertical, ShieldAlert, MessageCircle, Search, User, ArrowLeft, X, AlertCircle, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, API_BASE } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useWebSocket } from "@/hooks/use-websocket";

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatMsgTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const todayStr = now.toDateString();
  const yesterdayStr = new Date(now.getTime() - 86_400_000).toDateString();
  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (date.toDateString() === todayStr) return time;
  if (date.toDateString() === yesterdayStr) return `Yesterday ${time}`;
  return `${date.toLocaleDateString([], { month: "short", day: "numeric" })} ${time}`;
}

function formatConvoTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  if (date.toDateString() === now.toDateString())
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (date.toDateString() === new Date(now.getTime() - 86_400_000).toDateString())
    return "Yesterday";
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

// ─── Skeletons ──────────────────────────────────────────────────────────────

function ConversationSkeleton() {
  return (
    <div className="flex items-start gap-3 p-3">
      <Skeleton className="w-12 h-12 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-10" />
        </div>
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}

function MessageSkeleton({ isMe }: { isMe: boolean }) {
  return (
    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} gap-1`}>
      <Skeleton className={`h-10 ${isMe ? "w-48" : "w-56"} rounded-2xl`} />
      <Skeleton className="h-2 w-12" />
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function Messages() {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeConvoId, setActiveConvoId] = useState(conversationId || "");
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasOlderMessages, setHasOlderMessages] = useState(false);

  // Report dialog state
  const [reportOpen, setReportOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState("HARASSMENT");
  const [reportDetails, setReportDetails] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  /** True when the user is within 80px of the bottom — controls auto-scroll. */
  const wasAtBottomRef = useRef(true);

  useEffect(() => {
    document.title = "Messages | Fit Finder";
    return () => { document.title = "Fit Finder"; };
  }, []);

  useEffect(() => {
    if (conversationId) setActiveConvoId(conversationId);
  }, [conversationId]);

  useEffect(() => {
    if (!isAuthenticated) setLocation("/auth");
  }, [isAuthenticated, setLocation]);

  // Track whether user is near the bottom so we know if auto-scroll is wanted
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    wasAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }, []);

  // Auto-resize textarea as user types
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [messageText]);

  const { lastMessage: wsMessage } = useWebSocket(isAuthenticated);

  useEffect(() => {
    if (!wsMessage || wsMessage.type !== "new_message") return;
    if (wsMessage.conversationId === activeConvoId) {
      queryClient.setQueryData(["/api/messages", activeConvoId], (old: any[] | undefined) => {
        if (!old) return [wsMessage.message];
        if (old.some((m: any) => m.id === wsMessage.message.id)) return old;
        return [...old, wsMessage.message];
      });
    }
    queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
  }, [wsMessage, activeConvoId]);

  // ── Queries ──────────────────────────────────────────────────────────────

  const { data: conversations, isLoading: convosLoading, isError: convosError } = useQuery({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/conversations`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load conversations");
      return res.json();
    },
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });

  const { data: msgs, isLoading: msgsLoading, isError: msgsError } = useQuery({
    queryKey: ["/api/messages", activeConvoId],
    queryFn: async () => {
      if (!activeConvoId) return [];
      const res = await fetch(`${API_BASE}/api/messages?conversationId=${activeConvoId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load messages");
      const data = await res.json();
      setHasOlderMessages(data.length === 50);
      return data;
    },
    enabled: !!activeConvoId,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });

  // ── Auto-scroll — only when user was already at the bottom ───────────────
  useEffect(() => {
    if (wasAtBottomRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [msgs]);

  // ── Mutations ─────────────────────────────────────────────────────────────

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/messages", { conversationId: activeConvoId, content });
      return res.json();
    },
    onMutate: async (content: string) => {
      const optimisticMsg = {
        id: `optimistic-${Date.now()}`,
        conversationId: activeConvoId,
        senderId: user?.id,
        content,
        createdAt: new Date().toISOString(),
        readAt: null,
        _optimistic: true,
      };
      wasAtBottomRef.current = true; // always scroll to bottom after own send
      queryClient.setQueryData(["/api/messages", activeConvoId], (old: any[] | undefined) =>
        [...(old || []), optimisticMsg]
      );
      return { optimisticId: optimisticMsg.id, content };
    },
    onSuccess: (serverMsg, _, ctx) => {
      queryClient.setQueryData(["/api/messages", activeConvoId], (old: any[] | undefined) => {
        if (!old) return [serverMsg];
        return old.map(m => m.id === ctx?.optimisticId ? serverMsg : m);
      });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
    onError: (err: any, _, ctx) => {
      // Remove optimistic message and restore text so user can retry
      queryClient.setQueryData(["/api/messages", activeConvoId], (old: any[] | undefined) =>
        (old || []).filter(m => m.id !== ctx?.optimisticId)
      );
      if (ctx?.content) setMessageText(ctx.content);
      const msg = err.message?.includes(":") ? err.message.split(":").slice(1).join(":").trim() : err.message;
      toast({ title: "Failed to send", description: msg, variant: "destructive" });
    },
  });

  const blockMutation = useMutation({
    mutationFn: async (blockedId: string) => {
      await apiRequest("POST", "/api/block", { blockedId });
    },
    onSuccess: () => {
      toast({ title: "User blocked" });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setActiveConvoId("");
    },
  });

  const reportMutation = useMutation({
    mutationFn: async ({ reportedId }: { reportedId: string }) => {
      await apiRequest("POST", "/api/report", { reportedId, category: reportCategory, details: reportDetails });
    },
    onSuccess: () => {
      toast({ title: "Report submitted", description: "We'll review this anonymously." });
      setReportOpen(false);
      setReportDetails("");
      setReportCategory("HARASSMENT");
    },
    onError: (err: any) => {
      const msg = err.message?.includes(":") ? err.message.split(":").slice(1).join(":").trim() : err.message;
      toast({ title: "Report failed", description: msg, variant: "destructive" });
    },
  });

  const loadOlderMessages = async () => {
    if (!msgs?.length || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const oldest = msgs[0].createdAt;
      const res = await fetch(
        `${API_BASE}/api/messages?conversationId=${activeConvoId}&before=${encodeURIComponent(oldest)}`,
        { credentials: "include" }
      );
      if (!res.ok) return;
      const older: any[] = await res.json();
      if (older.length < 50) setHasOlderMessages(false);
      if (older.length === 0) return;
      const container = scrollRef.current;
      const prevHeight = container?.scrollHeight ?? 0;
      queryClient.setQueryData(["/api/messages", activeConvoId], (prev: any[] | undefined) => {
        if (!prev) return older;
        const existingIds = new Set(prev.map((m: any) => m.id));
        return [...older.filter((m: any) => !existingIds.has(m.id)), ...prev];
      });
      requestAnimationFrame(() => {
        if (container) container.scrollTop = container.scrollHeight - prevHeight;
      });
    } finally {
      setLoadingOlder(false);
    }
  };

  // Mark as read & reset older-messages flag when switching convos
  useEffect(() => {
    if (!activeConvoId) return;
    setHasOlderMessages(false);
    wasAtBottomRef.current = true;
    apiRequest("POST", `/api/conversations/${activeConvoId}/read`, {})
      .catch(() => {})
      .finally(() => queryClient.invalidateQueries({ queryKey: ["/api/conversations"] }));
  }, [activeConvoId]);

  // Auto-select first conversation if none chosen
  useEffect(() => {
    if (!activeConvoId && conversations?.length > 0) {
      setActiveConvoId(conversations[0].id);
    }
  }, [conversations, activeConvoId]);

  if (!isAuthenticated || !user) return null;

  const activeConvo = conversations?.find((c: any) => c.id === activeConvoId);
  const otherUser = activeConvo?.otherUser;

  const handleSend = () => {
    const content = messageText.trim();
    if (!content || !activeConvoId || sendMutation.isPending) return;
    if (!user?.emailVerified) {
      toast({
        title: "Email not verified",
        description: "Please verify your email address before sending messages. Check Settings to resend.",
        variant: "destructive",
      });
      return;
    }
    setMessageText("");
    sendMutation.mutate(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showList = !activeConvoId || !otherUser;

  const filteredConversations = (conversations || []).filter((convo: any) => {
    if (!searchQuery.trim()) return true;
    const name = convo.otherUser?.name?.toLowerCase() || "";
    const lastMsg = convo.lastMessage?.content?.toLowerCase() || "";
    const q = searchQuery.toLowerCase().trim();
    return name.includes(q) || lastMsg.includes(q);
  });

  return (
    <Layout showFooter={false}>
      <div className="flex-1 flex overflow-hidden border-t" style={{ height: "calc(100vh - 64px)" }}>

        {/* ── Conversation sidebar ─────────────────────────────────────── */}
        <div
          className={`${showList ? "flex" : "hidden"} md:flex w-full md:w-80 lg:w-96 flex-col shrink-0 bg-muted/20`}
          style={{ boxShadow: "2px 0 8px -2px rgba(0,0,0,0.06)" }}
        >
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold mb-3" data-testid="text-messages-title">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                className="bg-background pl-9 pr-8"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                data-testid="input-search-messages"
                aria-label="Search messages"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {convosLoading ? (
                <><ConversationSkeleton /><ConversationSkeleton /><ConversationSkeleton /></>
              ) : convosError ? (
                <div className="text-center py-8 px-6">
                  <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <p className="text-sm font-medium mb-1">Couldn't load conversations</p>
                  <p className="text-xs text-muted-foreground mb-3">Check your connection and try again.</p>
                  <Button size="sm" variant="outline" className="rounded-lg" onClick={() => window.location.reload()}>Retry</Button>
                </div>
              ) : !conversations?.length ? (
                <div className="text-center py-12 px-6">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-7 w-7 text-muted-foreground/50" />
                  </div>
                  <p className="font-medium text-foreground mb-1">No messages yet</p>
                  <p className="text-sm text-muted-foreground mb-4">When you contact a trainer, your conversations will appear here.</p>
                  <Link href="/explore">
                    <Button size="sm" className="rounded-lg" data-testid="button-find-trainers-sidebar">Find a Trainer</Button>
                  </Link>
                </div>
              ) : searchQuery.trim() && filteredConversations.length === 0 ? (
                <div className="text-center py-8 px-6">
                  <p className="text-sm text-muted-foreground">No conversations matching "{searchQuery}"</p>
                  <Button variant="ghost" size="sm" className="mt-2 rounded-xl" onClick={() => setSearchQuery("")}>Clear search</Button>
                </div>
              ) : filteredConversations.map((convo: any) => (
                <button
                  key={convo.id}
                  onClick={() => setActiveConvoId(convo.id)}
                  className={`w-full text-left p-3 rounded-xl flex items-start gap-3 transition-colors ${
                    activeConvoId === convo.id ? "bg-primary/10" : "hover:bg-background"
                  }`}
                  data-testid={`conversation-${convo.id}`}
                >
                  <Avatar className="w-12 h-12 border border-border">
                    <AvatarImage src={convo.otherUser?.image || undefined} />
                    <AvatarFallback>{convo.otherUser?.name?.charAt(0) || "?"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-semibold text-sm truncate">{convo.otherUser?.name || "Unknown"}</h4>
                      {convo.lastMessage && (
                        <span className="text-xs text-muted-foreground shrink-0 ml-1">
                          {formatConvoTime(convo.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm truncate text-muted-foreground flex-1">
                        {convo.lastMessage?.content || "No messages yet"}
                      </p>
                      {convo.unreadCount > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shrink-0">
                          {convo.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* ── Main chat area ───────────────────────────────────────────── */}
        <div className={`${showList ? "hidden" : "flex"} md:flex flex-1 flex-col bg-background`}>
          {!activeConvoId || !otherUser ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center max-w-xs">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-5">
                  <MessageCircle className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <p className="text-lg font-semibold text-foreground mb-1">Select a conversation</p>
                <p className="text-sm text-muted-foreground mb-5">Or browse trainers to start chatting.</p>
                <Link href="/explore">
                  <Button className="rounded-lg mb-6" data-testid="button-find-trainers-main">Find Trainers</Button>
                </Link>
                <div className="border rounded-xl p-4 text-left bg-muted/30">
                  <p className="text-xs font-semibold text-foreground mb-3">How it works</p>
                  <div className="space-y-3">
                    {["Browse trainers and find your match", "Request to chat and start a conversation"].map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                        <p className="text-xs text-muted-foreground">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div className="h-16 border-b flex items-center justify-between px-4 md:px-6 bg-background/95 backdrop-blur z-10">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden rounded-xl"
                    onClick={() => setActiveConvoId("")}
                    data-testid="button-back-conversations"
                    aria-label="Back to conversations list"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <Avatar className="w-10 h-10 border border-border">
                    <AvatarImage src={otherUser.image || undefined} />
                    <AvatarFallback>{otherUser.name?.charAt(0) || "?"}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold" data-testid="text-chat-name">{otherUser.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/profile/${otherUser.id}`}>
                    <Button variant="outline" size="sm" className="rounded-lg gap-2" data-testid="button-view-profile">
                      <User className="w-4 h-4" />
                      <span className="hidden lg:inline">View Profile</span>
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-chat-menu" aria-label="Chat options menu">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setReportOpen(true)}
                        data-testid="button-report"
                      >
                        <ShieldAlert className="w-4 h-4 mr-2 text-amber-500" /> Report user
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => blockMutation.mutate(otherUser.id)}
                        data-testid="button-block"
                      >
                        <ShieldAlert className="w-4 h-4 mr-2" /> Block user
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Messages area */}
              <div
                className="flex-1 overflow-y-auto p-6"
                ref={scrollRef}
                onScroll={handleScroll}
              >
                <div className="flex justify-center mb-8">
                  <div className="bg-primary/5 text-primary text-xs font-medium px-4 py-2 rounded-full border border-primary/10 flex items-center gap-2">
                    <ShieldAlert className="w-3 h-3" />
                    Safety: Keep communication on the platform. Don't share exact addresses immediately.
                  </div>
                </div>

                {hasOlderMessages && !msgsLoading && (
                  <div className="flex justify-center mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full text-xs px-4"
                      onClick={loadOlderMessages}
                      disabled={loadingOlder}
                    >
                      {loadingOlder ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                      Load earlier messages
                    </Button>
                  </div>
                )}

                {msgsLoading ? (
                  <div className="space-y-4">
                    <MessageSkeleton isMe={false} />
                    <MessageSkeleton isMe={true} />
                    <MessageSkeleton isMe={false} />
                    <MessageSkeleton isMe={true} />
                  </div>
                ) : msgsError ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      </div>
                      <p className="text-sm font-medium mb-1">Couldn't load messages</p>
                      <p className="text-xs text-muted-foreground">Please refresh the page to try again.</p>
                    </div>
                  </div>
                ) : (msgs || []).length === 0 ? (
                  <div className="flex-1 flex items-center justify-center py-16">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                        <Send className="h-5 w-5 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm text-muted-foreground" data-testid="text-empty-thread">
                        Say hello — share your goals and availability.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(msgs || []).map((msg: any) => {
                      const isMe = msg.senderId === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? "items-end" : "items-start"} gap-1 ${msg._optimistic ? "opacity-70" : ""}`}
                        >
                          <div
                            className={`${
                              isMe
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground"
                            } p-3 rounded-2xl ${isMe ? "rounded-tr-sm" : "rounded-tl-sm"} max-w-[80%] md:max-w-[70%] text-sm break-words`}
                          >
                            {msg.content}
                          </div>
                          <span className="text-[10px] text-muted-foreground px-1">
                            {formatMsgTime(msg.createdAt)}
                            {isMe && msg.readAt && " · Read"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Message input */}
              <div className="p-4 border-t bg-background">
                <div className="flex items-end gap-2 bg-muted/50 rounded-2xl border p-2 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
                  <textarea
                    ref={textareaRef}
                    className="flex-1 bg-transparent border-0 resize-none max-h-32 min-h-[40px] p-2 text-sm focus:outline-none"
                    placeholder="Type a message… (Shift+Enter for new line)"
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    data-testid="input-message"
                  />
                  <Button
                    size="icon"
                    className="shrink-0 rounded-xl bg-primary hover:bg-primary/90 text-white disabled:opacity-40"
                    onClick={handleSend}
                    disabled={!messageText.trim() || sendMutation.isPending}
                    data-testid="button-send"
                  >
                    {sendMutation.isPending
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Send className="w-4 h-4" />
                    }
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5 px-1">
                  {messageText.length > 4000
                    ? <span className="text-destructive">{messageText.length}/5000</span>
                    : messageText.length > 0
                    ? `${messageText.length}/5000`
                    : null}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Report dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Report {otherUser?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Select value={reportCategory} onValueChange={setReportCategory}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="HARASSMENT">Harassment</SelectItem>
                <SelectItem value="SPAM">Spam</SelectItem>
                <SelectItem value="INAPPROPRIATE">Inappropriate Content</SelectItem>
                <SelectItem value="SCAM">Scam</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              value={reportDetails}
              onChange={e => setReportDetails(e.target.value)}
              placeholder="Describe what happened (optional)…"
              className="rounded-xl"
              maxLength={1000}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setReportOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 rounded-xl"
                onClick={() => otherUser && reportMutation.mutate({ reportedId: otherUser.id })}
                disabled={reportMutation.isPending}
              >
                {reportMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Submit Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
