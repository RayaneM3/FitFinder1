import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export default function Layout({ children, showFooter = true }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary/20">
      <Navbar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}