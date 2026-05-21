import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function ResetPassword() {
  const { token } = useParams<{ token?: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Reset Password | Fit Finder";
    return () => { document.title = "Fit Finder"; };
  }, []);

  // State 1: request reset (no token)
  const [requestEmail, setRequestEmail] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  // State 2: set new password (token in URL)
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [resetError, setResetError] = useState("");

  // Redirect to sign-in after successful reset
  useEffect(() => {
    if (resetDone) {
      const t = setTimeout(() => setLocation("/auth"), 2000);
      return () => clearTimeout(t);
    }
  }, [resetDone, setLocation]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestEmail) return;
    setRequestLoading(true);
    try {
      await apiRequest("POST", "/api/auth/forgot-password", { email: requestEmail });
      setRequestSent(true);
    } catch {
      // Even on error, show the success message (don't reveal whether email exists)
      setRequestSent(true);
    } finally {
      setRequestLoading(false);
    }
  };

  const passwordsMatch = newPassword === confirmPassword;
  const passwordLongEnough = newPassword.length >= 8;
  const canSubmitReset = passwordLongEnough && passwordsMatch && newPassword.length > 0;

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitReset) return;

    setResetLoading(true);
    setResetError("");
    try {
      await apiRequest("POST", "/api/auth/reset-password", { token, newPassword });
      setResetDone(true);
      toast({ title: "Password reset!", description: "Redirecting to sign in…" });
    } catch (err: any) {
      const msg = err.message?.includes(":") ? err.message.split(":").slice(1).join(":").trim() : err.message;
      setResetError(msg || "This reset link is invalid or has expired");
    } finally {
      setResetLoading(false);
    }
  };

  // --- STATE 1: Request reset ---
  if (!token) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center py-16 px-4">
          <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6">
              <Link href="/auth" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to sign in
              </Link>
            </div>

            <h1 className="text-2xl font-bold tracking-tight mb-2">Reset your password</h1>
            <p className="text-muted-foreground mb-8">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {requestSent ? (
              <div className="flex flex-col items-center text-center py-8 gap-4 animate-in fade-in zoom-in-90 duration-500">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center animate-in zoom-in-75 duration-500 delay-100">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-lg mb-1">Check your inbox</p>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    If an account with that email exists, we've sent a reset link. Check your inbox (and spam folder).
                  </p>
                </div>
                <Link href="/auth">
                  <Button variant="outline" className="mt-2 rounded-xl">Back to sign in</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleRequestReset} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="reset-email">Email address</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="you@example.com"
                    value={requestEmail}
                    onChange={(e) => setRequestEmail(e.target.value)}
                    className="h-12 rounded-xl"
                    required
                    autoFocus
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl font-semibold transition-all duration-200 active:scale-[0.98]"
                  disabled={requestLoading || !requestEmail}
                >
                  {requestLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send reset link
                </Button>
              </form>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // --- STATE 2: Set new password ---
  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Set a new password</h1>
          <p className="text-muted-foreground mb-8">Choose a strong password for your account.</p>

          {resetDone ? (
            <div className="flex flex-col items-center text-center py-8 gap-4 animate-in fade-in zoom-in-90 duration-400">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center animate-in zoom-in-50 duration-500">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-lg mb-1">Password reset!</p>
                <p className="text-muted-foreground text-sm">Redirecting you to sign in…</p>
              </div>
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : resetError ? (
            <div className="text-center py-8 space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-400">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <span className="text-3xl">⚠️</span>
              </div>
              <div>
                <p className="font-semibold mb-1">Link invalid or expired</p>
                <p className="text-muted-foreground text-sm">{resetError}</p>
              </div>
              <Link href="/reset-password">
                <Button variant="outline" className="rounded-xl">Request a new link</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Min 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-12 rounded-xl"
                  autoFocus
                />
                {newPassword.length > 0 && !passwordLongEnough && (
                  <p className="text-xs text-destructive animate-in fade-in duration-200">Must be at least 8 characters ({newPassword.length}/8)</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`h-12 rounded-xl transition-colors duration-200 ${confirmPassword.length > 0 && !passwordsMatch ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="text-xs text-destructive animate-in fade-in duration-200">Passwords do not match</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl font-semibold transition-all duration-200 active:scale-[0.98]"
                disabled={resetLoading || !canSubmitReset}
              >
                {resetLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset password
              </Button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}
