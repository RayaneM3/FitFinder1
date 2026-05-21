import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Link, useRoute } from "wouter";
import {
  ShieldCheck,
  MessageCircle,
  MapPin,
  Ban,
  CreditCard,
  Users,
  HeadphonesIcon,
  ArrowLeft,
  ChevronRight,
  Mail,
  AlertTriangle,
  Lock,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const subPages: Record<
  string,
  {
    title: string;
    icon: React.ReactNode;
    description: string;
    sections: {
      heading: string;
      content: string[];
    }[];
    whatItMeans: string[];
  }
> = {
  "client-first-messaging": {
    title: "Client-First Messaging",
    icon: <MessageCircle className="h-8 w-8" />,
    description:
      "On Fit Finder, clients initiate all conversations. Trainers cannot cold-message or solicit potential clients. This ensures you're always in control of who contacts you and when.",
    sections: [
      {
        heading: "How It Works",
        content: [
          "Browse trainer profiles anonymously — trainers cannot see who views their profile.",
          "When you find a trainer you're interested in, send a chat request with a brief message about your goals.",
          "The trainer can accept or decline. If accepted, a private conversation opens.",
          "You can end the conversation at any time by blocking or unmatching.",
        ],
      },
      {
        heading: "Why This Matters",
        content: [
          "Eliminates spam and unsolicited outreach from trainers.",
          "Puts the power in the client's hands — no pressure, no awkward sales pitches.",
          "Creates a respectful environment where trainers earn attention through quality profiles.",
        ],
      },
    ],
    whatItMeans: [
      "You'll never receive an unsolicited message from a trainer.",
      "Your browsing activity is completely private.",
      "You decide when and who to engage with.",
    ],
  },
  "location-privacy": {
    title: "Location Privacy",
    icon: <MapPin className="h-8 w-8" />,
    description:
      "Your privacy is paramount. Fit Finder only displays city-level location data publicly. Your exact address, gym location, or neighborhood is never shared without your explicit consent.",
    sections: [
      {
        heading: "What We Share",
        content: [
          "Trainer profiles show city and country only (e.g., \"London, UK\").",
          "Exact addresses or postcodes are never displayed on public profiles.",
          "Location details for in-person sessions are shared only within an active, accepted conversation.",
        ],
      },
      {
        heading: "Your Controls",
        content: [
          "You choose how much location detail to share in private messages.",
          "You can update or remove your city from your profile at any time.",
          "Online-only trainers don't need to share any location data.",
        ],
      },
    ],
    whatItMeans: [
      "No one can find your exact location through Fit Finder.",
      "You control when and how you share specific location details.",
      "In-person session locations are only discussed in private, accepted conversations.",
    ],
  },
  "block-and-report": {
    title: "Block & Report",
    icon: <Ban className="h-8 w-8" />,
    description:
      "We have zero tolerance for harassment, spam, or inappropriate behavior. Every user has instant access to block and report tools, and our team reviews every report within 24 hours.",
    sections: [
      {
        heading: "How to Block",
        content: [
          "Open any conversation or profile and tap the options menu.",
          "Select \"Block\" — the user will be immediately unable to contact you.",
          "Blocked users cannot see your profile or send you requests.",
          "You can unblock users at any time from your Settings page.",
        ],
      },
      {
        heading: "How to Report",
        content: [
          "Select \"Report\" from any profile or conversation options menu.",
          "Choose a reason: harassment, spam, inappropriate content, fake profile, or other.",
          "Add optional details to help our team investigate.",
          "All reports are reviewed within 24 hours. Serious violations result in immediate suspension.",
        ],
      },
    ],
    whatItMeans: [
      "You can instantly remove anyone who makes you uncomfortable.",
      "Our team takes every report seriously and acts quickly.",
      "Repeat offenders are permanently banned from the platform.",
    ],
  },
  "payments-and-refunds": {
    title: "Payments & Refunds",
    icon: <CreditCard className="h-8 w-8" />,
    description:
      "All payments on Fit Finder are processed securely through the platform. We hold funds in escrow until services are confirmed, protecting both clients and trainers.",
    sections: [
      {
        heading: "Secure Payments",
        content: [
          "All transactions are processed through Stripe with bank-level encryption.",
          "Your payment details are never shared with trainers.",
          "Funds are held securely until you confirm the session or service has been delivered.",
          "Trainers receive payouts on a regular schedule after service confirmation.",
        ],
      },
      {
        heading: "Refund Policy",
        content: [
          "If a trainer cancels a session, you receive a full refund automatically.",
          "Disputes can be raised within 7 days of a completed session.",
          "Our support team mediates all disputes fairly and transparently.",
          "Refunds are processed within 5-10 business days to your original payment method.",
        ],
      },
    ],
    whatItMeans: [
      "Your money is protected until you confirm services were delivered.",
      "You never need to share payment info directly with a trainer.",
      "Fair dispute resolution is always available if something goes wrong.",
    ],
  },
  "community-guidelines": {
    title: "Community Guidelines",
    icon: <Users className="h-8 w-8" />,
    description:
      "Fit Finder is a professional, inclusive community. These guidelines ensure every interaction is respectful, safe, and productive for both clients and trainers.",
    sections: [
      {
        heading: "Expected Behavior",
        content: [
          "Treat all users with respect and professionalism.",
          "Keep conversations relevant to fitness, coaching, and wellness goals.",
          "Be honest in your profile information, qualifications, and pricing.",
          "Respect others' boundaries, time, and communication preferences.",
          "Provide evidence-based advice and avoid making unsubstantiated health claims.",
        ],
      },
      {
        heading: "Prohibited Behavior",
        content: [
          "Harassment, bullying, hate speech, or discrimination of any kind.",
          "Unsolicited messages, spam, or aggressive sales tactics.",
          "Body shaming, diet culture promotion, or harmful fitness advice.",
          "Sharing others' personal information without consent.",
          "Creating fake profiles or misrepresenting qualifications.",
          "Attempting to move transactions off-platform to avoid protections.",
        ],
      },
      {
        heading: "Enforcement",
        content: [
          "First violation: Warning and content removal.",
          "Second violation: Temporary account suspension (7-30 days).",
          "Severe or repeated violations: Permanent ban.",
          "Criminal behavior is reported to appropriate authorities.",
        ],
      },
    ],
    whatItMeans: [
      "You're part of a community that values respect and professionalism.",
      "Violations are taken seriously with clear, escalating consequences.",
      "You can train and coach in a safe, supportive environment.",
    ],
  },
  "contact-support": {
    title: "Contact Support",
    icon: <HeadphonesIcon className="h-8 w-8" />,
    description:
      "Our support team is here to help with any safety concerns, account issues, or questions about using Fit Finder. We aim to respond to all inquiries within 24 hours.",
    sections: [
      {
        heading: "How to Reach Us",
        content: [
          "Email: support@fitfinder.com",
          "In-app: Settings → Help & Support → Contact Us",
          "For urgent safety concerns, use the \"Report\" feature for fastest response.",
          "Business hours: Monday–Friday, 9 AM – 6 PM GMT.",
        ],
      },
      {
        heading: "What We Can Help With",
        content: [
          "Account access and security issues.",
          "Payment disputes and refund requests.",
          "Reporting harassment or safety concerns.",
          "Profile verification and trainer application status.",
          "Technical issues and bug reports.",
          "General questions about using Fit Finder.",
        ],
      },
    ],
    whatItMeans: [
      "Help is always available when you need it.",
      "Safety concerns are prioritized and handled urgently.",
      "Our team is committed to resolving issues quickly and fairly.",
    ],
  },
};

const hubCards = [
  {
    slug: "client-first-messaging",
    title: "Client-First Messaging",
    description: "You control who contacts you. Trainers can never cold-message clients.",
    icon: <MessageCircle className="h-6 w-6" />,
  },
  {
    slug: "location-privacy",
    title: "Location Privacy",
    description: "Only city-level data is shown. Your exact location stays private.",
    icon: <MapPin className="h-6 w-6" />,
  },
  {
    slug: "block-and-report",
    title: "Block & Report",
    description: "Instant tools to block anyone and report inappropriate behavior.",
    icon: <Ban className="h-6 w-6" />,
  },
  {
    slug: "payments-and-refunds",
    title: "Payments & Refunds",
    description: "Secure transactions with escrow protection and fair refund policies.",
    icon: <CreditCard className="h-6 w-6" />,
  },
  {
    slug: "community-guidelines",
    title: "Community Guidelines",
    description: "Clear rules for respectful, professional interactions.",
    icon: <Users className="h-6 w-6" />,
  },
  {
    slug: "contact-support",
    title: "Contact Support",
    description: "Get help with safety concerns, account issues, or questions.",
    icon: <HeadphonesIcon className="h-6 w-6" />,
  },
];

function HubPage() {
  return (
    <Layout>
      <section className="pt-20 pb-12 lg:pt-28 lg:pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <ShieldCheck className="w-4 h-4" /> Trust & Safety
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6" data-testid="text-trust-safety-title">
              Your safety is our foundation.
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Fit Finder is designed from the ground up to protect clients and trainers. 
              Explore our safety features and policies below.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
            {hubCards.map((card) => (
              <Link key={card.slug} href={`/trust-safety/${card.slug}`}>
                <Card
                  className="h-full cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group"
                  data-testid={`card-trust-${card.slug}`}
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      {card.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
                    <div className="mt-4 flex items-center text-sm text-primary font-medium">
                      Learn more <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-muted/50 rounded-2xl border p-8 md:p-12 text-center">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Our Commitment</h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-6 leading-relaxed">
                We believe fitness should be accessible, safe, and free from pressure. 
                Every feature we build starts with the question: "Does this protect our users?"
              </p>
              <div className="grid sm:grid-cols-3 gap-6 mt-8">
                <div className="flex flex-col items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Privacy by Design</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Zero Tolerance Policy</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">24hr Support Response</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function SubPage({ slug }: { slug: string }) {
  const page = subPages[slug];

  if (!page) {
    return (
      <Layout>
        <div className="container mx-auto px-4 md:px-8 py-24 text-center">
          <h1 className="text-2xl font-bold mb-4">Page not found</h1>
          <Link href="/trust-safety">
            <Button variant="outline" data-testid="button-back-trust-safety">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Trust & Safety
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="pt-16 pb-12 lg:pt-24 lg:pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto">
            <Link href="/trust-safety">
              <Button variant="ghost" size="sm" className="mb-8 -ml-2" data-testid="button-back-trust-safety">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Trust & Safety
              </Button>
            </Link>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0">
                {page.icon}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight" data-testid={`text-title-${slug}`}>
                {page.title}
              </h1>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed mb-12">
              {page.description}
            </p>

            <div className="space-y-10 mb-12">
              {page.sections.map((section, i) => (
                <div key={i}>
                  <h2 className="text-xl font-semibold mb-4">{section.heading}</h2>
                  <ul className="space-y-3">
                    {section.content.map((item, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        </div>
                        <span className="text-muted-foreground leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 mb-10">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                What This Means for You
              </h3>
              <ul className="space-y-3">
                {page.whatItMeans.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-1" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-muted/50 rounded-2xl border p-8 text-center">
              <HeadphonesIcon className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                If you have questions or concerns about this policy, our support team is here for you.
              </p>
              <Link href="/trust-safety/contact-support">
                <Button variant="outline" className="rounded-xl" data-testid="button-contact-support">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default function TrustSafety() {
  useEffect(() => {
    document.title = "Trust & Safety | Fit Finder";
    return () => { document.title = "Fit Finder"; };
  }, []);

  const [, params] = useRoute("/trust-safety/:slug");

  if (params?.slug) {
    return <SubPage slug={params.slug} />;
  }

  return <HubPage />;
}
