import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  CreditCard, Settings, ChevronRight, MessageSquare, Search, Loader2, Plus,
  Dumbbell, Users, TrendingUp, Heart, CheckCircle2, Circle, Clock, MapPin,
  FileText, User, Sparkles, ArrowRight, Star, AlertCircle, Pencil, Trash2, ToggleLeft, ToggleRight
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect, useRef } from "react";

/** Animates a number from 0 to `target` over `duration` ms. */
function useCountUp(target: number, duration = 800): number {
  const [count, setCount] = useState(0);
  const prevTarget = useRef<number>(0);
  useEffect(() => {
    if (target === prevTarget.current) return;
    const from = prevTarget.current;
    prevTarget.current = target;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(from + (target - from) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return count;
}
import { apiRequest, queryClient, API_BASE } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "Dashboard | Fit Finder";
    return () => { document.title = "Fit Finder"; };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/auth");
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const isTrainer = user.role === "TRAINER" || user.role === "BOTH";
  const isClient = user.role === "CLIENT" || user.role === "BOTH";

  return (
    <Layout>
      <div className="border-b">
        <div className="container mx-auto px-4 md:px-8 py-5">
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-background shadow-sm bg-primary/10 flex items-center justify-center text-primary text-xl font-bold transition-transform duration-300 hover:scale-110">
              {user.name?.charAt(0) || "U"}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" data-testid="text-welcome">Welcome back, {user.name?.split(' ')[0]}</h1>
              <p className="text-sm text-muted-foreground">
                {isTrainer && isClient ? "Trainer & Client Dashboard" : isTrainer ? "Trainer Dashboard" : "Client Dashboard"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-5">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {user.role === "BOTH" ? (
              <Tabs defaultValue="trainer" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted p-1 rounded-xl mb-5">
                  <TabsTrigger value="trainer" className="rounded-lg text-sm"><Dumbbell className="w-3.5 h-3.5 mr-1.5" /> Trainer</TabsTrigger>
                  <TabsTrigger value="client" className="rounded-lg text-sm"><Users className="w-3.5 h-3.5 mr-1.5" /> Client</TabsTrigger>
                </TabsList>
                <TabsContent value="trainer"><TrainerDashboard /></TabsContent>
                <TabsContent value="client"><ClientDashboard /></TabsContent>
              </Tabs>
            ) : isTrainer ? (
              <TrainerDashboard />
            ) : (
              <ClientDashboard />
            )}
          </div>

          <div className="space-y-4">
            <ProfileStrength />
            <Card className="rounded-2xl border-border">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-1.5">
                <Link href="/explore">
                  <Button variant="ghost" className="w-full justify-start h-9 rounded-lg text-left text-sm font-normal px-3" data-testid="button-quick-explore">
                    <Search className="w-4 h-4 mr-2.5 text-muted-foreground" /> Find a trainer
                  </Button>
                </Link>
                <Link href="/messages">
                  <Button variant="ghost" className="w-full justify-start h-9 rounded-lg text-left text-sm font-normal px-3" data-testid="button-quick-messages">
                    <MessageSquare className="w-4 h-4 mr-2.5 text-muted-foreground" /> Messages
                  </Button>
                </Link>
                {isTrainer && <CreatePlanDialogCompact />}
                <Link href="/settings">
                  <Button variant="ghost" className="w-full justify-start h-9 rounded-lg text-left text-sm font-normal px-3" data-testid="button-quick-settings">
                    <Settings className="w-4 h-4 mr-2.5 text-muted-foreground" /> Account settings
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <RecentActivity />
          </div>
        </div>
      </div>
    </Layout>
  );
}

function NextStepCard({ hasPlans, hasFavorites, hasConversations, isTrainer }: {
  hasPlans: boolean; hasFavorites: boolean; hasConversations: boolean; isTrainer: boolean;
}) {
  let message = "";
  let cta = "";
  let href = "";
  let icon = <Sparkles className="w-4 h-4" />;
  let usePlanDialog = false;

  if (isTrainer && !hasPlans) {
    message = "Create your first coaching plan to start earning.";
    cta = "Create a plan";
    icon = <FileText className="w-4 h-4" />;
    usePlanDialog = true;
  } else if (!isTrainer && !hasFavorites) {
    message = "Browse trainers and save a few to compare.";
    cta = "Find a trainer";
    href = "/explore";
    icon = <Search className="w-4 h-4" />;
  } else if (hasConversations) {
    message = "You have conversations waiting.";
    cta = "Open messages";
    href = "/messages";
    icon = <MessageSquare className="w-4 h-4" />;
  } else {
    message = "Explore trainers and find your match.";
    cta = "Explore trainers";
    href = "/explore";
    icon = <Search className="w-4 h-4" />;
  }

  return (
    <div className="border rounded-2xl p-4 mb-5 bg-primary/[0.03]" data-testid="card-next-step">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">Your next step</span>
      </div>
      <p className="text-sm text-foreground mb-3">{message}</p>
      {usePlanDialog ? (
        <CreatePlanDialog buttonVariant="default" buttonSize="sm" />
      ) : (
        <Link href={href}>
          <Button size="sm" className="rounded-xl h-8 text-xs" data-testid="button-next-step">
            {cta} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </Link>
      )}
    </div>
  );
}

function ProfileStrength() {
  const { user } = useAuth();
  const isTrainer = user?.role === "TRAINER" || user?.role === "BOTH";
  const isClient = user?.role === "CLIENT" || user?.role === "BOTH";

  const { data: profile } = useQuery({
    queryKey: ["/api/profile"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/profile`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { data: trainerProfile } = useQuery({
    queryKey: ["/api/trainer-profile"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/trainer-profile`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: isTrainer,
  });

  const { data: clientProfile } = useQuery({
    queryKey: ["/api/client-profile"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/client-profile`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: isClient,
  });

  const { data: myPlans } = useQuery({
    queryKey: ["/api/plans"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/plans`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isTrainer,
  });

  let items: { label: string; done: boolean; tip?: string }[] = [];

  if (isTrainer) {
    items = [
      { label: "Profile photo", done: !!user?.image, tip: "Add a photo to build trust" },
      { label: "Bio added", done: !!profile?.bio && profile.bio.length > 10, tip: "Tell clients about your approach" },
      { label: "City & country", done: !!profile?.city && !!profile?.country, tip: "Help local clients find you" },
      { label: "At least one language", done: !!(profile?.languages?.length), tip: "Show which languages you coach in" },
      { label: "Specialties set", done: !!(trainerProfile?.specialties?.length), tip: "Highlight your expertise" },
      { label: "Pricing added", done: !!(trainerProfile?.priceMin > 0 && trainerProfile?.priceMax > 0), tip: "Set your price range" },
      { label: "Certifications listed", done: !!(trainerProfile?.certifications?.length), tip: "Add certifications to boost visibility" },
      { label: "Availability notes", done: !!(trainerProfile?.availabilityNotes?.length > 5), tip: "Let clients know when you're available" },
      { label: "Created a plan", done: !!myPlans?.length, tip: "Create a training plan to start earning" },
    ];
  } else if (isClient) {
    items = [
      { label: "Profile photo", done: !!user?.image, tip: "Add a photo to personalise your profile" },
      { label: "Bio added", done: !!profile?.bio && profile.bio.length > 10, tip: "Introduce yourself to trainers" },
      { label: "City & country", done: !!profile?.city && !!profile?.country, tip: "Find trainers near you" },
      { label: "At least one language", done: !!(profile?.languages?.length), tip: "Find trainers who speak your language" },
      { label: "Goals set", done: !!(clientProfile?.goals?.length), tip: "Tell trainers what you want to achieve" },
      { label: "Experience level", done: !!(clientProfile?.experienceLevel), tip: "Helps trainers tailor programmes for you" },
      { label: "Budget range", done: !!(clientProfile?.budgetMin > 0 || clientProfile?.budgetMax > 0), tip: "Set your budget to find the right trainer" },
    ];
  } else {
    items = [
      { label: "Profile photo", done: !!user?.image },
      { label: "Bio added", done: !!profile?.bio && profile.bio.length > 10 },
      { label: "City & country", done: !!profile?.city && !!profile?.country },
    ];
  }

  const completed = items.filter(i => i.done).length;
  const total = items.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const nextMissing = items.find(i => !i.done);

  return (
    <Card className="rounded-2xl border-border" data-testid="card-profile-strength">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Profile Strength</CardTitle>
          <span className="text-xs font-bold text-primary" data-testid="text-profile-pct">{pct}%</span>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="w-full h-2 bg-muted rounded-full mb-3">
          <div
            className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? 'bg-green-500' : 'bg-primary'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {pct < 100 && nextMissing?.tip && (
          <p className="text-xs text-muted-foreground mb-3 italic">💡 {nextMissing.tip}</p>
        )}
        <div className="space-y-1.5">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              {item.done ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
              )}
              <span className={item.done ? "text-muted-foreground line-through" : "text-foreground"}>{item.label}</span>
            </div>
          ))}
        </div>
        {pct < 100 && (
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="w-full mt-3 text-xs h-7 text-muted-foreground">
              Complete your profile →
            </Button>
          </Link>
        )}
        {pct === 100 && (
          <p className="text-xs text-green-600 font-medium mt-2 text-center">🎉 Profile complete!</p>
        )}
      </CardContent>
    </Card>
  );
}

