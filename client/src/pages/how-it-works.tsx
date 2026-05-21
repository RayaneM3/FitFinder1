import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Search, MessageCircle, CreditCard, ShieldCheck, MapPin, Heart,
  ChevronRight, UserCheck, Star, Lock, Eye, Ban, Flag, CheckCircle2
} from "lucide-react";

export default function HowItWorks() {
  useEffect(() => {
    document.title = "How It Works | Fit Finder";
    return () => { document.title = "Fit Finder"; };
  }, []);

  return (
    <Layout>
      <section className="pt-20 pb-16 lg:pt-28 lg:pb-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold bg-secondary text-secondary-foreground mb-6" data-testid="badge-how-it-works">
              How Fit Finder Works
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6" data-testid="text-page-title">
              Your journey to better fitness starts here.
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We designed every step around your comfort. No cold outreach, no pressure, no hidden costs. Just a simple way to find the right trainer for you.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="space-y-0">
            <div className="grid md:grid-cols-2 gap-12 items-center py-16 border-b border-border">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg" data-testid="step-number-1">1</div>
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">For Clients</span>
                </div>
                <h2 className="text-3xl font-bold mb-4">Create your profile</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Sign up and tell us about your fitness goals, experience level, and preferences. Whether you're looking for weight loss coaching, strength training, or sports-specific guidance, your profile helps us surface the best matches.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Set your budget range, preferred coaching mode, and location</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Only your city is shown publicly, never your exact address</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Update your profile anytime as your goals evolve</span>
                  </li>
                </ul>
              </div>
              <div className="bg-muted/50 rounded-3xl p-8 border border-border">
                <div className="space-y-4">
                  <div className="bg-background rounded-2xl p-5 border border-border shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><UserCheck className="w-5 h-5 text-primary" /></div>
                      <div><p className="font-semibold text-sm">Profile Setup</p><p className="text-xs text-muted-foreground">Takes under 2 minutes</p></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2.5 bg-primary rounded-full w-full" />
                      <p className="text-xs text-muted-foreground text-right">Complete</p>
                    </div>
                  </div>
                  <div className="bg-background rounded-2xl p-5 border border-border shadow-sm flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <div><p className="font-medium text-sm">London, UK</p><p className="text-xs text-muted-foreground">City-level only</p></div>
                    <Lock className="w-4 h-4 text-green-500 ml-auto" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center py-16 border-b border-border">
              <div className="order-2 md:order-1 bg-muted/50 rounded-3xl p-8 border border-border">
                <div className="space-y-3">
                  {[
                    { name: "Sarah M.", spec: "Weight Loss & Nutrition", price: "$80/session", rating: "4.9" },
                    { name: "James T.", spec: "Strength & Conditioning", price: "$95/session", rating: "5.0" },
                    { name: "Priya K.", spec: "Yoga & Flexibility", price: "$65/session", rating: "4.8" },
                  ].map((t, i) => (
                    <div key={i} className="bg-background rounded-2xl p-4 border border-border shadow-sm flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {t.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.spec}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium">{t.price}</p>
                        <div className="flex items-center justify-end gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs text-muted-foreground">{t.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg" data-testid="step-number-2">2</div>
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Discovery</span>
                </div>
                <h2 className="text-3xl font-bold mb-4">Browse trainers privately</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Explore trainer profiles at your own pace. Filter by specialty, coaching mode (online, in-person, or hybrid), price range, and location. Read about their experience, certifications, and training philosophy.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Trainers cannot see who has viewed their profile</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Save your favorites to compare later</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Filter by specialty, price, location, and coaching style</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center py-16 border-b border-border">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg" data-testid="step-number-3">3</div>
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Connect</span>
                </div>
                <h2 className="text-3xl font-bold mb-4">Start a conversation</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  When you find a trainer you like, send them a message request. Only you can initiate the conversation, so there's zero pressure from the trainer side. Discuss your goals, ask questions, and see if it's a good fit before committing.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Client-initiated messaging keeps you in control</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Block or report anyone at any time with one click</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>All messages are stored securely on our platform</span>
                  </li>
                </ul>
              </div>
              <div className="bg-muted/50 rounded-3xl p-8 border border-border">
                <div className="space-y-3">
                  <div className="bg-background rounded-2xl p-4 border border-border shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">J</div>
                      <div><p className="font-semibold text-sm">You</p><p className="text-xs text-muted-foreground">Just now</p></div>
                    </div>
                    <p className="text-sm text-muted-foreground bg-muted/50 rounded-xl p-3">Hi Sarah! I'm interested in your weight loss program. Could you tell me more about your approach?</p>
                  </div>
                  <div className="bg-background rounded-2xl p-4 border border-border shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">S</div>
                      <div><p className="font-semibold text-sm">Sarah M.</p><p className="text-xs text-muted-foreground">2 min ago</p></div>
                    </div>
                    <p className="text-sm text-muted-foreground bg-muted/50 rounded-xl p-3">Hey! I'd love to help. I focus on sustainable nutrition changes combined with progressive training. Let's chat!</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center py-16">
              <div className="order-2 md:order-1 bg-muted/50 rounded-3xl p-8 border border-border">
                <div className="bg-background rounded-2xl p-6 border border-border shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">12-Week Transformation</h4>
                    <span className="text-sm font-bold text-primary">$499</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Personalized workout & nutrition plan with weekly check-ins and form reviews.</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                    <span className="px-2 py-1 bg-secondary rounded-md">12 weeks</span>
                    <span className="px-2 py-1 bg-secondary rounded-md">3x/week</span>
                    <span className="px-2 py-1 bg-secondary rounded-md">Nutrition included</span>
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t border-border">
                    <Lock className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-muted-foreground">Secure payment via Stripe</span>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg" data-testid="step-number-4">4</div>
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Commit</span>
                </div>
                <h2 className="text-3xl font-bold mb-4">Purchase a plan & start training</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Once you've found your match, browse their available training plans and purchase directly through the platform. Payments are processed securely via Stripe, and your trainer is notified instantly so you can get started.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Transparent pricing with no hidden fees</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Secure checkout powered by Stripe</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Manage all your plans from your dashboard</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Safety is not a feature. It's the foundation.</h2>
            <p className="text-muted-foreground">Every decision we make puts your comfort and privacy first.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Eye, title: "Private Browsing", desc: "Trainers never know who viewed their profile. Browse without pressure." },
              { icon: MessageCircle, title: "Client-First Messaging", desc: "Only clients can start conversations. No unsolicited messages from trainers." },
              { icon: MapPin, title: "Location Privacy", desc: "Only your city and country are displayed. Your exact address stays private." },
              { icon: Ban, title: "Block & Report", desc: "Instantly block anyone or report inappropriate behavior. Zero tolerance policy." },
            ].map((item, i) => (
              <div key={i} className="bg-background p-6 rounded-2xl border border-border text-center">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to find your trainer?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Join thousands of clients who found their perfect fitness match through Fit Finder.
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
        </div>
      </section>
    </Layout>
  );
}
