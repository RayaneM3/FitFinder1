import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, MoreVertical, ShieldAlert, MessageCircle, Search, User, ArrowLeft, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, API_BASE } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useWebSocket } from "@/hooks/use-websocket";

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
    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1`}>
      <Skeleton className={`h-10 ${isMe ? 'w-48' : 'w-56'} rounded-2xl`} />
      <Skeleton className="h-2 w-12" />
    </div>
  );
}

export default function Messages() {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeConvoId, setActiveConvoId] = useState(conversationId || "");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId) setActiveConvoId(conversationId);
  }, [conversationId]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/auth");
    }
  }, [isAuthenticated, setLocation]);

  const { lastMessage: wsMessage } = useWebSocket(isAuthenticated);

  // Handle WebSocket messages
  useEffect(() => {
    if (!wsMessage || wsMessage.type !== "new_message") return;

    if (wsMessage.conversationId === activeConvoId) {
      // Append message to active conversation
      queryClient.setQueryData(["/api/messages", activeConvoId], (old: any[] | undefined) => {
        if (!old) return [wsMessage.message];
        // Avoid duplicates
        if (old.some((m: any) => m.id === wsMessage.message.id)) return old;
        return [...old, wsMessage.message];
      });
    }
    // Always refresh conversations list for unread counts
    queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
  }, [wsMessage, activeConvoId]);

  const { data: conversations, isLoading: convosLoading } = useQuery({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/conversations`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load conversations");
      return res.json();
    },
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });

  const { data: msgs, isLoading: msgsLoading } = useQuery({
    queryKey: ["/api/messages", activeConvoId],
    queryFn: async () => {
      if (!activeConvoId) return [];
      const res = await fetch(`${API_BASE}/api/messages?conversationId=${activeConvoId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load messages");
      return res.json();
    },
    enabled: !!activeConvoId,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/messages", { conversationId: activeConvoId, content: message });
      return res.json();
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages", activeConvoId] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
    onError: (err: any) => {
      toast({ title: "Failed to send", description: err.message, variant: "destructive" });
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [msgs]);

  useEffect(() => {
    if (!activeConvoId) return;
    apiRequest("POST", `/api/conversations/${activeConvoId}/read`, {})
      .catch(() => {})
      .finally(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      });
  }, [activeConvoId]);

  useEffect(() => {
    if (!activeConvoId && conversations?.length > 0) {
      setActiveConvoId(conversations[0].id);
    }
  }, [conversations, activeConvoId]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const activeConvo = conversations?.find((c: any) => c.id === activeConvoId);
  const otherUser = activeConvo?.otherUser;

  const handleSend = () => {
    if (!message.trim() || !activeConvoId) return;
    sendMutation.mutate();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showList = !activeConvoId || !otherUser;

  return (
    <Layout showFooter={false}>
      <div className="flex-1 flex overflow-hidden border-t" style={{ height: "calc(100vh - 64px)" }}>
        {/* Sidebar — always visible on desktop, conditionally on mobile */}
        <div className={`${showList ? 'flex' : 'hidden'} md:flex w-full md:w-80 lg:w-96 flex-col shrink-0 bg-muted/20`} style={{ boxShadow: "2px 0 8px -2px rgba(0,0,0,0.06)" }}>
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold mb-3" data-testid="text-messages-title">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                className="bg-background pl-9 pr-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                <>
                  <ConversationSkeleton />
                  <ConversationSkeleton />
                  <ConversationSkeleton />
                </>
              ) : (() => {
                const filteredConversations = (conversations || []).filter((convo: any) => {
                  if (!searchQuery.trim()) return true;
                  const name = convo.otherUser?.name?.toLowerCase() || "";
                  const lastMsg = convo.lastMessage?.content?.toLowerCase() || "";
                  const query = searchQuery.toLowerCase().trim();
                  return name.includes(query) || lastMsg.includes(query);
                });

                if (searchQuery.trim() && filteredConversations.length === 0) {
                  return (
                    <div className="text-center py-8 px-6">
                      <p className="text-sm text-muted-foreground">No conversations matching "{searchQuery}"</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 rounded-xl"
                        onClick={() => setSearchQuery("")}
                      >
                        Clear search
                      </Button>
                    </div>
                  );
                }

                if (!conversations?.length) {
                  return (
                    <div className="text-center py-12 px-6">
                      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="h-7 w-7 text-muted-foreground/50" />
                      </div>
                      <p className="font-medium text-foreground mb-1">No messages yet</p>
                      <p className="text-sm text-muted-foreground mb-4">When you contact a trainer, your conversations will appear here.</p>
                      <Link href="/explore">
                        <Button size="sm" className="rounded-lg" data-testid="button-find-trainers-sidebar">
                          Find a Trainer
                        </Button>
                      </Link>
                    </div>
                  );
                }

                return filteredConversations.map((convo: any) => (
                <button
                  key={convo.id}
                  onClick={() => setActiveConvoId(convo.id)}
                  className={`w-full text-left p-3 rounded-xl flex items-start gap-3 transition-colors ${
                    activeConvoId === convo.id ? 'bg-primary/10' : 'hover:bg-background'
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
                        <span className="text-xs text-muted-foreground">
                          {new Date(convo.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
              ));
              })()}
            </div>
          </ScrollArea>
        </div>

        {/* Main chat area */}
        <div className={`${showList ? 'hidden' : 'flex'} md:flex flex-1 flex-col bg-background`}>
          {!activeConvoId || !otherUser ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center max-w-xs">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-5">
                  <MessageCircle className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <p className="text-lg font-semibold text-foreground mb-1">Select a conversation</p>
                <p className="text-sm text-muted-foreground mb-5">Or browse trainers to start chatting.</p>
                <Link href="/explore">
                  <Button className="rounded-lg mb-6" data-testid="button-find-trainers-main">
                    Find Trainers
                  </Button>
                </Link>
                <div className="border rounded-xl p-4 text-left bg-muted/30">
                  <p className="text-xs font-semibold text-foreground mb-3">How it works</p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">1</div>
                      <p className="text-xs text-muted-foreground">Browse trainers and find your match</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">2</div>
                      <p className="text-xs text-muted-foreground">Request to chat and start a conversation</p>
                    </div>
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
                  <div>
                    <h3 className="font-semibold" data-testid="text-chat-name">{otherUser.name}</h3>
                  </div>
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
                      <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-chat-menu" aria-label="Chat options menu"><MoreVertical className="w-5 h-5" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="text-destructive" onClick={() => blockMutation.mutate(otherUser.id)} data-testid="button-block-report">
                        <ShieldAlert className="w-4 h-4 mr-2" /> Block & Report
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-6" ref={scrollRef}>
                <div className="flex justify-center mb-8">
                  <div className="bg-primary/5 text-primary text-xs font-medium px-4 py-2 rounded-full border border-primary/10 flex items-center gap-2">
                    <ShieldAlert className="w-3 h-3" />
                    Safety: Keep communication on the platform. Don't share exact addresses immediately.
                  </div>
                </div>

                {msgsLoading ? (
                  <div className="space-y-4">
                    <MessageSkeleton isMe={false} />
                    <MessageSkeleton isMe={true} />
                    <MessageSkeleton isMe={false} />
                    <MessageSkeleton isMe={true} />
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
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1`}>
                          <div className={`${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'} p-3 rounded-2xl ${isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'} max-w-[80%] md:max-w-[70%] text-sm`}>
                            {msg.content}
                          </div>
                          <span className="text-[10px] text-muted-foreground px-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isMe && msg.readAt && " - Read"}
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
                    className="flex-1 bg-transparent border-0 resize-none max-h-32 min-h-[40px] p-2 text-sm focus:outline-none custom-scrollbar"
                    placeholder="Type a message..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    data-testid="input-message"
                  />
                  <Button
                    size="icon"
                    className="shrink-0 rounded-xl bg-primary hover:bg-primary/90 text-white"
                    onClick={handleSend}
                    disabled={!message.trim() || sendMutation.isPending}
                    data-testid="button-send"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
