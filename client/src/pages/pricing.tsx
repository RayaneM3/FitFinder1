import { useEffect, useRef, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Check, ChevronRight, ShieldCheck, CreditCard, HelpCircle } from "lucide-react";

function RevealSection({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`reveal ${visible ? "in-view" : ""} ${className}`}>
      {children}
    </div>
  );
}

const clientFeatures = [
  "Browse unlimited trainer profiles",
  "Filter by specialty, location & price",
  "Save favorites for easy comparison",
  "Client-initiated secure messaging",
  "Block & report for safety",
  "City-level location privacy",
  "Dashboard to manage orders & plans",
  "Secure Stripe-powered payments",
];

const trainerFeatures = [
  "Create your professional profile",
  "Showcase specialties & certifications",
  "Set your own pricing & availability",
  "Receive client inquiries directly",
  "Create unlimited training plans",
  "Manage clients from your dashboard",
  "Track orders & earnings",
  "Get discovered by local & online clients",
];

const pricingFaqs = [
  {
    q: "Is Fit Finder really free for clients?",
    a: "Yes. You can sign up, browse trainers, save favorites, and message trainers at no cost. You only pay when you choose to purchase a training plan from a trainer.",
  },
  {
    q: "Is there a subscription fee for trainers?",
    a: "No. Trainers can create a profile, list their services, and communicate with clients for free. We take a small platform fee on completed transactions to keep the platform running.",
  },
  {
    q: "How much does a training plan cost?",
    a: "Trainers set their own pricing. You'll see prices displayed on each plan, so you can compare and choose what fits your budget. There are no hidden fees or surcharges.",
  },
  {
    q: "Are there any hidden costs?",
    a: "None. What you see is what you pay. Client accounts are free, and trainer pricing is transparent. The only payment is for the training plans you choose to purchase.",
  },
  {
    q: "How are payments processed?",
    a: "All transactions are processed through Stripe, a leading payment platform used by millions of businesses worldwide. Your payment details are encrypted and never stored on our servers.",
  },
  {
    q: "Can I get a refund?",
    a: "Refund policies are set by individual trainers. We recommend discussing expectations with your trainer before purchasing. If you have a dispute, our support team can help mediate.",
  },
];

export default function Pricing() {
  useEffect(() => {
    document.title = "Pricing | Fit Finder";
    return () => { document.title = "Fit Finder"; };
  }, []);

  return (
    <Layout>
      <section className="pt-20 pb-16 lg:pt-28 lg:pb-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-600">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold bg-secondary text-secondary-foreground mb-6" data-testid="badge-pricing">
              Pricing
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6" data-testid="text-pricing-title">
              Simple, transparent pricing.
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Fit Finder is free to use. No subscriptions, no hidden fees. You only pay for the training plans you choose to buy.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <RevealSection delay={0}>
            <div className="bg-card border-2 border-primary rounded-3xl p-8 relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1" data-testid="card-pricing-client">
              <div className="absolute -top-3 left-8">
                <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">Most Popular</span>
              </div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2">For Clients</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold tracking-tight">Free</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">No credit card required. Ever.</p>
              </div>
              <ul className="space-y-3 mb-8">
                {clientFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/auth">
                <Button size="lg" className="w-full h-14 text-base rounded-xl shadow-lg shadow-primary/20 group" data-testid="button-signup-client">
                  Get Started Free
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            </RevealSection>

            <RevealSection delay={120}>
            <div className="bg-card border border-border rounded-3xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1" data-testid="card-pricing-trainer">
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2">For Trainers</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold tracking-tight">Free</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Small platform fee on completed sales only.</p>
              </div>
              <ul className="space-y-3 mb-8">
                {trainerFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/auth">
                <Button size="lg" variant="outline" className="w-full h-14 text-base rounded-xl" data-testid="button-signup-trainer">
                  Start as a Trainer
                </Button>
              </Link>
            </div>
            </RevealSection>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid sm:grid-cols-3 gap-6 mb-16">
              <RevealSection delay={0}>
              <div className="bg-background p-6 rounded-2xl border border-border text-center hover:shadow-md transition-shadow duration-300">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">Pay per plan</h3>
                <p className="text-sm text-muted-foreground">Only pay when you purchase a training plan. No monthly fees for anyone.</p>
              </div>
              </RevealSection>
              <RevealSection delay={100}>
              <div className="bg-background p-6 rounded-2xl border border-border text-center hover:shadow-md transition-shadow duration-300">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">Secure payments</h3>
                <p className="text-sm text-muted-foreground">Every transaction is encrypted and processed through Stripe's secure infrastructure.</p>
              </div>
              </RevealSection>
              <RevealSection delay={200}>
              <div className="bg-background p-6 rounded-2xl border border-border text-center hover:shadow-md transition-shadow duration-300">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">No surprises</h3>
                <p className="text-sm text-muted-foreground">Transparent pricing set by trainers. What you see on the plan is exactly what you pay.</p>
              </div>
              </RevealSection>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4 md:px-8">
          <RevealSection className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Pricing FAQ</h2>
            <p className="text-muted-foreground">Everything you need to know about costs on Fit Finder.</p>
          </RevealSection>
          <div className="max-w-3xl mx-auto space-y-4">
            {pricingFaqs.map((faq, i) => (
              <RevealSection key={i} delay={i * 60}>
              <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-sm transition-shadow duration-200" data-testid={`faq-pricing-${i}`}>
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <RevealSection>
          <h2 className="text-3xl font-bold mb-4">Start your fitness journey today.</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            No subscription. No commitment. Just a better way to find the right trainer.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/explore">
              <Button size="lg" className="h-14 px-8 text-base rounded-xl shadow-lg shadow-primary/20 group" data-testid="button-cta-explore">
                Explore Trainers
                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-xl" data-testid="button-cta-signup">
                Create Free Account
              </Button>
            </Link>
          </div>
          </RevealSection>
        </div>
      </section>
    </Layout>
  );
}
