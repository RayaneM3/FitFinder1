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
  FileText, User, Sparkles, ArrowRight, Star
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { apiRequest, queryClient, API_BASE } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

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
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-background shadow-sm bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
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
  return (
    <Card className="rounded-2xl border-border" data-testid="card-recent-activity">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-3" data-testid="text-no-activity">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <p>No activity yet. Once you start conversations or purchases, updates will appear here.</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid sm:grid-cols-3 gap-3">
      {[0, 1, 2].map(i => (
        <div key={i} className="border rounded-xl p-4 animate-pulse">
          <div className="h-3 w-16 bg-muted rounded mb-2" />
          <div className="h-7 w-10 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}

function TrainerDashboard() {
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/dashboard/trainer"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/dashboard/trainer`, { credentials: "include" });
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

  const CreatePlanDialogCompact = () => null; // Placeholder for compact version

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
  const revenue = ((data?.orders || []).filter((o: any) => o.status === "PAID").reduce((sum: number, o: any) => sum + o.amountCents, 0) / 100);

  return (
    <div className="space-y-5">
      {!isLoading && (
        <NextStepCard isTrainer={true} hasPlans={hasPlans} hasFavorites={false} hasConversations={hasConversations} />
      )}

      {isLoading ? <StatsSkeleton /> : (
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Leads</p>
            </div>
            <p className="text-2xl font-bold" data-testid="text-leads-count">{data?.leads?.length || 0}</p>
          </div>
          <div className="border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Active Clients</p>
            </div>
            <p className="text-2xl font-bold" data-testid="text-clients-count">{data?.activeClients?.length || 0}</p>
          </div>
          <div className="border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Revenue</p>
            </div>
            <p className="text-2xl font-bold" data-testid="text-revenue">${revenue.toFixed(0)}</p>
          </div>
        </div>
      )}

      <div className="border-t pt-5">
        <div className={`rounded-2xl border p-4 mb-4 flex items-center justify-between gap-4 ${
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
              className="shrink-0 rounded-xl"
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
              <div key={plan.id} className="border rounded-xl p-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-sm">{plan.title}</h3>
                  <Badge variant={plan.isActive ? "default" : "secondary"} className="text-[10px] px-1.5">{plan.isActive ? "Active" : "Inactive"}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{plan.description}</p>
                <p className="font-bold text-sm">${(plan.priceCents / 100).toFixed(0)} <span className="text-xs font-normal text-muted-foreground">/ {plan.billingType === "MONTHLY" ? "month" : "one-time"}</span></p>
              </div>
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
    </div>
  );
}

function ClientDashboard() {
  const { data, isLoading } = useQuery({
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
                    <div className="border rounded-xl p-3 flex gap-3 bg-card items-center hover:bg-muted/30 transition-colors cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                        {fav.name?.charAt(0) || "?"}
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
                    <div className="border rounded-xl p-3 hover:bg-muted/30 transition-colors cursor-pointer" data-testid={`suggested-trainer-${t.id}`}>
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                          {t.name?.charAt(0)}
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

function CreatePlanDialogCompact() {
  return (
    <CreatePlanDialog buttonVariant="ghost" buttonSize="default" isCompact />
  );
}

function OrderCard({ order }: { order: any }) {
  const { toast } = useToast();
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hasReviewed, setHasReviewed] = useState(false);

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
    <div className="flex items-center justify-between p-3 border rounded-xl bg-card">
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
                        className="p-0.5"
                      >
                        <Star className={`w-6 h-6 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
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
          <div className="grid grid-cols-2 gap-4">
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
