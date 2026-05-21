import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Link } from "wouter";
import { HelpCircle, ChevronRight, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TocItem {
  id: string;
  title: string;
}

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  toc: TocItem[];
  children: React.ReactNode;
}

export default function LegalPageLayout({ title, lastUpdated, toc, children }: LegalPageLayoutProps) {
  useEffect(() => {
    document.title = `${title} | Fit Finder`;
    return () => { document.title = "Fit Finder"; };
  }, [title]);

  return (
    <Layout>
      <div className="border-b">
        <div className="container mx-auto px-4 md:px-8 py-5">
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-legal-title">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">Last updated: {lastUpdated}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-6">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-20 space-y-4">
              <nav className="border rounded-xl p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Contents</h3>
                <ul className="space-y-1.5">
                  {toc.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors block py-0.5 leading-snug"
                      >
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              <NeedHelpBox />
            </div>
          </aside>

          <div className="flex-1 min-w-0 max-w-3xl">
            <div className="lg:hidden mb-6">
              <details className="border rounded-xl">
                <summary className="px-4 py-3 text-sm font-medium cursor-pointer">Table of Contents</summary>
                <ul className="px-4 pb-3 space-y-1.5">
                  {toc.map((item) => (
                    <li key={item.id}>
                      <a href={`#${item.id}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors block py-0.5">
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            </div>

            <div className="prose prose-sm max-w-none [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:tracking-tight [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_p]:mb-3 [&_ul]:text-sm [&_ul]:text-muted-foreground [&_ul]:mb-3 [&_ul]:space-y-1 [&_ol]:text-sm [&_ol]:text-muted-foreground [&_ol]:mb-3 [&_ol]:space-y-1 [&_li]:leading-relaxed [&_strong]:text-foreground [&_a]:text-primary [&_a]:no-underline hover:[&_a]:underline">
              {children}
            </div>

            <div className="lg:hidden mt-8">
              <NeedHelpBox />
            </div>

            <div className="mt-8 pt-6 border-t flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} Fit Finder. All rights reserved.
              </p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <ArrowUp className="w-3 h-3" /> Back to top
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function NeedHelpBox() {
  return (
    <div className="border rounded-xl p-4" data-testid="need-help-box">
      <div className="flex items-center gap-2 mb-2">
        <HelpCircle className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">Need help?</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        If you have questions about this document, our support team is here to help.
      </p>
      <Link href="/trust-safety/contact-support">
        <Button variant="outline" size="sm" className="w-full rounded-lg text-xs h-8">
          Contact Support <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </Link>
    </div>
  );
}

export function LegalSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
