import { useState, useEffect, useRef } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Camera, Plus, X, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";

const LANGUAGES = ["English", "Spanish", "French", "Mandarin", "Hindi", "Russian", "Portuguese", "Arabic", "German", "Japanese"];
const ALL_SPECIALTIES = [
  "Strength Training", "Fat Loss", "Hypertrophy", "HIIT",
  "Yoga", "Powerlifting", "Nutrition Coaching", "Bodybuilding",
  "Rehab & Mobility", "Sports Performance",
];
const ALL_GOALS = ["Lose Weight", "Build Muscle", "Improve Fitness", "Train for Sport", "Rehabilitation", "Increase Strength", "Better Nutrition", "Flexibility & Mobility"];

export default function Settings() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isTrainer = user?.role === "TRAINER" || user?.role === "BOTH";
  const isClient = user?.role === "CLIENT" || user?.role === "BOTH";

  useEffect(() => {
    document.title = "Settings | Fit Finder";
    return () => { document.title = "Fit Finder"; };
  }, []);

  const { data: profile, isLoading: profileLoading } = useQuery<any>({
    queryKey: ["/api/auth/me"],
    enabled: isAuthenticated,
  });

  const { data: trainerProfileData } = useQuery<any>({
    queryKey: ["/api/trainer-profile"],
    enabled: isAuthenticated && isTrainer,
  });

  const { data: clientProfileData } = useQuery<any>({
    queryKey: ["/api/client-profile"],
    enabled: isAuthenticated && isClient,
  });

  const { data: blockedUsers } = useQuery<any[]>({
    queryKey: ["/api/blocked"],
    enabled: isAuthenticated,
  });

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [languages, setLanguages] = useState<string[]>(["English"]);
  const [coachingMode, setCoachingMode] = useState("ONLINE");
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [changingPw, setChangingPw] = useState(false);

  const [specialties, setSpecialties] = useState<string[]>([]);
  const [yearsExperience, setYearsExperience] = useState(0);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newCert, setNewCert] = useState("");
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(0);
  const [availabilityNotes, setAvailabilityNotes] = useState("");
  const [trainerCoachingMode, setTrainerCoachingMode] = useState("ONLINE");
  const [savingTrainer, setSavingTrainer] = useState(false);

  const [goals, setGoals] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState("BEGINNER");
  const [budgetMin, setBudgetMin] = useState(0);
  const [budgetMax, setBudgetMax] = useState(0);
  const [savingClient, setSavingClient] = useState(false);

  useEffect(() => {
    if (profile?.user) setName(profile.user.name || "");
    if (profile?.profile) {
      setBio(profile.profile.bio || "");
      setCity(profile.profile.city || "");
      setCountry(profile.profile.country || "");
      setLanguages(profile.profile.languages || ["English"]);
      setCoachingMode(profile.profile.coachingMode || "ONLINE");
    }
  }, [profile]);

  useEffect(() => {
    if (trainerProfileData) {
      setSpecialties(trainerProfileData.specialties || []);
      setYearsExperience(trainerProfileData.yearsExperience || 0);
      setCertifications(trainerProfileData.certifications || []);
      setPriceMin(trainerProfileData.priceMin || 0);
      setPriceMax(trainerProfileData.priceMax || 0);
      setAvailabilityNotes(trainerProfileData.availabilityNotes || "");
      setTrainerCoachingMode(trainerProfileData.coachingMode || "ONLINE");
    }
  }, [trainerProfileData]);

  useEffect(() => {
    if (clientProfileData) {
      setGoals(clientProfileData.goals || []);
      setExperienceLevel(clientProfileData.experienceLevel || "BEGINNER");
      setBudgetMin(clientProfileData.budgetMin || 0);
      setBudgetMax(clientProfileData.budgetMax || 0);
    }
  }, [clientProfileData]);

  if (!isAuthenticated) {
    setLocation("/auth");
    return null;
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Please choose an image under 4MB.", variant: "destructive" });
      return;
    }
    setAvatarUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      await apiRequest("POST", "/api/settings/avatar", { image: base64 });
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Profile photo updated" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await apiRequest("PATCH", "/api/settings/profile", { name, bio, city, country, languages, coachingMode });
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Profile updated" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPwError("");
    if (newPassword !== confirmPassword) {
      setPwError("Passwords don't match");
      return;
    }
    setChangingPw(true);
    try {
      await apiRequest("PATCH", "/api/settings/password", { currentPassword, newPassword });
      toast({ title: "Password changed" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setChangingPw(false);
    }
  };

  const handleSaveTrainerProfile = async () => {
    setSavingTrainer(true);
    try {
      await apiRequest("PATCH", "/api/settings/trainer-profile", {
        specialties,
        yearsExperience: Number(yearsExperience),
        certifications,
        priceMin: Number(priceMin),
        priceMax: Number(priceMax),
        availabilityNotes,
        coachingMode: trainerCoachingMode,
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/trainer-profile"] });
      toast({ title: "Trainer profile updated" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSavingTrainer(false);
    }
  };

  const handleSaveClientProfile = async () => {
    setSavingClient(true);
    try {
      await apiRequest("PATCH", "/api/settings/client-profile", {
        goals,
        experienceLevel,
        budgetMin: Number(budgetMin),
        budgetMax: Number(budgetMax),
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/client-profile"] });
      toast({ title: "Client profile updated" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSavingClient(false);
    }
  };

  const handleUnblock = async (blockedId: string) => {
    try {
      await apiRequest("DELETE", `/api/block/${blockedId}`);
      await queryClient.invalidateQueries({ queryKey: ["/api/blocked"] });
      toast({ title: "User unblocked" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const toggleLang = (lang: string) => {
    setLanguages(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]);
  };

  const toggleSpecialty = (spec: string) => {
    setSpecialties(prev => prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]);
  };

  const toggleGoal = (goal: string) => {
    setGoals(prev => prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]);
  };

  const addCert = () => {
    if (newCert.trim() && !certifications.includes(newCert.trim())) {
      setCertifications(prev => [...prev, newCert.trim()]);
      setNewCert("");
    }
  };

  const removeCert = (cert: string) => {
    setCertifications(prev => prev.filter(c => c !== cert));
  };

  const tabCount = 3 + (isTrainer ? 1 : 0) + (isClient ? 1 : 0);
  const gridCols = tabCount === 3 ? "grid-cols-3" : tabCount === 4 ? "grid-cols-4" : "grid-cols-5";

  if (profileLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 md:px-8 py-8 max-w-3xl">
          <div className="h-9 w-32 bg-muted rounded-lg mb-8 animate-pulse" />
          <div className="h-12 w-full bg-muted rounded-xl mb-8 animate-pulse" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-12 w-full bg-muted rounded-xl animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-8 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Settings</h1>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className={`grid w-full ${gridCols} bg-muted p-1 rounded-xl mb-8`}>
            <TabsTrigger value="profile" className="rounded-lg">Profile</TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg">Security</TabsTrigger>
            <TabsTrigger value="blocked" className="rounded-lg">Blocked</TabsTrigger>
            {isTrainer && <TabsTrigger value="trainer" className="rounded-lg">Trainer</TabsTrigger>}
            {isClient && <TabsTrigger value="client" className="rounded-lg">Client</TabsTrigger>}
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Avatar upload */}
            <div className="flex items-center gap-5">
              <div className="relative">
                <Avatar className="h-20 w-20 border-2 border-border">
                  <AvatarImage src={user?.image || undefined} alt={user?.name} />
                  <AvatarFallback className="text-2xl font-bold">{user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <button
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                  data-testid="button-avatar-upload"
                >
                  {avatarUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  data-testid="input-avatar"
                />
              </div>
              <div>
                <p className="font-semibold">{user?.name}</p>
                <p className="text-sm text-muted-foreground">Click the camera to update your photo</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="settings-name">Display Name</Label>
              <Input id="settings-name" value={name} onChange={e => setName(e.target.value)} className="h-12 rounded-xl" data-testid="settings-name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-bio">Bio</Label>
              <Textarea id="settings-bio" value={bio} onChange={e => setBio(e.target.value)} className="rounded-xl min-h-[100px]" data-testid="settings-bio" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="settings-city">City</Label>
                <Input id="settings-city" value={city} onChange={e => setCity(e.target.value)} className="h-12 rounded-xl" data-testid="settings-city" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-country">Country</Label>
                <Input id="settings-country" value={country} onChange={e => setCountry(e.target.value)} className="h-12 rounded-xl" data-testid="settings-country" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Languages</Label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map(lang => (
                  <Badge key={lang} variant={languages.includes(lang) ? "default" : "outline"} className="cursor-pointer rounded-lg px-3 py-1.5 text-sm" onClick={() => toggleLang(lang)}>
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="coaching-mode">Coaching Mode</Label>
              <Select value={coachingMode} onValueChange={setCoachingMode}>
                <SelectTrigger id="coaching-mode" className="h-12 rounded-xl" data-testid="select-coaching-mode"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ONLINE">Online</SelectItem>
                  <SelectItem value="IN_PERSON">In-Person</SelectItem>
                  <SelectItem value="HYBRID">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="rounded-xl h-12 px-8" onClick={handleSaveProfile} disabled={saving} data-testid="button-save-profile">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="h-12 rounded-xl" data-testid="input-current-password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password (min 8 characters)</Label>
              <Input id="new-password" type="password" value={newPassword} onChange={e => { setNewPassword(e.target.value); setPwError(""); }} className="h-12 rounded-xl" minLength={8} data-testid="input-new-password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" type="password" value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setPwError(""); }} className={`h-12 rounded-xl ${pwError ? 'border-destructive' : ''}`} data-testid="input-confirm-password" />
              {pwError && <p className="text-xs text-destructive">{pwError}</p>}
            </div>
            <Button className="rounded-xl h-12 px-8" onClick={handleChangePassword} disabled={changingPw || newPassword.length < 8 || !confirmPassword} data-testid="button-change-password">
              {changingPw && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Change Password
            </Button>
          </TabsContent>

          {/* Blocked Users Tab */}
          <TabsContent value="blocked" className="space-y-4">
            {(!blockedUsers || blockedUsers.length === 0) ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg font-medium">No blocked users</p>
                <p className="text-sm mt-1">Users you block will appear here.</p>
              </div>
            ) : (
              blockedUsers.map((blocked: any) => (
                <div key={blocked.id} className="flex items-center justify-between p-4 border rounded-2xl bg-card">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                      {blocked.name?.charAt(0) || "?"}
                    </div>
                    <span className="font-medium">{blocked.name}</span>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-lg" onClick={() => handleUnblock(blocked.blockedId)} data-testid={`unblock-${blocked.blockedId}`}>
                    <Trash2 className="w-4 h-4 mr-1" /> Unblock
                  </Button>
                </div>
              ))
            )}
          </TabsContent>

          {/* Trainer Profile Tab */}
          {isTrainer && (
            <TabsContent value="trainer" className="space-y-6">
              <div className="space-y-2">
                <Label>Specialties</Label>
                <div className="flex flex-wrap gap-2">
                  {ALL_SPECIALTIES.map(spec => (
                    <Badge key={spec} variant={specialties.includes(spec) ? "default" : "outline"} className="cursor-pointer rounded-lg px-3 py-1.5 text-sm" onClick={() => toggleSpecialty(spec)}>
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="years-experience">Years of Experience</Label>
                  <Input id="years-experience" type="number" min={0} max={60} value={yearsExperience} onChange={e => setYearsExperience(Number(e.target.value))} className="h-12 rounded-xl" data-testid="input-years-exp" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trainer-coaching-mode">Coaching Mode</Label>
                  <Select value={trainerCoachingMode} onValueChange={setTrainerCoachingMode}>
                    <SelectTrigger id="trainer-coaching-mode" className="h-12 rounded-xl" data-testid="select-trainer-coaching-mode"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ONLINE">Online</SelectItem>
                      <SelectItem value="IN_PERSON">In-Person</SelectItem>
                      <SelectItem value="HYBRID">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price-min">Min Price (£/$ per session)</Label>
                  <Input id="price-min" type="number" min={0} value={priceMin} onChange={e => setPriceMin(Number(e.target.value))} className="h-12 rounded-xl" data-testid="input-price-min" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price-max">Max Price (£/$ per session)</Label>
                  <Input id="price-max" type="number" min={0} value={priceMax} onChange={e => setPriceMax(Number(e.target.value))} className="h-12 rounded-xl" data-testid="input-price-max" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Certifications</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {certifications.map(cert => (
                    <span key={cert} className="inline-flex items-center gap-1 px-3 py-1.5 bg-secondary text-secondary-foreground text-sm rounded-lg font-medium">
                      {cert}
                      <button onClick={() => removeCert(cert)} className="hover:text-destructive ml-1" data-testid={`remove-cert-${cert}`}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input id="new-cert" value={newCert} onChange={e => setNewCert(e.target.value)} onKeyDown={e => e.key === "Enter" && addCert()} placeholder="e.g. NASM CPT" className="h-10 rounded-xl" data-testid="input-new-cert" aria-label="Add certification" />
                  <Button variant="outline" onClick={addCert} className="h-10 rounded-xl shrink-0" data-testid="button-add-cert">
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="availability-notes">Availability Notes</Label>
                <Textarea id="availability-notes" value={availabilityNotes} onChange={e => setAvailabilityNotes(e.target.value)} placeholder="e.g. Mon–Fri, mornings preferred. Online sessions via Zoom." className="rounded-xl min-h-[80px]" data-testid="input-availability" />
              </div>
              <Button className="rounded-xl h-12 px-8" onClick={handleSaveTrainerProfile} disabled={savingTrainer} data-testid="button-save-trainer">
                {savingTrainer && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Trainer Profile
              </Button>
            </TabsContent>
          )}

          {/* Client Profile Tab */}
          {isClient && (
            <TabsContent value="client" className="space-y-6">
              <div className="space-y-2">
                <Label>Goals</Label>
                <div className="flex flex-wrap gap-2">
                  {ALL_GOALS.map(goal => (
                    <Badge key={goal} variant={goals.includes(goal) ? "default" : "outline"} className="cursor-pointer rounded-lg px-3 py-1.5 text-sm" onClick={() => toggleGoal(goal)}>
                      {goal}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-experience-level">Experience Level</Label>
                <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                  <SelectTrigger id="client-experience-level" className="h-12 rounded-xl" data-testid="select-experience-level"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget-min">Budget Min (per session)</Label>
                  <Input id="budget-min" type="number" min={0} value={budgetMin} onChange={e => setBudgetMin(Number(e.target.value))} className="h-12 rounded-xl" data-testid="input-budget-min" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget-max">Budget Max (per session)</Label>
                  <Input id="budget-max" type="number" min={0} value={budgetMax} onChange={e => setBudgetMax(Number(e.target.value))} className="h-12 rounded-xl" data-testid="input-budget-max" />
                </div>
              </div>
              <Button className="rounded-xl h-12 px-8" onClick={handleSaveClientProfile} disabled={savingClient} data-testid="button-save-client">
                {savingClient && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Client Profile
              </Button>
            </TabsContent>
          )}
        </Tabs>

        <DangerZone />
      </div>
    </Layout>
  );
}

function DangerZone() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/account");
    },
    onSuccess: () => {
      toast({ title: "Account deleted" });
      setLocation("/auth");
      window.location.reload();
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="mt-10 border border-destructive/30 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-5 h-5 text-destructive" />
        <h3 className="text-lg font-bold text-destructive">Danger Zone</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Permanently delete your account and all associated data. This action cannot be undone.
      </p>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive" className="rounded-xl" data-testid="button-delete-account">
            <Trash2 className="w-4 h-4 mr-2" /> Delete Account
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This will permanently delete your account, messages, orders, and all data. Type <strong>DELETE</strong> to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder='Type "DELETE" to confirm'
              className="rounded-xl"
              data-testid="input-confirm-delete"
            />
            <Button
              variant="destructive"
              className="w-full rounded-xl"
              disabled={confirmText !== "DELETE" || deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Permanently Delete Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
