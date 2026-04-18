import Layout from "@/components/layout/Layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Trophy,
  Lightbulb,
  HelpCircle,
  BookOpen,
  ShieldCheck,
  AlertTriangle,
  Users,
  MessageCircle,
  ThumbsUp,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const guidelines = [
  {
    icon: Heart,
    title: "Be respectful and supportive",
    description:
      "Treat every member — client or trainer — with dignity. We're all here to grow.",
  },
  {
    icon: AlertTriangle,
    title: "No harassment or discrimination",
    description:
      "Bullying, hate speech, or discriminatory language of any kind results in an immediate ban.",
  },
  {
    icon: MessageCircle,
    title: "No unsolicited DMs",
    description:
      "Trainers may not cold-message clients. All conversations must be initiated by the client.",
  },
  {
    icon: ThumbsUp,
    title: "No body shaming",
    description:
      "Every body is welcome here. Comments about appearance, weight, or size that are unsolicited or demeaning are not tolerated.",
  },
  {
    icon: Lightbulb,
    title: "Share evidence-based tips",
    description:
      "When giving advice, ground it in science and personal experience — not trends or bro-science.",
  },
  {
    icon: ShieldCheck,
    title: "Report and block freely",
    description:
      "If something feels off, report it. We review every report and take swift action. You can block anyone at any time.",
  },
  {
    icon: Users,
    title: "Protect privacy",
    description:
      "Never share another member's personal details, location, or private messages without their consent.",
  },
];

const weeklyWins = [
  {
    title: "Down 12kg in 6 months",
    body: "Working with my trainer through Fit Finder changed everything. The accountability and structure was exactly what I needed.",
    tag: "Fat Loss",
    initials: "JM",
  },
  {
    title: "First pull-up at 42",
    body: "Never thought I'd get there. My trainer broke it down into progressions I could actually follow. Patience pays off.",
    tag: "Strength",
    initials: "SA",
  },
  {
    title: "Marathon PR after switching coaches",
    body: "Finding the right coach made all the difference. The online format worked perfectly with my schedule.",
    tag: "Endurance",
    initials: "DR",
  },
  {
    title: "Back to lifting pain-free",
    body: "After a back injury I thought my lifting days were over. My rehab-focused trainer proved me wrong.",
    tag: "Rehab",
    initials: "KC",
  },
];

const trainerTips = [
  {
    title: "Set clear expectations early",
    body: "Define communication frequency, response times, and session structure during onboarding. It prevents 90% of misunderstandings.",
    tag: "Coaching",
  },
  {
    title: "Price your value, not your time",
    body: "Clients pay for outcomes — not hours. Package your expertise around transformations, not clock minutes.",
    tag: "Business",
  },
  {
    title: "Keep learning, stay humble",
    body: "The best trainers are perpetual students. Stay updated with current research and be willing to say 'I don't know — let me find out.'",
    tag: "Professionalism",
  },
];

const resourceLinks = [
  {
    title: "How It Works",
    description: "Understand the Fit Finder experience from start to finish.",
    href: "/how-it-works",
    icon: BookOpen,
  },
  {
    title: "Pricing",
    description: "Transparent plans for trainers. Free for clients, always.",
    href: "/pricing",
    icon: Sparkles,
  },
  {
    title: "Resources",
    description: "Guides, templates, and tools for trainers.",
    href: "/resources",
    icon: Lightbulb,
  },
  {
    title: "Trust & Safety",
    description: "How we keep the platform safe for everyone.",
    href: "/trust-safety",
    icon: ShieldCheck,
  },
];

export default function Community() {
  return (
    <Layout>
      <section className="pt-20 pb-16 lg:pt-28 lg:pb-20">
        <div className="container mx-auto px-4 md:px-8 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6" data-testid="badge-community">
            <Users className="w-4 h-4" />
            Community
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]" data-testid="text-community-title">
            Community built for progress — not pressure.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto" data-testid="text-community-subtitle">
            Fit Finder is more than a marketplace. It's a community that values respect, evidence-based coaching, and genuine support. Whether you're a client or a trainer, you belong here.
          </p>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4" data-testid="text-guidelines-title">Community Guidelines</h2>
            <p className="text-muted-foreground">
              These rules keep Fit Finder safe and welcoming for everyone. Violations may result in warnings, suspensions, or permanent bans.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {guidelines.map((g, i) => (
              <div
                key={i}
                className="bg-background p-6 rounded-2xl border shadow-sm hover:border-primary/30 transition-colors"
                data-testid={`card-guideline-${i}`}
              >
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
                  <g.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-2">{g.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{g.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-yellow-500/10 text-yellow-600 rounded-xl flex items-center justify-center">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold" data-testid="text-weekly-wins-title">Weekly Wins</h2>
              <p className="text-sm text-muted-foreground">Real progress from real people in the community.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {weeklyWins.map((win, i) => (
              <div
                key={i}
                className="bg-background p-6 rounded-2xl border shadow-sm flex flex-col"
                data-testid={`card-win-${i}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
                    {win.initials}
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-muted rounded-full">{win.tag}</span>
                </div>
                <h3 className="font-semibold mb-2 text-sm">{win.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{win.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold" data-testid="text-trainer-corner-title">Trainer Corner</h2>
              <p className="text-sm text-muted-foreground">Tips on coaching, business, and professionalism.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl">
            {trainerTips.map((tip, i) => (
              <div
                key={i}
                className="bg-background p-6 rounded-2xl border shadow-sm"
                data-testid={`card-tip-${i}`}
              >
                <span className="text-xs font-medium px-2 py-1 bg-blue-500/10 text-blue-600 rounded-full">{tip.tag}</span>
                <h3 className="font-semibold mt-4 mb-2">{tip.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{tip.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="bg-background border rounded-2xl p-8 md:p-12 max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-500/10 text-green-600 rounded-xl flex items-center justify-center">
                <HelpCircle className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold" data-testid="text-ask-trainer-title">Ask a Trainer</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Have a general fitness question? The "Ask a Trainer" feature lets you post questions to the community. Verified trainers can respond with advice, tips, and guidance — all visible to everyone so the whole community benefits.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              This feature is coming soon. In the meantime, browse our trainer profiles and send a chat request to get personalized advice.
            </p>
            <Link href="/explore">
              <Button variant="outline" className="rounded-xl" data-testid="button-browse-trainers">
                Browse Trainers
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold mb-8" data-testid="text-resources-title">Resources</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {resourceLinks.map((r, i) => (
              <Link key={i} href={r.href}>
                <div
                  className="bg-background p-6 rounded-2xl border shadow-sm hover:border-primary/30 transition-colors cursor-pointer h-full group"
                  data-testid={`card-resource-${i}`}
                >
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
                    <r.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{r.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{r.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-8 max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="h-6 w-6 text-destructive" />
              <h2 className="text-xl font-bold" data-testid="text-safety-title">Safety & Reporting</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you experience harassment, inappropriate behavior, or feel unsafe on Fit Finder, please report it immediately. Every report is reviewed by our team and we take swift action to protect our community.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              You can block any user at any time from their profile or your messages. Reports are completely confidential.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/trust-safety">
                <Button variant="outline" className="rounded-xl" data-testid="link-trust-safety">
                  Trust & Safety Center
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
