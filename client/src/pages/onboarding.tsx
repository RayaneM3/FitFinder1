import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Dumbbell, User, Users, ChevronRight, ChevronLeft, Check, Sparkles } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "wouter";

const LEGAL_VERSION = "2026-03-04";

const SPECIALTIES = [
  "Strength Training", "Weight Loss", "HIIT", "Yoga", "Pilates",
  "Powerlifting", "Bodybuilding", "Rehab", "Mobility", "Athletic Performance",
  "Pre/Postnatal", "Nutrition", "Functional Fitness", "CrossFit", "Boxing",
];

const GOALS = [
  "Lose Weight", "Build Muscle", "Improve Flexibility", "Get Stronger",
  "Train for Event", "Injury Recovery", "General Fitness", "Sports Performance",
];

const LANGUAGES = ["English", "Spanish", "French", "Mandarin", "Hindi", "Russian", "Portuguese", "Arabic", "German", "Japanese"];

const STEP_LABELS: Record<number, string> = {
  1: "Choose your role",
  2: "Your profile",
  3: "Specialties & pricing",
  4: "Fitness goals",
};

const CLIENT_STEP_LABELS: Record<number, string> = {
  1: "Choose your role",
  2: "Your profile",
  3: "Fitness goals",
};

export default function Onboarding() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Get Started | Fit Finder";
    return () => { document.title = "Fit Finder"; };
  }, []);

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  const [role, setRole] = useState<"CLIENT" | "TRAINER" | "BOTH" | "">("");
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    bio: "",
    city: "",
    country: "",
    languages: ["English"],
    coachingMode: "ONLINE" as "ONLINE" | "IN_PERSON" | "HYBRID",
  });
  const [trainerData, setTrainerData] = useState({
    specialties: [] as string[],
    yearsExperience: 0,
    certifications: [] as string[],
    priceMin: 50,
    priceMax: 150,
    availabilityNotes: "",
  });
  const [clientData, setClientData] = useState({
    goals: [] as string[],
    experienceLevel: "BEGINNER" as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
    budgetMin: 30,
    budgetMax: 200,
  });
  const [certInput, setCertInput] = useState("");
  const [acceptedTrainerAgreement, setAcceptedTrainerAgreement] = useState(false);
  const [acceptedClientWaiver, setAcceptedClientWaiver] = useState(false);

  useEffect(() => {
    if (!user) setLocation("/auth");
    else if (user.onboardingComplete) setLocation("/dashboard");
  }, [user, setLocation]);

  if (!user || user.onboardingComplete) return null;

  const totalSteps = role === "BOTH" ? 4 : 3;

  const stepLabel = role === "CLIENT"
    ? CLIENT_STEP_LABELS[step] || ""
    : STEP_LABELS[step] || "";

  const toggleItem = (arr: string[], item: string, setter: (v: string[]) => void) => {
    setter(arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]);
  };

  const goBack = () => {
    setDirection("backward");
    setStep(s => s - 1);
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      if (step === 1) {
        if (!role) { toast({ title: "Select a role", variant: "destructive" }); setLoading(false); return; }
        await apiRequest("POST", "/api/onboarding/role", { role });
        setDirection("forward");
        setStep(2);
      } else if (step === 2) {
        if (!profileData.city || !profileData.country) {
          toast({ title: "Please fill in city and country", variant: "destructive" }); setLoading(false); return;
        }
        await apiRequest("POST", "/api/onboarding/profile", {
          ...profileData,
          name: profileData.name || user.name,
        });
        setDirection("forward");
        setStep(3);
      } else if (step === 3) {
        if (role === "TRAINER" || role === "BOTH") {
          if (trainerData.specialties.length === 0) {
            toast({ title: "Select at least one specialty", variant: "destructive" }); setLoading(false); return;
          }
          if (!acceptedTrainerAgreement) {
            toast({ title: "Please accept the Trainer Agreement to continue.", variant: "destructive" }); setLoading(false); return;
          }
          await apiRequest("POST", "/api/onboarding/trainer", trainerData);
          try { await apiRequest("POST", "/api/legal/accept", { documentType: "TRAINER_AGREEMENT", version: LEGAL_VERSION }); } catch {}
          if (role === "BOTH") {
            setDirection("forward");
            setStep(4);
            setLoading(false);
            return;
          }
        }
        if (role === "CLIENT") {
          if (clientData.goals.length === 0) {
            toast({ title: "Select at least one goal", variant: "destructive" }); setLoading(false); return;
          }
          if (!acceptedClientWaiver) {
            toast({ title: "Please accept the Client Waiver to continue.", variant: "destructive" }); setLoading(false); return;
          }
          await apiRequest("POST", "/api/onboarding/client", clientData);
          try { await apiRequest("POST", "/api/legal/accept", { documentType: "CLIENT_WAIVER", version: LEGAL_VERSION }); } catch {}
        }
        await apiRequest("POST", "/api/onboarding/complete", {});
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        setComplete(true);
        setTimeout(() => setLocation("/dashboard"), 1200);
      } else if (step === 4) {
        if (clientData.goals.length === 0) {
          toast({ title: "Select at least one goal", variant: "destructive" }); setLoading(false); return;
        }
        if (!acceptedClientWaiver) {
          toast({ title: "Please accept the Client Waiver to continue.", variant: "destructive" }); setLoading(false); return;
        }
        await apiRequest("POST", "/api/onboarding/client", clientData);
        try { await apiRequest("POST", "/api/legal/accept", { documentType: "CLIENT_WAIVER", version: LEGAL_VERSION }); } catch {}
        await apiRequest("POST", "/api/onboarding/complete", {});
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        setComplete(true);
        setTimeout(() => setLocation("/dashboard"), 1200);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (complete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-in fade-in zoom-in-75 duration-500">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">You're all set!</h2>
          <p className="text-muted-foreground">Taking you to your dashboard…</p>
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto mt-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">F</div>
          <span className="font-heading font-bold text-xl tracking-tight">Fit Finder</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Progress bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Step {step} of {totalSteps}
              </span>
              <span className="text-xs font-medium text-primary">{stepLabel}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ease-out ${
                    i + 1 <= step ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Animated step content */}
          <div
            key={step}
            className={`mt-8 animate-in fade-in duration-300 ${
              direction === "forward" ? "slide-in-from-right-6" : "slide-in-from-left-6"
            }`}
          >
            {step === 1 && (
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">How will you use Fit Finder?</h2>
                <p className="text-muted-foreground mb-8">You can always change this later.</p>
                <div className="grid gap-4 md:grid-cols-3">
                  {([
                    { value: "CLIENT", icon: User, title: "I'm a Client", desc: "Find and work with trainers" },
                    { value: "TRAINER", icon: Dumbbell, title: "I'm a Trainer", desc: "Grow your coaching business" },
                    { value: "BOTH", icon: Users, title: "Both", desc: "Train clients & find coaches" },
                  ] as const).map((opt, idx) => (
                    <button
                      key={opt.value}
                      onClick={() => setRole(opt.value)}
                      style={{ animationDelay: `${idx * 60}ms` }}
                      className={`animate-in fade-in slide-in-from-bottom-3 p-6 rounded-2xl border-2 text-left transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                        role === opt.value
                          ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
                          : "border-border hover:border-primary/40 hover:scale-[1.01] bg-card"
                      }`}
                      data-testid={`role-${opt.value.toLowerCase()}`}
                      aria-label={`Select role: ${opt.title}`}
                    >
                      <opt.icon className={`w-8 h-8 mb-4 transition-colors duration-200 ${role === opt.value ? "text-primary" : "text-muted-foreground"}`} />
                      <h3 className="font-bold text-lg mb-1">{opt.title}</h3>
                      <p className="text-sm text-muted-foreground">{opt.desc}</p>
                      <div className={`mt-3 transition-all duration-200 overflow-hidden ${role === opt.value ? "opacity-100 max-h-8" : "opacity-0 max-h-0"}`}>
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                          <span className="text-xs font-medium text-primary">Selected</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">Tell us about yourself</h2>
                <p className="text-muted-foreground mb-8">This helps create your public profile.</p>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="display-name">Display Name</Label>
                    <Input id="display-name" value={profileData.name} onChange={e => setProfileData(p => ({ ...p, name: e.target.value }))} className="h-12 rounded-xl" data-testid="input-display-name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" value={profileData.bio} onChange={e => setProfileData(p => ({ ...p, bio: e.target.value }))} placeholder="Tell people about yourself..." className="rounded-xl min-h-[100px]" data-testid="input-bio" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City <span className="text-destructive">*</span></Label>
                      <Input id="city" value={profileData.city} onChange={e => setProfileData(p => ({ ...p, city: e.target.value }))} placeholder="San Francisco" className="h-12 rounded-xl" data-testid="input-city" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country <span className="text-destructive">*</span></Label>
                      <Input id="country" value={profileData.country} onChange={e => setProfileData(p => ({ ...p, country: e.target.value }))} placeholder="United States" className="h-12 rounded-xl" data-testid="input-country" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Languages</Label>
                    <div className="flex flex-wrap gap-2">
                      {LANGUAGES.map(lang => (
                        <Badge
                          key={lang}
                          variant={profileData.languages.includes(lang) ? "default" : "outline"}
                          className="cursor-pointer rounded-lg px-3 py-1.5 text-sm transition-all duration-150 active:scale-90 select-none"
                          onClick={() => toggleItem(profileData.languages, lang, (v) => setProfileData(p => ({ ...p, languages: v })))}
                        >
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coaching-mode">Coaching Mode Preference</Label>
                    <Select value={profileData.coachingMode} onValueChange={v => setProfileData(p => ({ ...p, coachingMode: v as any }))}>
                      <SelectTrigger id="coaching-mode" className="h-12 rounded-xl" data-testid="select-coaching-mode"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ONLINE">Online</SelectItem>
                        <SelectItem value="IN_PERSON">In-Person</SelectItem>
                        <SelectItem value="HYBRID">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (role === "TRAINER" || role === "BOTH") && (
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">Your Training Expertise</h2>
                <p className="text-muted-foreground mb-8">Help clients find you by the right specialties.</p>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label>Specialties <span className="text-destructive">*</span></Label>
                    <div className="flex flex-wrap gap-2">
                      {SPECIALTIES.map(spec => (
                        <Badge
                          key={spec}
                          variant={trainerData.specialties.includes(spec) ? "default" : "outline"}
                          className="cursor-pointer rounded-lg px-3 py-1.5 text-sm transition-all duration-150 active:scale-90 select-none"
                          onClick={() => toggleItem(trainerData.specialties, spec, (v) => setTrainerData(p => ({ ...p, specialties: v })))}
                        >
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Input id="experience" type="number" min={0} value={trainerData.yearsExperience} onChange={e => setTrainerData(p => ({ ...p, yearsExperience: parseInt(e.target.value) || 0 }))} className="h-12 rounded-xl" data-testid="input-experience" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="certification">Add Certification</Label>
                      <div className="flex gap-2">
                        <Input id="certification" value={certInput} onChange={e => setCertInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && certInput.trim()) { setTrainerData(p => ({ ...p, certifications: [...p.certifications, certInput.trim()] })); setCertInput(""); }}} placeholder="e.g. NASM CPT" className="h-12 rounded-xl" data-testid="input-certification" />
                        <Button type="button" variant="outline" className="h-12 rounded-xl" onClick={() => {
                          if (certInput.trim()) {
                            setTrainerData(p => ({ ...p, certifications: [...p.certifications, certInput.trim()] }));
                            setCertInput("");
                          }
                        }}>Add</Button>
                      </div>
                    </div>
                  </div>
                  {trainerData.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {trainerData.certifications.map((cert, i) => (
                        <Badge key={i} variant="secondary" className="rounded-lg px-3 py-1.5 animate-in fade-in zoom-in-90 duration-200">
                          {cert}
                          <button className="ml-2 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setTrainerData(p => ({ ...p, certifications: p.certifications.filter((_, j) => j !== i) }))}>×</button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price-min">Min Price ($/session)</Label>
                      <Input id="price-min" type="number" min={0} value={trainerData.priceMin} onChange={e => setTrainerData(p => ({ ...p, priceMin: parseInt(e.target.value) || 0 }))} className="h-12 rounded-xl" data-testid="input-price-min" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price-max">Max Price ($/session)</Label>
                      <Input id="price-max" type="number" min={0} value={trainerData.priceMax} onChange={e => setTrainerData(p => ({ ...p, priceMax: parseInt(e.target.value) || 0 }))} className="h-12 rounded-xl" data-testid="input-price-max" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="availability">Availability Notes (optional)</Label>
                    <Textarea id="availability" value={trainerData.availabilityNotes} onChange={e => setTrainerData(p => ({ ...p, availabilityNotes: e.target.value }))} placeholder="e.g. Weekdays evenings, Saturdays all day..." className="rounded-xl" data-testid="input-availability" />
                  </div>
                  <div className="border-t pt-5 mt-2">
                    <div className="flex items-start gap-3" data-testid="trainer-agreement-container">
                      <Checkbox
                        id="accept-trainer-agreement"
                        checked={acceptedTrainerAgreement}
                        onCheckedChange={(checked) => setAcceptedTrainerAgreement(checked === true)}
                        className="mt-0.5"
                        data-testid="checkbox-trainer-agreement"
                      />
                      <label htmlFor="accept-trainer-agreement" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                        I confirm I am qualified and hold appropriate insurance to provide training services. I agree to the{" "}
                        <Link href="/legal/trainer-agreement" className="text-primary hover:underline font-medium">Trainer Agreement</Link>.
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && role === "CLIENT" && (
              <ClientGoalsStep clientData={clientData} setClientData={setClientData} toggleItem={toggleItem} acceptedClientWaiver={acceptedClientWaiver} setAcceptedClientWaiver={setAcceptedClientWaiver} />
            )}

            {step === 4 && role === "BOTH" && (
              <ClientGoalsStep clientData={clientData} setClientData={setClientData} toggleItem={toggleItem} acceptedClientWaiver={acceptedClientWaiver} setAcceptedClientWaiver={setAcceptedClientWaiver} />
            )}
          </div>

          <div className="flex justify-between mt-10">
            {step > 1 ? (
              <Button variant="outline" className="rounded-xl h-12 px-6 transition-all duration-200 hover:-translate-x-0.5 active:scale-95" onClick={goBack}>
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            ) : <div />}
            <Button
              className={`rounded-xl h-12 px-8 font-semibold transition-all duration-200 active:scale-95 ${step === totalSteps ? "gap-2" : ""}`}
              onClick={handleNext}
              disabled={loading}
              data-testid="button-next-step"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {step === totalSteps ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  Complete Setup
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClientGoalsStep({ clientData, setClientData, toggleItem, acceptedClientWaiver, setAcceptedClientWaiver }: any) {
  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight mb-2">Your Fitness Goals</h2>
      <p className="text-muted-foreground mb-8">Help us match you with the right trainers.</p>
      <div className="space-y-5">
        <div className="space-y-2">
          <Label>Goals <span className="text-destructive">*</span></Label>
          <div className="flex flex-wrap gap-2">
            {GOALS.map(goal => (
              <Badge
                key={goal}
                variant={clientData.goals.includes(goal) ? "default" : "outline"}
                className="cursor-pointer rounded-lg px-3 py-1.5 text-sm transition-all duration-150 active:scale-90 select-none"
                onClick={() => toggleItem(clientData.goals, goal, (v: string[]) => setClientData((p: any) => ({ ...p, goals: v })))}
              >
                {goal}
              </Badge>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="experience-level">Experience Level</Label>
          <Select value={clientData.experienceLevel} onValueChange={v => setClientData((p: any) => ({ ...p, experienceLevel: v }))}>
            <SelectTrigger id="experience-level" className="h-12 rounded-xl" data-testid="select-experience-level"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="BEGINNER">Beginner</SelectItem>
              <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
              <SelectItem value="ADVANCED">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="budget-min">Min Budget ($/session)</Label>
            <Input id="budget-min" type="number" min={0} value={clientData.budgetMin} onChange={e => setClientData((p: any) => ({ ...p, budgetMin: parseInt(e.target.value) || 0 }))} className="h-12 rounded-xl" data-testid="input-budget-min" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget-max">Max Budget ($/session)</Label>
            <Input id="budget-max" type="number" min={0} value={clientData.budgetMax} onChange={e => setClientData((p: any) => ({ ...p, budgetMax: parseInt(e.target.value) || 0 }))} className="h-12 rounded-xl" data-testid="input-budget-max" />
          </div>
        </div>
        <div className="border-t pt-5 mt-2">
          <div className="flex items-start gap-3" data-testid="client-waiver-container">
            <Checkbox
              id="accept-client-waiver"
              checked={acceptedClientWaiver}
              onCheckedChange={(checked: boolean) => setAcceptedClientWaiver(checked === true)}
              className="mt-0.5"
              data-testid="checkbox-client-waiver"
            />
            <label htmlFor="accept-client-waiver" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
              I understand the risks associated with physical fitness activities and accept the{" "}
              <Link href="/legal/client-waiver" className="text-primary hover:underline font-medium">Client Waiver & Assumption of Risk</Link>.
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
