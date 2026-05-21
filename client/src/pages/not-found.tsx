import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Search, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function NotFound() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    document.title = "Page Not Found | Fit Finder";
    return () => { document.title = "Fit Finder"; };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal header */}
      <div className="border-b px-4 py-4">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">F</div>
          <span className="font-bold text-xl tracking-tight">Fit Finder</span>
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md animate-in fade-in slide-in-from-bottom-6 duration-500">
          {/* Big 404 */}
          <div className="relative mb-8">
            <p className="text-[120px] font-extrabold tracking-tighter text-muted/30 leading-none select-none">
              404
            </p>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center animate-float">
                <span className="text-4xl font-bold text-primary">F</span>
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight mb-3">
            This page doesn't exist
          </h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            The page you're looking for may have been moved, deleted, or never existed. Let's get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button size="lg" className="rounded-xl h-12 gap-2">
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline" className="rounded-xl h-12 gap-2">
                <Search className="w-4 h-4" />
                Explore Trainers
              </Button>
            </Link>
            {isAuthenticated && (
              <Link href="/dashboard">
                <Button size="lg" variant="ghost" className="rounded-xl h-12 gap-2 text-muted-foreground">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
