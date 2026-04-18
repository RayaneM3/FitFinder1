import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                F
              </div>
              <span className="font-heading font-bold text-lg tracking-tight">Fit Finder</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Connecting clients with premium personal trainers. Safe, secure, and built for your success.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/explore" className="hover:text-foreground transition-colors" data-testid="link-footer-explore">Explore Trainers</Link></li>
              <li><Link href="/how-it-works" className="hover:text-foreground transition-colors" data-testid="link-footer-how">How it Works</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground transition-colors" data-testid="link-footer-pricing">Pricing</Link></li>
              <li><Link href="/faq" className="hover:text-foreground transition-colors" data-testid="link-footer-faq">FAQ</Link></li>
              <li><Link href="/changelog" className="hover:text-foreground transition-colors" data-testid="link-footer-changelog">What's New</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Trainers</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/auth" className="hover:text-foreground transition-colors" data-testid="link-footer-apply">Apply as Trainer</Link></li>
              <li><Link href="/resources" className="hover:text-foreground transition-colors" data-testid="link-footer-resources">Resources</Link></li>
              <li><Link href="/community" className="hover:text-foreground transition-colors" data-testid="link-footer-community">Community</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Trust & Safety</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/legal/community-guidelines" className="hover:text-foreground transition-colors" data-testid="link-footer-guidelines">Community Guidelines</Link></li>
              <li><Link href="/trust-safety" className="hover:text-foreground transition-colors" data-testid="link-footer-safety">Safety Center</Link></li>
              <li><Link href="/trust-safety/contact-support" className="hover:text-foreground transition-colors" data-testid="link-footer-support">Contact Support</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Fit Finder Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/legal/terms" className="hover:text-foreground transition-colors" data-testid="link-footer-terms">Terms</Link>
            <Link href="/legal/privacy" className="hover:text-foreground transition-colors" data-testid="link-footer-privacy">Privacy</Link>
            <Link href="/legal/refunds" className="hover:text-foreground transition-colors" data-testid="link-footer-refunds">Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
