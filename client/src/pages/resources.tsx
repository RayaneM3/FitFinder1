import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  BookOpen, TrendingUp, Award, Users, Dumbbell, Heart,
  Brain, Utensils, ChevronRight, Lightbulb, Target, BarChart3,
  MessageCircle, Calendar, FileText, Video
} from "lucide-react";

const trainerGuides = [
  {
    icon: Target,
    title: "Crafting Your Perfect Profile",
    desc: "Learn how to write a compelling bio, showcase your certifications, and highlight your training philosophy to attract the right clients.",
    tag: "Getting Started",
  },
  {
    icon: BarChart3,
    title: "Pricing Your Services",
    desc: "Strategies for setting competitive rates across single sessions, multi-session packages, and long-term transformation programs.",
    tag: "Business",
  },
  {
    icon: MessageCircle,
    title: "Client Communication Best Practices",
    desc: "How to respond to inquiries, set expectations early, and build trust through clear, professional messaging.",
    tag: "Communication",
  },
  {
    icon: FileText,
    title: "Building Training Plans That Sell",
    desc: "Structure your plans with clear descriptions, realistic timelines, and compelling value propositions that convert browsers into buyers.",
    tag: "Plans",
  },
  {
    icon: Calendar,
    title: "Managing Multiple Clients",
    desc: "Tips for organizing your schedule, tracking progress across clients, and maintaining quality as your roster grows.",
    tag: "Operations",
  },
  {
    icon: TrendingUp,
    title: "Growing Your Client Base",
    desc: "Proven strategies for getting more visibility on the platform, earning great reviews, and generating repeat business.",
    tag: "Growth",
  },
];

const clientGuides = [
  {
    icon: Dumbbell,
    title: "Setting Realistic Fitness Goals",
    desc: "How to define clear, achievable objectives whether you're focused on weight loss, muscle gain, flexibility, or general wellness.",
    tag: "Getting Started",
  },
  {
    icon: Users,
    title: "Choosing the Right Trainer",
    desc: "What to look for in a trainer's profile, the right questions to ask, and how to evaluate if their style matches your needs.",
    tag: "Discovery",
  },
  {
    icon: Utensils,
    title: "Nutrition Fundamentals",
    desc: "A beginner-friendly overview of macronutrients, meal timing, and how nutrition works alongside your training plan.",
    tag: "Nutrition",
  },
  {
    icon: Brain,
    title: "Building Consistent Habits",
    desc: "Science-backed strategies for making exercise a sustainable part of your lifestyle, not just a temporary phase.",
    tag: "Mindset",
  },
  {
    icon: Heart,
    title: "Understanding Recovery",
    desc: "Why rest days matter, how to manage soreness, and the role of sleep and stress management in your fitness journey.",
    tag: "Wellness",
  },
  {
    icon: Lightbulb,
    title: "Getting the Most From Online Coaching",
    desc: "How to stay accountable, communicate effectively, and maximize results when training with a remote coach.",
    tag: "Online Training",
  },
];

const faqs = [
  {
    q: "Is Fit Finder free to use as a client?",
    a: "Yes, creating an account and browsing trainers is completely free. You only pay when you purchase a training plan from a trainer you've connected with.",
  },
  {
    q: "How do I become a trainer on Fit Finder?",
    a: "Sign up and select the Trainer role during onboarding. Fill out your trainer profile with your specialties, experience, certifications, and pricing. Your profile will be live and visible to clients once complete.",
  },
  {
    q: "Can trainers message me first?",
    a: "No. Fit Finder uses client-initiated messaging, which means only clients can start new conversations. This protects you from unsolicited outreach and puts you in full control.",
  },
  {
    q: "Is my location shared with trainers?",
    a: "Only your city and country are displayed on your profile. Your exact address is never shared. You can choose to share more specific location details privately through messaging once you're comfortable.",
  },
  {
    q: "How are payments handled?",
    a: "All payments are processed securely through Stripe. When you purchase a training plan, the payment is handled directly on our platform with industry-standard encryption.",
  },
  {
    q: "Can I be both a trainer and a client?",
    a: "Absolutely. During onboarding, you can select the 'Both' role, which gives you access to both the client and trainer dashboards and features.",
  },
  {
    q: "What if I have an issue with a trainer?",
    a: "You can block any user instantly from their profile or your conversation. You can also file a report with a category and description, and our team will review it promptly.",
  },
];

export default function Resources() {
  useEffect(() => {
    document.title = "Resources | Fit Finder";
    return () => { document.title = "Fit Finder"; };
  }, []);

  return (
    <Layout>
      <section className="pt-20 pb-16 lg:pt-28 lg:pb-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold bg-secondary text-secondary-foreground mb-6" data-testid="badge-resources">
              Resources
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6" data-testid="text-resources-title">
              Everything you need to succeed.
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Guides, tips, and answers to help trainers grow their business and clients get the most out of their fitness journey.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">For Trainers</h2>
              <p className="text-sm text-muted-foreground">Grow your business and deliver great results</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {trainerGuides.map((guide, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 hover:shadow-md hover:border-primary/30 transition-all group" data-testid={`card-trainer-guide-${i}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <guide.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-secondary rounded-md text-secondary-foreground">{guide.tag}</span>
                </div>
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{guide.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{guide.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">For Clients</h2>
              <p className="text-sm text-muted-foreground">Make the most of your fitness journey</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {clientGuides.map((guide, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 hover:shadow-md hover:border-primary/30 transition-all group" data-testid={`card-client-guide-${i}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <guide.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-secondary rounded-md text-secondary-foreground">{guide.tag}</span>
                </div>
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{guide.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{guide.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Quick answers to the most common questions about Fit Finder.</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-background border border-border rounded-2xl p-6" data-testid={`faq-item-${i}`}>
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            We're here to help. Reach out through your dashboard or explore the platform to learn more.
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
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
