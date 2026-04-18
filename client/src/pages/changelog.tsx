import Layout from "@/components/layout/Layout";

const entries = [
  {
    date: "April 2026",
    title: "Account & Settings",
    items: [
      "Profile photo upload with instant preview",
      "Password change from settings",
      "Trainer and client profile editing without re-onboarding",
      "Account deletion (GDPR compliant)",
    ],
  },
  {
    date: "April 2026",
    title: "Reviews & Trust",
    items: [
      "Clients can leave reviews after completing an order",
      "Star ratings displayed on trainer cards and profile pages",
      "Average ratings visible in search results",
    ],
  },
  {
    date: "April 2026",
    title: "Trainer Tools",
    items: [
      "Trainer dashboard with leads, active clients, and revenue tracking",
      "Create and manage training plans with one-time or monthly billing",
      "Profile strength meter to help trainers optimise their listing",
    ],
  },
  {
    date: "April 2026",
    title: "Messaging & Safety",
    items: [
      "Real-time messaging between clients and trainers",
      "Block and report system for community safety",
      "Unread message badges in the navigation bar",
    ],
  },
  {
    date: "April 2026",
    title: "Launch",
    items: [
      "Fit Finder is live! Browse personal trainers across the UK, Ireland, and beyond",
      "Filter by specialty, coaching mode, location, price range, and language",
      "Secure payments powered by Stripe Connect",
    ],
  },
];

export default function Changelog() {
  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-8 py-16 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">What's New</h1>
        <p className="text-muted-foreground mb-12">Recent updates and improvements to Fit Finder.</p>
        <div className="space-y-12">
          {entries.map((entry, index) => (
            <div key={index}>
              <span className="inline-block bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs font-medium mb-3">
                {entry.date}
              </span>
              <h2 className="text-lg font-semibold mb-4">{entry.title}</h2>
              <ul className="space-y-2 text-foreground list-disc list-inside">
                {entry.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
