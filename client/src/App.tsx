import { Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import ErrorBoundary from "@/components/ErrorBoundary";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Explore from "@/pages/explore";
import Profile from "@/pages/profile";
import Messages from "@/pages/messages";
import Dashboard from "@/pages/dashboard";
import Auth from "@/pages/auth";
import Onboarding from "@/pages/onboarding";
import Settings from "@/pages/settings";
import HowItWorks from "@/pages/how-it-works";
import Resources from "@/pages/resources";
import Pricing from "@/pages/pricing";
import Community from "@/pages/community";
import FAQ from "@/pages/faq";
import TrustSafety from "@/pages/trust-safety";
import Changelog from "@/pages/changelog";
import LegalTerms from "@/pages/legal/terms";
import LegalPrivacy from "@/pages/legal/privacy";
import LegalRefunds from "@/pages/legal/refunds";
import LegalTrainerAgreement from "@/pages/legal/trainer-agreement";
import LegalClientWaiver from "@/pages/legal/client-waiver";
import LegalCommunityGuidelines from "@/pages/legal/community-guidelines";
import LegalContactSupport from "@/pages/legal/contact-support";
import Admin from "@/pages/admin";
import ResetPassword from "@/pages/reset-password";
import VerifyEmail from "@/pages/verify-email";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/explore" component={Explore} />
      <Route path="/profile/:id" component={Profile} />
      <Route path="/messages" component={Messages} />
      <Route path="/messages/:conversationId" component={Messages} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/settings" component={Settings} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/resources" component={Resources} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/community" component={Community} />
      <Route path="/faq" component={FAQ} />
      <Route path="/trust-safety" component={TrustSafety} />
      <Route path="/trust-safety/contact-support" component={LegalContactSupport} />
      <Route path="/trust-safety/:slug" component={TrustSafety} />
      <Route path="/changelog" component={Changelog} />
      <Route path="/legal/terms" component={LegalTerms} />
      <Route path="/legal/privacy" component={LegalPrivacy} />
      <Route path="/legal/refunds" component={LegalRefunds} />
      <Route path="/legal/trainer-agreement" component={LegalTrainerAgreement} />
      <Route path="/legal/client-waiver" component={LegalClientWaiver} />
      <Route path="/legal/community-guidelines" component={LegalCommunityGuidelines} />
      <Route path="/admin" component={Admin} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/reset-password/:token" component={ResetPassword} />
      <Route path="/verify-email/:token" component={VerifyEmail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
