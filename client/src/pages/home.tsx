import { useEffect, useRef, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ShieldCheck, MessageCircle, CreditCard, ChevronRight, Search } from "lucide-react";
import heroImg from "@/assets/images/hero-fitness.jpg";
import trainerAvatar1 from "@/assets/images/trainer-avatar_1.jpg";
import trainerAvatar2 from "@/assets/images/trainer-avatar_2.jpg";
import trainerAvatar3 from "@/assets/images/trainer-avatar_3.jpg";
import trainerAvatar4 from "@/assets/images/trainer-avatar_4.jpg";
import { useQuery } from "@tanstack/react-query";
import { API_BASE } from "@/lib/queryClient";

const SOCIAL_AVATARS = [trainerAvatar1, trainerAvatar2, trainerAvatar3, trainerAvatar4];

/** Wraps children in a div that fades+slides in when scrolled into view. */
function RevealSection({ children, delay = 0, className = "" }: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal ${visible ? "in-view" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export default function Home() {
  useEffect(() => {
    document.title = "Fit Finder | Find a Personal Trainer";
    return () => { document.title = "Fit Finder"; };
  }, []);

  const { data: stats } = useQuery<{ trainerCount: number; userCount: number }>({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/stats`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const trainerCount = stats?.trainerCount ?? 0;
  const socialProof = trainerCount > 0
    ? `Join ${trainerCount}+ trainers already on the platform`
    : "Trusted by coaches and clients worldwide";

  return (
    <Layout>
      {/* ── Hero ── */}
      <section className="relative pt-8 pb-32 lg:pt-16 lg:pb-48 overflow-hidden">
        {/* dot grid */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        {/* Animated background blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-float" />
        <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -z-10 animate-float-slow" />

        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

            {/* Left — text */}
            <div className="max-w-2xl">
              {/* Badge — pops in first */}
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold bg-secondary text-secondary-foreground mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-[pulse-dot_2s_ease-in-out_infinite]" />
                A safe, client-first discovery platform
              </div>

              {/* Headline */}
              <h1 className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
                Find a personal trainer without the awkward outreach.
              </h1>

              {/* Subtext */}
              <p className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 text-lg md:text-xl text-muted-foreground mb-8 max-w-lg leading-relaxed">
                Browse elite coaches, review their specialties, and request to chat when you're ready. Whether online or local, we prioritize your comfort and goals.
              </p>

              {/* CTAs */}
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 flex flex-col sm:flex-row gap-4">
                <Link href="/explore" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base rounded-xl shadow-lg shadow-primary/20 group transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5" data-testid="button-find-trainer">
                    Find a Trainer
                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/auth" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base rounded-xl bg-background transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md" data-testid="button-become-trainer">
                    Become a Trainer
                  </Button>
                </Link>
              </div>

              {/* Social proof */}
              <div className="animate-in fade-in duration-700 delay-500 mt-10 flex items-center gap-4 text-sm text-muted-foreground" data-testid="text-social-proof">
                <div className="flex -space-x-2">
                  {SOCIAL_AVATARS.map((src, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-background overflow-hidden bg-muted">
                      <img src={src} alt={`Trainer ${i + 1} profile image`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <span className="font-medium text-foreground">{socialProof}</span>
              </div>
            </div>

            {/* Right — hero image */}
            <div className="animate-in fade-in slide-in-from-right-8 duration-700 delay-200 relative lg:ml-auto w-full max-w-lg">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative border border-border/50 group"
                   style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)' }}>
                <img
                  src={heroImg}
                  alt="Personal training session"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Floating chat card */}
                <div className="absolute bottom-6 left-6 right-6 bg-background/95 backdrop-blur-xl p-4 rounded-2xl border border-white/20 shadow-xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-[700ms]">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/20 shrink-0">
                    <img src={trainerAvatar1} alt="Alex" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Alex R. accepted your request</p>
                    <p className="text-xs text-muted-foreground">"Hi Jane! Let's discuss your goals."</p>
                  </div>
                </div>
              </div>

              {/* Decorative blobs behind image */}
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 animate-float" />
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -z-10 animate-float-slow" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 bg-muted/30 border-y">
        <div className="container mx-auto px-4 md:px-8">
          <RevealSection className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Built differently, for you.</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">We're not a gym directory. Fit Finder is a safety-first platform that puts clients in control of every interaction.</p>
          </RevealSection>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <MessageCircle className="w-6 h-6" />,
                title: "You start the conversation",
                desc: "No unsolicited messages from trainers. Browse privately and reach out when — and only when — you're ready.",
                delay: 0,
              },
              {
                icon: <ShieldCheck className="w-6 h-6" />,
                title: "Location stays private",
                desc: "Trainers only see your city, never your street or postcode. Exact location details are shared only when you decide.",
                delay: 120,
              },
              {
                icon: <CreditCard className="w-6 h-6" />,
                title: "Secure payments",
                desc: "All transactions are processed through Stripe. Your payment details are never shared with trainers.",
                delay: 240,
              },
            ].map((f) => (
              <RevealSection key={f.title} delay={f.delay}>
                <div className="bg-background rounded-2xl p-8 border border-border shadow-sm h-full transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5 transition-transform duration-300 group-hover:scale-110">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-8 text-center max-w-3xl">
          <RevealSection>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Ready to find your trainer?</h2>
            <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
              Browse hundreds of certified personal trainers across the UK, Ireland, Europe, and beyond — all in one place, all vetted for quality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/explore" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-14 px-10 text-base rounded-xl shadow-lg shadow-primary/20 group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30" data-testid="button-cta-explore">
                  <Search className="mr-2 h-4 w-4" />
                  Start Exploring
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/how-it-works" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-10 text-base rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md" data-testid="button-cta-how">
                  How It Works
                </Button>
              </Link>
            </div>
          </RevealSection>
        </div>
      </section>
    </Layout>
  );
}
