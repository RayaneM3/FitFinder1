import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAuth } from "@/lib/auth";

const ONBOARDING_GATED = ["/dashboard", "/messages", "/settings"];

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export default function Layout({ children, showFooter = true }: LayoutProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) return;
    if (user.onboardingComplete) return;
    if (ONBOARDING_GATED.some(path => location === path || location.startsWith(path + "/"))) {
      setLocation("/onboarding");
    }
  }, [isLoading, isAuthenticated, user, location, setLocation]);

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary/20">
      <Navbar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}