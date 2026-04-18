import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Mail, Send } from "lucide-react";

export default function ContactSupport() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      toast({
        title: "Message sent",
        description: "Thank you for contacting us. We'll get back to you within two business days.",
      });
      setName("");
      setEmail("");
      setCategory("");
      setMessage("");
      setSubmitting(false);
    }, 600);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-8 py-10 max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-support-title">Contact Support</h1>
          <p className="text-muted-foreground mt-2" data-testid="text-support-subtitle">
            Have a question, concern, or need help? Fill out the form below and our team will get back to you.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            You can also email us directly at{" "}
            <a href="mailto:support@fitfinder.co" className="text-primary hover:underline" data-testid="link-support-email">
              support@fitfinder.co
            </a>
          </p>
        </div>

        <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950" data-testid="card-safety-warning">
          <CardContent className="flex gap-4 pt-6">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">If you feel unsafe</h3>
              <p className="text-sm text-amber-700 dark:text-amber-400 mb-2">
                If you are in immediate danger, please contact your local emergency services (999 in the UK) before reaching out to us.
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-400 mb-2">
                If a Trainer or Client is behaving inappropriately or making you feel unsafe, you can:
              </p>
              <ul className="text-sm text-amber-700 dark:text-amber-400 list-disc pl-5 space-y-1">
                <li><strong>Block the user</strong> — Go to their profile and select "Block". This will prevent them from contacting you or viewing your profile.</li>
                <li><strong>Report the user</strong> — Use the "Report" button on their profile or in your conversation. Select the reason for your report and provide any relevant details.</li>
                <li><strong>Contact us</strong> — Use the form below and select "Safety Report" as the category. Our team will prioritise your report and respond as quickly as possible.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-support-form">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Send us a message
            </CardTitle>
            <CardDescription>
              We aim to respond to all enquiries within two business days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Your name</Label>
                <Input
                  id="name"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  data-testid="input-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="input-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="account" data-testid="select-item-account">Account</SelectItem>
                    <SelectItem value="payments" data-testid="select-item-payments">Payments</SelectItem>
                    <SelectItem value="safety" data-testid="select-item-safety">Safety Report</SelectItem>
                    <SelectItem value="technical" data-testid="select-item-technical">Technical Issue</SelectItem>
                    <SelectItem value="other" data-testid="select-item-other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Describe your issue or question in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={6}
                  data-testid="textarea-message"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={submitting || !name || !email || !category || !message}
                data-testid="button-submit"
              >
                {submitting ? "Sending..." : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
