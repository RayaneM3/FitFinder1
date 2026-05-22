import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

const LEGAL_VERSION = "2026-03-04";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Auth() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ name: false, email: false, password: false });
  const { login, signup, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    document.title = mode === "signin" ? "Sign In | Fit Finder" : "Create Account | Fit Finder";
    return () => { document.title = "Fit Finder"; };
  }, [mode]);

  useEffect(() => {
    if (user) {
      setLocation(user.onboardingComplete ? "/dashboard" : "/onboarding");
    }
  }, [user, setLocation]);

  const nameError = mode === "signup" && touched.name && name.trim().length < 1 ? "Name is required" : "";
  const emailError = touched.email && !isValidEmail(email) ? "Please enter a valid email address" : "";
  const passwordError = mode === "signup" && touched.password && password.length < 8
    ? `Password must be at least 8 characters (${password.length}/8)`
    : "";

  const isFormValid = mode === "signin"
    ? isValidEmail(email) && password.length >= 1
    : name.trim().length >= 1 && isValidEmail(email) && password.length >= 8 && acceptedTerms;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });

    if (mode === "signup") {
      if (!name.trim()) return;
      if (!isValidEmail(email)) return;
      if (password.length < 8) return;
      if (!acceptedTerms) {
        toast({ title: "Please accept the Terms & Conditions and Privacy Policy to continue.", variant: "destructive" });
        return;
      }
    } else {
      if (!isValidEmail(email)) return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        await signup(email, password, name);
        try {
          await apiRequest("POST", "/api/legal/accept", { documentType: "TERMS", version: LEGAL_VERSION });
          await apiRequest("POST", "/api/legal/accept", { documentType: "PRIVACY", version: LEGAL_VERSION });
        } catch (e) {
          console.error("[legal/accept] Failed to record legal acceptance:", e);
        }
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      const msg = err.message?.includes(":") ? err.message.split(":").slice(1).join(":").trim() : err.message;
      toast({ title: "Error", description: msg || "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center relative overflow-hidden animate-in fade-in duration-700">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="relative z-10 max-w-md text-primary-foreground p-12 animate-in fade-in slide-in-from-left-6 duration-700 delay-200">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl font-bold mb-8">F</div>
          <h1 className="text-4xl font-bold mb-4 tracking-tight">Find your perfect trainer.</h1>
          <p className="text-lg text-primary-foreground/80 leading-relaxed">
            A safe, client-first marketplace where you're always in control. Browse privately, message on your terms, and train with confidence.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">F</div>
            <span className="font-heading font-bold text-xl tracking-tight">Fit Finder</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight mb-2">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {mode === "signin" ? "Sign in to continue to Fit Finder." : "Start your fitness journey today."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, name: true }))}
                  className={`h-12 rounded-xl ${nameError ? 'border-destructive' : ''}`}
                  data-testid="input-name"
                />
                {nameError && <p className="text-xs text-destructive" data-testid="error-name">{nameError}</p>}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, email: true }))}
                className={`h-12 rounded-xl ${emailError ? 'border-destructive' : ''}`}
                data-testid="input-email"
              />
              {emailError && <p className="text-xs text-destructive" data-testid="error-email">{emailError}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder={mode === "signup" ? "Min 8 characters" : "Enter your password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, password: true }))}
                className={`h-12 rounded-xl ${passwordError ? 'border-destructive' : ''}`}
                data-testid="input-password"
              />
              {mode === "signup" ? (
                <div className="flex items-center justify-between">
                  {passwordError ? (
                    <p className="text-xs text-destructive" data-testid="error-password">{passwordError}</p>
                  ) : (
                    <span />
                  )}
                  <p className={`text-xs ml-auto ${password.length >= 8 ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {password.length}/8 min
                  </p>
                </div>
              ) : (
                <div className="flex justify-end mt-1">
                  <Link href="/reset-password" className="text-sm text-primary hover:underline">
                    Forgot your password?
                  </Link>
                </div>
              )}
            </div>

            {mode === "signup" && (
              <div className="flex items-start gap-3" data-testid="terms-checkbox-container">
                <Checkbox
                  id="accept-terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                  className="mt-0.5"
                  data-testid="checkbox-accept-terms"
                />
                <label htmlFor="accept-terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                  I agree to the{" "}
                  <Link href="/legal/terms" className="text-primary hover:underline font-medium">Terms & Conditions</Link>
                  {" "}and{" "}
                  <Link href="/legal/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>.
                </label>
              </div>
            )}

            <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold" disabled={loading} data-testid="button-auth-submit">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setTouched({ name: false, email: false, password: false }); }}
              className="text-primary font-semibold hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary rounded"
              data-testid="button-toggle-auth"
              aria-label={mode === "signin" ? "Switch to sign up" : "Switch to sign in"}
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
