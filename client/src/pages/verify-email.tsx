import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { apiRequest, API_BASE } from "@/lib/queryClient";

type State = "loading" | "success" | "error";

export default function VerifyEmail() {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<State>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    document.title = "Verify Email | Fit Finder";
    return () => { document.title = "Fit Finder"; };
  }, []);

  useEffect(() => {
    if (!token) {
      setState("error");
      setErrorMsg("No verification token found in this link.");
      return;
    }
    fetch(`${API_BASE}/api/auth/verify-email/${token}`, { credentials: "include" })
      .then(async (res) => {
        if (res.ok) {
          setState("success");
        } else {
          const body = await res.json().catch(() => ({}));
          setErrorMsg(body.message || "This verification link is invalid or has expired.");
          setState("error");
        }
      })
      .catch(() => {
        setErrorMsg("Something went wrong. Please try again.");
        setState("error");
      });
  }, [token]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          {state === "loading" && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-muted-foreground">Verifying your email…</p>
            </div>
          )}

          {state === "success" && (
            <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-90 duration-500">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight mb-2">Email verified!</h1>
                <p className="text-muted-foreground">Your email address has been confirmed. You're all set.</p>
              </div>
              <Link href="/dashboard">
                <Button className="mt-2 rounded-xl px-6">Go to dashboard</Button>
              </Link>
            </div>
          )}

          {state === "error" && (
            <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-90 duration-500">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight mb-2">Verification failed</h1>
                <p className="text-muted-foreground">{errorMsg}</p>
              </div>
              <Link href="/settings">
                <Button variant="outline" className="mt-2 rounded-xl">Go to settings to resend</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