function RecentActivity() {
  const { user } = useAuth();
  const isTrainer = user?.role === "TRAINER" || user?.role === "BOTH";
  const isClient = user?.role === "CLIENT" || user?.role === "BOTH";

  const { data: trainerData } = useQuery({
    queryKey: ["/api/dashboard/trainer"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/dashboard/trainer`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: isTrainer,
  });

  const { data: clientData } = useQuery({
    queryKey: ["/api/dashboard/client"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/dashboard/client`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: isClient,
  });

  type ActivityItem = { key: string; label: string; sub: string; time: Date; href: string };
  const items: ActivityItem[] = [];

  if (isTrainer && trainerData) {
    (trainerData.leads || []).slice(0, 3).forEach((lead: any) => {
      if (lead.lastMessage?.createdAt) {
        items.push({
          key: `lead-${lead.id}`,
          label: `Message from ${lead.otherUser?.name || "a client"}`,
          sub: lead.lastMessage.content?.slice(0, 60) || "New message",
          time: new Date(lead.lastMessage.createdAt),
          href: `/messages/${lead.id}`,
        });
      }
    });
    (trainerData.orders || []).slice(0, 3).forEach((order: any) => {
      if (order.status === "PAID") {
        items.push({
          key: `order-${order.id}`,
          label: `New purchase: ${order.planTitle || "Plan"}`,
          sub: `by ${order.buyerName || "a client"}`,
          time: new Date(order.createdAt),
          href: "/dashboard",
        });
      }
    });
  }

  if (isClient && clientData) {
    (clientData.orders || []).slice(0, 3).forEach((order: any) => {
      items.push({
        key: `co-${order.id}`,
        label: order.status === "PAID" ? `Purchased: ${order.planTitle || "Plan"}` : `Order: ${order.planTitle || "Plan"}`,
        sub: `with ${order.trainerName || "trainer"} · ${order.status}`,
        time: new Date(order.createdAt),
        href: "/dashboard",
      });
    });
  }

  items.sort((a, b) => b.time.getTime() - a.time.getTime());
  const shown = items.slice(0, 5);

  const timeAgo = (d: Date) => {
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <Card className="rounded-2xl border-border" data-testid="card-recent-activity">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {shown.length === 0 ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-3" data-testid="text-no-activity">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <p>No activity yet. Once you start conversations or purchases, updates will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {shown.map((item, idx) => (
              <Link key={item.key} href={item.href}>
                <div
                  className="animate-in fade-in slide-in-from-left-2 duration-400 flex items-start gap-2.5 cursor-pointer hover:opacity-75 transition-opacity"
                  style={{ animationDelay: `${idx * 60}ms`, animationFillMode: "both" }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0 animate-[pulse-dot_3s_ease-in-out_infinite]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium leading-tight truncate">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{item.sub}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">{timeAgo(item.time)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid sm:grid-cols-3 gap-3">
      {[0, 1, 2].map(i => (
        <div key={i} className="border rounded-xl p-4">
          <div className="h-3 w-16 animate-shimmer-card rounded mb-2" />
          <div className="h-7 w-10 animate-shimmer-card rounded" />
        </div>
      ))}
    </div>
  );
}

function TrainerStats({
  leads, clients, totalRevenueCents, thisMonthRevenueCents, lastMonthRevenueCents,
}: {
  leads: number;
  clients: number;
  totalRevenueCents: number;
  thisMonthRevenueCents: number;
  lastMonthRevenueCents: number;
}) {
  const PLATFORM_FEE = 0.872;
  const netTotal    = Math.round(totalRevenueCents    * PLATFORM_FEE / 100);
  const netThisMonth = Math.round(thisMonthRevenueCents * PLATFORM_FEE / 100);
  const netLastMonth = Math.round(lastMonthRevenueCents * PLATFORM_FEE / 100);

  const animLeads   = useCountUp(leads);
  const animClients = useCountUp(clients);
  const animRevenue = useCountUp(netTotal);

  const monthTrend = netLastMonth === 0
    ? null
    : Math.round(((netThisMonth - netLastMonth) / netLastMonth) * 100);

  return (
    <div className="grid sm:grid-cols-3 gap-3">
      <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 border rounded-xl p-4 transition-shadow hover:shadow-md" style={{ animationFillMode: "both" }}>
        <div className="flex items-center gap-2 mb-1 text-muted-foreground">
          <MessageSquare className="w-3.5 h-3.5" />
          <p className="text-xs">Leads</p>
        </div>
        <p className="text-2xl font-bold tabular-nums" data-testid="text-leads-count">{animLeads}</p>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 border rounded-xl p-4 transition-shadow hover:shadow-md" style={{ animationDelay: "80ms", animationFillMode: "both" }}>
        <div className="flex items-center gap-2 mb-1 text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          <p className="text-xs">Active Clients</p>
        </div>
        <p className="text-2xl font-bold tabular-nums" data-testid="text-clients-count">{animClients}</p>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 border rounded-xl p-4 transition-shadow hover:shadow-md" style={{ animationDelay: "160ms", animationFillMode: "both" }}>
        <div className="flex items-center gap-2 mb-1 text-muted-foreground">
          <CreditCard className="w-3.5 h-3.5" />
          <p className="text-xs">Net Revenue</p>
        </div>
        <p className="text-2xl font-bold tabular-nums" data-testid="text-revenue">${animRevenue}</p>
        {netThisMonth > 0 && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <span>${netThisMonth} this month</span>
            {monthTrend !== null && (
              <span className={monthTrend >= 0 ? "text-green-600" : "text-red-500"}>
                ({monthTrend >= 0 ? "+" : ""}{monthTrend}% vs last month)
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

function TrainerDashboard() {
  const { toast } = useToast();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["/api/dashboard/trainer"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/dashboard/trainer`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: earnings } = useQuery<{
    totalRevenueCents: number;
    paidOrderCount: number;
    pendingOrderCount: number;
    thisMonthRevenueCents: number;
    lastMonthRevenueCents: number;
  }>({
    queryKey: ["/api/trainer/earnings"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/trainer/earnings`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: clients } = useQuery<{
    id: string; name: string; image: string | null;
    paidAt: string; amountCents: number; planTitle: string | null;
  }[]>({
    queryKey: ["/api/trainer/clients"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/trainer/clients`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: myPlans, isLoading: plansLoading } = useQuery({
    queryKey: ["/api/plans"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/plans`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: stripeStatus } = useQuery({
    queryKey: ["/api/stripe/status"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/stripe/status`, { credentials: "include" });
      if (!res.ok) return { connected: false };
      return res.json();
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("stripe") === "connected") {
      toast({ title: "Stripe connected!", description: "You can now receive payments from clients." });
      window.history.replaceState({}, "", "/dashboard");
      queryClient.invalidateQueries({ queryKey: ["/api/stripe/status"] });
    }
    if (params.get("stripe") === "error") {
      toast({ title: "Stripe connection failed", description: "Please try again.", variant: "destructive" });
      window.history.replaceState({}, "", "/dashboard");
    }
    if (params.get("payment") === "success") {
      toast({ title: "Payment successful!", description: "Your purchase is confirmed." });
      window.history.replaceState({}, "", "/dashboard");
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    }
  }, []);

  const hasPlans = !!myPlans?.length;
  const hasConversations = !!data?.leads?.length;

  if (isError) {
    return (
      <div className="flex items-start gap-3 p-4 border border-destructive/30 rounded-2xl bg-destructive/5 text-sm">
        <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-destructive">Failed to load dashboard data</p>
          <p className="text-muted-foreground text-xs mt-0.5">Please refresh the page to try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {!isLoading && (
        <NextStepCard isTrainer={true} hasPlans={hasPlans} hasFavorites={false} hasConversations={hasConversations} />
      )}

      {isLoading ? <StatsSkeleton /> : (
        <TrainerStats
          leads={data?.leads?.length || 0}
          clients={earnings?.paidOrderCount ?? data?.activeClients?.length ?? 0}
          totalRevenueCents={earnings?.totalRevenueCents ?? 0}
          thisMonthRevenueCents={earnings?.thisMonthRevenueCents ?? 0}
          lastMonthRevenueCents={earnings?.lastMonthRevenueCents ?? 0}
        />
      )}

      <div className="border-t pt-5">
        <div className={`rounded-2xl border p-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          stripeStatus?.connected
            ? "border-green-200 bg-green-50 dark:bg-green-950/20"
            : "border-amber-200 bg-amber-50 dark:bg-amber-950/20"
        }`} data-testid="stripe-connect-card">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              stripeStatus?.connected ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
            }`}>
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm">
                {stripeStatus?.connected ? "Stripe Payments Connected" : "Connect Stripe to Accept Payments"}
              </p>
              <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                {stripeStatus?.connected
                  ? "You're set up to receive payments. Fit Finder retains a 12.8% platform fee per transaction."
                  : "Connect your Stripe account so clients can purchase your training plans."}
              </p>
            </div>
          </div>
          {stripeStatus?.connected ? (
            <Badge className="bg-green-100 text-green-700 border-green-200 shrink-0 border">Connected</Badge>
          ) : (
            <Button
              size="sm"
              className="w-full sm:w-auto shrink-0 rounded-xl"
              data-testid="button-connect-stripe"
              onClick={async () => {
                try {
                  const res = await fetch(`${API_BASE}/api/stripe/connect`, { credentials: "include" });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                  else toast({ title: "Error", description: data.message || "Could not initiate Stripe connection.", variant: "destructive" });
                } catch {
                  toast({ title: "Error", description: "Could not initiate Stripe connection.", variant: "destructive" });
                }
              }}
            >
              Connect Stripe
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold">Your Plans</h2>
          <CreatePlanDialog />
        </div>
        {plansLoading ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {[0, 1].map(i => (
              <div key={i} className="border rounded-xl p-4 animate-pulse">
                <div className="h-4 w-32 bg-muted rounded mb-2" />
                <div className="h-3 w-full bg-muted rounded mb-3" />
                <div className="h-5 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : (!myPlans || myPlans.length === 0) ? (
          <div className="flex items-center gap-3 py-4 px-4 border rounded-xl text-muted-foreground" data-testid="empty-plans">
            <FileText className="w-5 h-5 shrink-0 opacity-40" />
            <div className="flex-1">
              <p className="text-sm">No plans yet. Create your first coaching plan to attract clients.</p>
            </div>
            <CreatePlanDialog buttonVariant="outline" buttonSize="sm" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {myPlans.map((plan: any) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}
      </div>

      {data?.leads?.length > 0 && (
        <div className="border-t pt-5">
          <h2 className="text-base font-bold mb-3">Recent Leads</h2>
          <div className="space-y-2">
            {data.leads.slice(0, 5).map((lead: any) => (
              <Link key={lead.id} href={`/messages/${lead.id}`}>
                <div className="flex items-center gap-3 p-3 border rounded-xl bg-card hover:bg-muted/30 transition-colors cursor-pointer">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                    {lead.otherUser?.name?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{lead.otherUser?.name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground truncate">{lead.lastMessage?.content || "No messages yet"}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {clients && clients.length > 0 && (
        <div className="border-t pt-5">
          <h2 className="text-base font-bold mb-3">Active Clients</h2>
          <div className="space-y-2">
            {clients.slice(0, 5).map((client) => (
              <div key={`${client.id}-${client.paidAt}`} className="flex items-center gap-3 p-3 border rounded-xl bg-card">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm overflow-hidden shrink-0">
                  {client.image
                    ? <img src={client.image} alt={client.name} className="w-full h-full object-cover" />
                    : client.name?.charAt(0) || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{client.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {client.planTitle ?? "Plan"} · ${Math.round(client.amountCents * 0.872 / 100)} net
                  </p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {new Date(client.paidAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
            {clients.length > 5 && (
              <p className="text-xs text-muted-foreground text-center pt-1">+{clients.length - 5} more clients</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ClientDashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["/api/dashboard/client"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/dashboard/client`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: suggestedTrainers } = useQuery({
    queryKey: ["/api/trainers", "suggested"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/trainers?pageSize=3`);
      if (!res.ok) return { trainers: [] };
      return res.json();
    },
  });

  const hasFavorites = !!data?.favorites?.length;
  const hasOrders = !!data?.orders?.length;

  if (isError) {
    return (
      <div className="flex items-start gap-3 p-4 border border-destructive/30 rounded-2xl bg-destructive/5 text-sm">
        <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-destructive">Failed to load dashboard data</p>
          <p className="text-muted-foreground text-xs mt-0.5">Please refresh the page to try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {!isLoading && (
        <NextStepCard isTrainer={false} hasPlans={false} hasFavorites={hasFavorites} hasConversations={false} />
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1].map(i => (
            <div key={i} className="border rounded-xl p-4 animate-pulse">
              <div className="h-4 w-32 bg-muted rounded mb-2" />
              <div className="h-3 w-48 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div>
            <h2 className="text-base font-bold mb-3">Your Orders</h2>
            {!hasOrders ? (
              <div className="flex items-center gap-3 py-4 px-4 border rounded-xl text-muted-foreground" data-testid="empty-orders">
                <CreditCard className="w-5 h-5 shrink-0 opacity-40" />
                <div className="flex-1">
                  <p className="text-sm">No orders yet. Purchase a training plan to get started.</p>
                </div>
                <Link href="/explore">
                  <Button variant="outline" size="sm" className="rounded-xl text-xs shrink-0">
                    Browse <ChevronRight className="w-3 h-3 ml-0.5" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {data.orders.map((order: any) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>

          <div className="border-t pt-5">
            <h2 className="text-base font-bold mb-3">Saved Trainers</h2>
            {!hasFavorites ? (
              <div className="flex items-center gap-3 py-4 px-4 border rounded-xl text-muted-foreground" data-testid="empty-favorites">
                <Heart className="w-5 h-5 shrink-0 opacity-40" />
                <div className="flex-1">
                  <p className="text-sm">No saved trainers yet. Browse and save trainers to compare.</p>
                </div>
                <Link href="/explore">
                  <Button variant="outline" size="sm" className="rounded-xl text-xs shrink-0">
                    Explore <ChevronRight className="w-3 h-3 ml-0.5" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {data.favorites.map((fav: any) => (
                  <Link key={fav.id} href={`/profile/${fav.trainerId}`}>
                    <div className="border rounded-xl p-3 flex gap-3 bg-card items-center hover:bg-muted/30 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm overflow-hidden shrink-0">
                        {fav.image ? (
                          <img src={fav.image} alt={fav.name} className="w-full h-full object-cover" />
                        ) : (
                          fav.name?.charAt(0) || "?"
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm">{fav.name}</h4>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {suggestedTrainers?.trainers?.length > 0 && (
            <div className="border-t pt-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold">Suggested Trainers</h2>
                <Link href="/explore">
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7">
                    View all <ChevronRight className="w-3 h-3 ml-0.5" />
                  </Button>
                </Link>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                {suggestedTrainers.trainers.slice(0, 3).map((t: any) => (
                  <Link key={t.id} href={`/profile/${t.id}`}>
                    <div className="border rounded-xl p-3 hover:bg-muted/30 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer" data-testid={`suggested-trainer-${t.id}`}>
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs overflow-hidden shrink-0">
                          {t.image ? (
                            <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                          ) : (
                            t.name?.charAt(0)
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{t.name}</p>
                          <p className="text-[11px] text-muted-foreground flex items-center">
                            <MapPin className="w-2.5 h-2.5 mr-0.5" />{t.city}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(t.specialties || []).slice(0, 2).map((s: string) => (
                          <span key={s} className="px-1.5 py-0.5 bg-secondary text-secondary-foreground text-[10px] font-medium rounded">{s}</span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PlanCard({ plan }: { plan: any }) {
  const [editOpen, setEditOpen] = useState(false);
  return (
    <div className="border rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group">
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-semibold text-sm flex-1 mr-2">{plan.title}</h3>
        <div className="flex items-center gap-1.5">
          <Badge variant={plan.isActive ? "default" : "secondary"} className="text-[10px] px-1.5">{plan.isActive ? "Active" : "Inactive"}</Badge>
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground" aria-label="Edit plan">
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader><DialogTitle>Edit Plan</DialogTitle></DialogHeader>
              <EditPlanDialog plan={plan} onClose={() => setEditOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{plan.description}</p>
      <p className="font-bold text-sm">${(plan.priceCents / 100).toFixed(0)} <span className="text-xs font-normal text-muted-foreground">/ {plan.billingType === "MONTHLY" ? "month" : "one-time"}</span></p>
    </div>
  );
}

function CreatePlanDialogCompact() {
  return (
    <CreatePlanDialog buttonVariant="ghost" buttonSize="default" isCompact />
  );
}

function EditPlanDialog({ plan, onClose }: { plan: any; onClose: () => void }) {
  const { toast } = useToast();
  const [title, setTitle] = useState(plan.title || "");
  const [description, setDescription] = useState(plan.description || "");
  const [price, setPrice] = useState(String((plan.priceCents / 100).toFixed(2)));
  const [billingType, setBillingType] = useState(plan.billingType || "ONE_TIME");
  const [isActive, setIsActive] = useState(plan.isActive !== false);
  const [deleting, setDeleting] = useState(false);

  const editMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/plans/${plan.id}`, {
        title,
        description,
        priceCents: Math.round(parseFloat(price) * 100),
        billingType,
        isActive,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Plan updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      onClose();
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleDelete = async () => {
    if (!window.confirm("Delete this plan? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await apiRequest("PATCH", `/api/plans/${plan.id}`, { isActive: false });
      toast({ title: "Plan deactivated" });
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      onClose();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-2">
        <Label htmlFor="edit-plan-title" className="text-sm">Title</Label>
        <Input id="edit-plan-title" value={title} onChange={e => setTitle(e.target.value)} className="rounded-xl h-10" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-plan-description" className="text-sm">Description</Label>
        <Textarea id="edit-plan-description" value={description} onChange={e => setDescription(e.target.value)} className="rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-plan-price" className="text-sm">Price ($)</Label>
          <Input id="edit-plan-price" type="number" min={0.50} step={0.01} value={price} onChange={e => setPrice(e.target.value)} className="rounded-xl h-10" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-plan-billing" className="text-sm">Billing</Label>
          <Select value={billingType} onValueChange={setBillingType}>
            <SelectTrigger id="edit-plan-billing" className="rounded-xl h-10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ONE_TIME">One-Time</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center justify-between p-3 border rounded-xl">
        <div>
          <p className="text-sm font-medium">Plan Active</p>
          <p className="text-xs text-muted-foreground">Inactive plans won't be visible to clients</p>
        </div>
        <button
          onClick={() => setIsActive(a => !a)}
          className={`transition-colors duration-200 ${isActive ? "text-primary" : "text-muted-foreground"}`}
        >
          {isActive ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
        </button>
      </div>
      <div className="flex gap-2 pt-1">
        <Button
          className="flex-1 rounded-xl h-10"
          onClick={() => editMutation.mutate()}
          disabled={!title || !price || editMutation.isPending}
        >
          {editMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
        <Button
          variant="outline"
          className="rounded-xl h-10 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: any }) {
  const { toast } = useToast();
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hasReviewed, setHasReviewed] = useState<boolean>(order.hasReviewed ?? false);

  const reviewMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/reviews", {
        orderId: order.id,
        rating,
        comment: comment || undefined,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Review submitted!" });
      setHasReviewed(true);
      setReviewOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/client"] });
    },
    onError: (err: any) => {
      const msg = err.message?.includes(":") ? err.message.split(":").slice(1).join(":").trim() : err.message;
      if (msg?.includes("already reviewed")) {
        setHasReviewed(true);
        setReviewOpen(false);
      }
      toast({ title: "Error", description: msg, variant: "destructive" });
    },
  });

  return (
    <div className="flex items-center justify-between p-3 border rounded-xl bg-card transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5">
      <div>
        <p className="font-medium text-sm">{order.planTitle || "Custom Plan"}</p>
        <p className="text-xs text-muted-foreground">with {order.trainerName}</p>
      </div>
      <div className="flex items-center gap-2">
        {order.status === "PAID" && !hasReviewed && (
          <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-xl text-xs h-7 gap-1">
                <Star className="w-3 h-3" /> Review
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle>Leave a Review</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <Label className="text-sm mb-2 block">Rating</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-0.5 transition-transform duration-100 hover:scale-125 active:scale-95"
                      >
                        <Star className={`w-6 h-6 transition-colors duration-150 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30 hover:text-yellow-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm mb-2 block">Comment (optional)</Label>
                  <Textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="How was your experience?"
                    maxLength={500}
                    className="rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{comment.length}/500</p>
                </div>
                <Button
                  className="w-full rounded-xl"
                  onClick={() => reviewMutation.mutate()}
                  disabled={reviewMutation.isPending}
                >
                  {reviewMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Submit Review
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
        <div className="text-right">
          <p className="font-bold text-sm">${(order.amountCents / 100).toFixed(0)}</p>
          <Badge variant={order.status === "PAID" ? "default" : "secondary"} className="text-[10px]">{order.status}</Badge>
        </div>
      </div>
    </div>
  );
}

function CreatePlanDialog({ buttonVariant = "default", buttonSize = "sm", isCompact = false }: {
  buttonVariant?: "default" | "outline" | "ghost";
  buttonSize?: "sm" | "default";
  isCompact?: boolean;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [billingType, setBillingType] = useState("ONE_TIME");

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/plans", {
        title, description,
        priceCents: Math.round(parseFloat(price) * 100),
        billingType,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Plan created!" });
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      setOpen(false);
      setTitle(""); setDescription(""); setPrice("");
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isCompact ? (
          <Button variant={buttonVariant} className="w-full justify-start h-9 rounded-lg text-left text-sm font-normal px-3">
            <Plus className="w-4 h-4 mr-2.5 text-muted-foreground" /> Create a plan
          </Button>
        ) : (
          <Button variant={buttonVariant} size={buttonSize} className="rounded-xl" data-testid="button-create-plan">
            <Plus className="w-3.5 h-3.5 mr-1" /> New Plan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader><DialogTitle>Create a Plan</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="plan-title" className="text-sm">Title</Label>
            <Input id="plan-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Online Coaching" className="rounded-xl h-10" data-testid="input-plan-title" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan-description" className="text-sm">Description</Label>
            <Textarea id="plan-description" value={description} onChange={e => setDescription(e.target.value)} placeholder="What's included..." className="rounded-xl" data-testid="input-plan-description" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plan-price" className="text-sm">Price ($)</Label>
              <Input id="plan-price" type="number" min={1} value={price} onChange={e => setPrice(e.target.value)} placeholder="100" className="rounded-xl h-10" data-testid="input-plan-price" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-billing" className="text-sm">Billing</Label>
              <Select value={billingType} onValueChange={setBillingType}>
                <SelectTrigger id="plan-billing" className="rounded-xl h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ONE_TIME">One-Time</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="w-full rounded-xl h-10" onClick={() => createMutation.mutate()} disabled={!title || !price || createMutation.isPending} data-testid="button-submit-plan">
            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Plan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
