import { useParams, useLocation } from "wouter";
import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, MessageSquare, Heart, Award, ShieldAlert, ShieldCheck, Loader2, ArrowLeft, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, API_BASE } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { getCurrencySymbol } from "@/lib/utils";

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [reportCategory, setReportCategory] = useState("HARASSMENT");
  const [reportDetails, setReportDetails] = useState("");
  const [reportOpen, setReportOpen] = useState(false);

  const { data: trainer, isLoading } = useQuery({
    queryKey: ["/api/trainers", id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/trainers/${id}`);
      if (!res.ok) throw new Error("Trainer not found");
      return res.json();
    },
    enabled: !!id,
  });

  useEffect(() => {
    document.title = trainer?.name ? `${trainer.name} | Fit Finder` : "Trainer Profile | Fit Finder";
    return () => { document.title = "Fit Finder"; };
  }, [trainer?.name]);

  const requestChatMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/conversations", { trainerId: id });
      return res.json();
    },
    onSuccess: (convo) => {
      toast({ title: "Chat started!", description: `You can now message ${trainer?.name}.` });
      setLocation(`/messages/${convo.id}`);
    },
    onError: (err: any) => {
      const msg = err.message?.includes(":") ? err.message.split(":").slice(1).join(":").trim() : err.message;
      if (msg?.includes("Unauthorized")) {
        setLocation("/auth");
        return;
      }
      toast({ title: "Error", description: msg, variant: "destructive" });
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: async (planId: string) => {
      const res = await apiRequest("POST", "/api/checkout", { planId });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.message || "Could not start checkout");
      }
    },
    onError: (err: any) => {
      const msg = err.message?.includes(":") ? err.message.split(":").slice(1).join(":").trim() : err.message;
      toast({ title: "Payment error", description: msg, variant: "destructive" });
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/favorites/toggle", { trainerId: id });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trainers", id] });
    },
    onError: (err: any) => {
      if (err.message?.includes("401")) { setLocation("/auth"); return; }
      toast({ title: "Error", variant: "destructive" });
    },
  });

  const blockMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/block", { blockedId: id });
    },
    onSuccess: () => {
      toast({ title: "User blocked" });
      setLocation("/explore");
    },
  });

  const reportMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/report", { reportedId: id, category: reportCategory, details: reportDetails });
    },
    onSuccess: () => {
      toast({ title: "Report submitted", description: "We'll investigate this anonymously." });
      setReportDetails("");
      setReportOpen(false);
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-32"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
      </Layout>
    );
  }

  if (!trainer) {
    return (
      <Layout>
        <div className="text-center py-32">
          <h2 className="text-2xl font-bold mb-2">Trainer not found</h2>
          <Button onClick={() => setLocation("/explore")} className="rounded-xl mt-4">Browse Trainers</Button>
        </div>
      </Layout>
    );
  }

  const coachingLabel = trainer.coachingMode === "ONLINE" ? "Online" : trainer.coachingMode === "IN_PERSON" ? "In-Person" : "Hybrid";
  const currency = getCurrencySymbol(trainer.country || "");

  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-5xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl text-muted-foreground hover:text-foreground -ml-2"
            onClick={() => window.history.back()}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to search
          </Button>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
          <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 rounded-2xl overflow-hidden shadow-lg border-4 border-background relative bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            {trainer.image ? (
              <img src={trainer.image} alt={trainer.name} className="w-full h-full object-cover" data-testid="img-trainer-avatar" />
            ) : (
              <span className="text-5xl font-bold text-primary">{trainer.name?.charAt(0) || "T"}</span>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight" data-testid="text-trainer-name">{trainer.name}</h1>
                  {trainer.totalReviews > 0 && (
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {trainer.averageRating} ({trainer.totalReviews})
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {trainer.city}, {trainer.country}</span>
                  <span className="flex items-center gap-1.5"><Award className="w-4 h-4" /> {trainer.yearsExperience} years exp</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className={`rounded-xl ${trainer.isFavorited ? 'text-red-500' : ''}`}
                  onClick={() => favoriteMutation.mutate()}
                  data-testid="button-favorite"
                  aria-label={trainer.isFavorited ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart className={`w-4 h-4 ${trainer.isFavorited ? 'fill-red-500' : ''}`} />
                </Button>
                <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-destructive" data-testid="button-report-dialog" aria-label="Report or block trainer">
                      <ShieldAlert className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                      <DialogTitle>Report or Block {trainer.name}</DialogTitle>
                      <DialogDescription>Your safety is our priority. We investigate all reports anonymously.</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 py-4">
                      <Button variant="outline" className="justify-start" onClick={() => blockMutation.mutate()} data-testid="button-block">
                        Block this trainer
                      </Button>
                      <div className="border-t pt-4 space-y-3">
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
                        <Textarea value={reportDetails} onChange={e => setReportDetails(e.target.value)} placeholder="Describe what happened..." className="rounded-xl" aria-label="Report details description" />
                        <Button variant="destructive" className="w-full rounded-xl" onClick={() => reportMutation.mutate()} disabled={reportMutation.isPending} data-testid="button-report">
                          {reportMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                          Submit Report
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="secondary" className="font-normal rounded-lg">{coachingLabel} Coaching</Badge>
              {(trainer.languages || []).length > 0 && (
                <Badge variant="outline" className="font-normal rounded-lg bg-background">Speaks {trainer.languages.join(", ")}</Badge>
              )}
            </div>

            <div className="pt-4 border-t flex flex-wrap items-center gap-4">
              <Button
                size="lg"
                className="rounded-xl h-12 px-8 shadow-md"
                onClick={() => requestChatMutation.mutate()}
                disabled={requestChatMutation.isPending || (user?.id === id)}
                data-testid="button-request-chat"
              >
                {requestChatMutation.isPending ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <MessageSquare className="mr-2 h-5 w-5" />
                )}
                Request to Chat
              </Button>
              <div className="text-sm">
                <p className="font-semibold">{currency}{trainer.priceMin} - {currency}{trainer.priceMax}</p>
                <p className="text-muted-foreground text-xs">Per session avg.</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Client-first messaging: you start the conversation when you're ready.</p>
          </div>
        </div>

        <div className="mt-8 md:mt-12">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b rounded-none mb-8 space-x-6 overflow-x-auto">
              <TabsTrigger value="about" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 pt-2 text-base font-medium text-muted-foreground data-[state=active]:text-foreground">About</TabsTrigger>
              <TabsTrigger value="specialties" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 pt-2 text-base font-medium text-muted-foreground data-[state=active]:text-foreground">Specialties</TabsTrigger>
              <TabsTrigger value="plans" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 pt-2 text-base font-medium text-muted-foreground data-[state=active]:text-foreground">Plans & Pricing</TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 pt-2 text-base font-medium text-muted-foreground data-[state=active]:text-foreground">Reviews{trainer.totalReviews > 0 ? ` (${trainer.totalReviews})` : ""}</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-8 animate-in fade-in">
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <h3 className="text-xl font-bold mb-4">Meet {trainer.name?.split(' ')[0]}</h3>
                <p className="text-lg leading-relaxed text-muted-foreground">{trainer.bio || "This trainer hasn't added a bio yet."}</p>
              </div>
              <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                <h4 className="font-semibold flex items-center gap-2 mb-2"><ShieldCheck className="w-5 h-5 text-primary" /> Location Privacy</h4>
                <p className="text-sm text-muted-foreground">For your safety and the trainer's, exact training locations are only revealed after a chat request is accepted.</p>
              </div>
            </TabsContent>

            <TabsContent value="specialties" className="animate-in fade-in">
              <div className="grid md:grid-cols-2 gap-6">
                {(trainer.specialties || []).map((spec: string) => (
                  <div key={spec} className="p-6 rounded-2xl border bg-card">
                    <h3 className="font-bold text-lg mb-2">{spec}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Customized programming focusing on progressive overload and proper mechanics to ensure you reach your {spec.toLowerCase()} goals safely.
                    </p>
                  </div>
                ))}
              </div>
              {(trainer.certifications || []).length > 0 && (
                <>
                  <h3 className="font-bold text-xl mt-12 mb-6">Certifications</h3>
                  <div className="flex flex-wrap gap-4">
                    {trainer.certifications.map((cert: string) => (
                      <Badge key={cert} variant="outline" className="px-4 py-2 rounded-xl text-sm font-medium bg-background">{cert}</Badge>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="plans" className="animate-in fade-in">
              {(trainer.plans || []).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg font-medium">No plans available yet</p>
                  <p className="text-sm mt-1">This trainer hasn't published any plans. Start a chat to discuss pricing.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-8">
                  {trainer.plans.map((plan: any, i: number) => (
                    <div key={plan.id} className={`border ${i === 0 ? 'border-primary' : ''} rounded-3xl p-8 bg-card flex flex-col relative overflow-hidden hover:shadow-lg transition-shadow`}>
                      {i === 0 && (
                        <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">Featured</div>
                      )}
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold mb-2">{plan.title}</h3>
                        <p className="text-muted-foreground">{plan.description}</p>
                      </div>
                      <div className="mb-6">
                        <span className="text-4xl font-bold">{currency}{(plan.priceCents / 100).toFixed(0)}</span>
                        <span className="text-muted-foreground font-medium"> / {plan.billingType === "MONTHLY" ? "month" : "one-time"}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-5">
                        Secure payment via Stripe. A 12.8% platform fee applies.
                      </p>
                      <div className="flex flex-col gap-2 mt-auto">
                        <Button
                          className="w-full rounded-xl h-12 font-semibold"
                          variant={i === 0 ? "default" : "outline"}
                          onClick={() => purchaseMutation.mutate(plan.id)}
                          disabled={purchaseMutation.isPending}
                          data-testid={`button-purchase-plan-${plan.id}`}
                        >
                          {purchaseMutation.isPending ? "Loading…" : "Get This Plan"}
                        </Button>
                        <Button
                          className="w-full rounded-xl h-10 font-medium"
                          variant="ghost"
                          onClick={() => requestChatMutation.mutate()}
                          disabled={requestChatMutation.isPending}
                          data-testid={`button-plan-chat-${plan.id}`}
                        >
                          Chat with Trainer First
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="animate-in fade-in">
              {(trainer.reviews || []).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg font-medium">No reviews yet</p>
                  <p className="text-sm mt-1">Be the first to leave a review after purchasing a plan.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-5 h-5 ${star <= Math.round(trainer.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                      ))}
                    </div>
                    <span className="text-lg font-semibold">{trainer.averageRating}</span>
                    <span className="text-muted-foreground">({trainer.totalReviews} review{trainer.totalReviews !== 1 ? 's' : ''})</span>
                  </div>
                  {trainer.reviews.map((review: any) => (
                    <div key={review.id} className="border rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {review.reviewerName?.charAt(0) || "?"}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{review.reviewerName}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className={`w-3 h-3 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
