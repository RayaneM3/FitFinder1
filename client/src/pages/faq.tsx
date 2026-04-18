import Layout from "@/components/layout/Layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQ() {
  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-8 py-16 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">Frequently Asked Questions</h1>
          <p className="text-lg text-muted-foreground">
            Find answers to common questions about Fit Finder and how it works.
          </p>
        </div>

        {/* For Clients Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">For Clients</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="client-1">
              <AccordionTrigger>How do I find a trainer?</AccordionTrigger>
              <AccordionContent>
                Go to the Explore page where you can search by specialty, location, coaching mode (online/in-person/hybrid), price range, and language. Click on any trainer to view their full profile, then hit "Message" when you're ready to connect.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="client-2">
              <AccordionTrigger>Can trainers message me first?</AccordionTrigger>
              <AccordionContent>
                No. Fit Finder is client-initiated only — trainers cannot send you unsolicited messages. You browse privately and start a conversation only when you choose to. This is a core part of our privacy-first approach.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="client-3">
              <AccordionTrigger>How do payments work?</AccordionTrigger>
              <AccordionContent>
                When you purchase a trainer's plan, payment is processed securely through Stripe. Your card details are never shared with the trainer. The trainer receives the payment minus a 12.8% platform fee.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="client-4">
              <AccordionTrigger>Can I get a refund?</AccordionTrigger>
              <AccordionContent>
                Refund policies vary by trainer and plan. Check our Refund Policy page for details. If you have a dispute, contact us at support@fitfinder.co and we'll help mediate.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="client-5">
              <AccordionTrigger>How much of my data can trainers see?</AccordionTrigger>
              <AccordionContent>
                Trainers can only see your name, city (not your exact address), and the information you share in messages. Your email, phone number, and payment details are never visible to trainers.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* For Trainers Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">For Trainers</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="trainer-1">
              <AccordionTrigger>How do I get listed on Fit Finder?</AccordionTrigger>
              <AccordionContent>
                Sign up and complete the onboarding flow — it takes about 5 minutes. Add your specialties, certifications, pricing, and a bio. Once your profile is complete, you'll appear in search results.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="trainer-2">
              <AccordionTrigger>What does Fit Finder charge?</AccordionTrigger>
              <AccordionContent>
                There are no subscription fees or listing fees. Fit Finder takes a 12.8% commission on each transaction when a client purchases one of your plans. You keep 87.2% of every sale.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="trainer-3">
              <AccordionTrigger>How do I get paid?</AccordionTrigger>
              <AccordionContent>
                Connect your Stripe account from the Dashboard. When a client purchases your plan, the payment goes through Stripe and is deposited to your connected account (minus the 12.8% fee) on Stripe's standard payout schedule.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="trainer-4">
              <AccordionTrigger>Can I set my own prices?</AccordionTrigger>
              <AccordionContent>
                Yes. You set your own price range during onboarding and can create plans at any price point. You can offer one-time packages or monthly billing.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="trainer-5">
              <AccordionTrigger>How do I get more clients?</AccordionTrigger>
              <AccordionContent>
                Complete your profile to 100% — profiles with photos, detailed bios, and clear pricing get significantly more inquiries. Share your Fit Finder profile link on your social media and with existing contacts.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* About the Platform Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">About the Platform</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="platform-1">
              <AccordionTrigger>What makes Fit Finder different from other platforms?</AccordionTrigger>
              <AccordionContent>
                Three things: clients initiate all conversations (no spam), location privacy (city-level only, never exact addresses), and secure payments through Stripe. We're built for quality connections, not volume.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="platform-2">
              <AccordionTrigger>Is Fit Finder available outside the UK?</AccordionTrigger>
              <AccordionContent>
                Yes. We have trainers across the UK, Ireland, Europe, the US, and Canada. Online coaching works from anywhere — filter by "Online" coaching mode to find trainers regardless of location.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="platform-3">
              <AccordionTrigger>Is my data safe?</AccordionTrigger>
              <AccordionContent>
                Yes. Passwords are hashed with bcrypt, sessions are stored securely, and payments are processed by Stripe (PCI-DSS compliant). We never sell your data. See our Privacy Policy for full details.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Account & Technical Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Account & Technical</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="account-1">
              <AccordionTrigger>How do I delete my account?</AccordionTrigger>
              <AccordionContent>
                Go to Settings and scroll to the bottom. Click "Delete Account" and confirm. This permanently removes all your data including messages, orders, and profile information.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="account-2">
              <AccordionTrigger>I forgot my password — what do I do?</AccordionTrigger>
              <AccordionContent>
                Click "Forgot your password?" on the sign-in page. Enter your email and we'll send you a reset link that's valid for 1 hour.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </div>
    </Layout>
  );
}
