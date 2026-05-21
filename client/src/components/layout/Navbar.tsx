import { Link, useLocation } from "wouter";
import { Search, MessageSquare, LayoutDashboard, Menu, LogOut, Settings, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { API_BASE } from "@/lib/queryClient";

function useUnreadCount(enabled: boolean) {
  const { data: conversations } = useQuery<any[]>({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/conversations`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled,
    refetchInterval: 30000,
    staleTime: 25000,
  });
  return (conversations || []).reduce((sum: number, c: any) => sum + (c.unreadCount || 0), 0);
}

export default function Navbar() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const unreadCount = useUnreadCount(isAuthenticated);

  const navLink = (href: string) =>
    `text-sm font-medium transition-all duration-200 border-b-2 pb-0.5 hover:text-primary ${
      location === href || location.startsWith(href + "/")
        ? "text-foreground border-primary"
        : "text-muted-foreground border-transparent"
    }`;

  const NavLinks = () => (
    <>
      <Link href="/explore" className={navLink("/explore")} data-testid="link-explore">
        Explore
      </Link>
      {isAuthenticated && (
        <>
          <Link href="/messages" className={`relative ${navLink("/messages")}`} data-testid="link-messages">
            Messages
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-3 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center" data-testid="badge-unread">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
          <Link href="/dashboard" className={navLink("/dashboard")} data-testid="link-dashboard">
            Dashboard
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" data-testid="link-home">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
            F
          </div>
          <span className="font-heading font-bold text-xl tracking-tight hidden sm:inline-block">Fit Finder</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <NavLinks />
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full" data-testid="button-user-menu" aria-label="Open user menu">
                    <Avatar className="h-9 w-9 border border-border">
                      <AvatarImage src={user.image || undefined} alt={user.name} />
                      <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs text-muted-foreground leading-none">
                        {user.role === 'CLIENT' ? 'Client' : user.role === 'TRAINER' ? 'Trainer' : user.role === 'BOTH' ? 'Trainer & Client' : 'Account'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="w-full flex items-center cursor-pointer" data-testid="link-dashboard-menu">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="w-full flex items-center cursor-pointer" data-testid="link-settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  {(user as any).isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="w-full flex items-center cursor-pointer">
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          <span>Admin</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={() => logout()} data-testid="button-logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/auth">
                <Button variant="ghost" className="rounded-xl" data-testid="button-signin">Sign In</Button>
              </Link>
              <Link href="/auth">
                <Button className="rounded-xl" data-testid="button-signup">Get Started</Button>
              </Link>
            </div>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden relative" data-testid="button-mobile-menu" aria-label="Toggle navigation menu">
                <Menu className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-red-500 rounded-full" data-testid="badge-unread-mobile" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-6 py-6">
                {isAuthenticated && user ? (
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-12 w-12 border border-border">
                        <AvatarImage src={user.image || undefined} alt={user.name} />
                        <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{user.role?.toLowerCase()}</p>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-4">
                      <Link href="/explore" className="text-lg font-medium flex items-center gap-2" data-testid="link-mobile-explore"><Search className="h-5 w-5"/> Explore Trainers</Link>
                      <Link href="/messages" className="text-lg font-medium flex items-center gap-2" data-testid="link-mobile-messages">
                        <div className="relative">
                          <MessageSquare className="h-5 w-5"/>
                          {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />}
                        </div>
                        Messages
                        {unreadCount > 0 && <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>}
                      </Link>
                      <Link href="/dashboard" className="text-lg font-medium flex items-center gap-2" data-testid="link-mobile-dashboard"><LayoutDashboard className="h-5 w-5"/> Dashboard</Link>
                      <Link href="/settings" className="text-lg font-medium flex items-center gap-2" data-testid="link-mobile-settings"><Settings className="h-5 w-5"/> Settings</Link>
                    </div>
                    <div className="mt-auto pt-6 border-t">
                      <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => logout()}>
                        <LogOut className="mr-2 h-5 w-5" /> Log out
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col space-y-4">
                    <Link href="/explore" className="text-lg font-medium flex items-center gap-2" data-testid="link-mobile-explore-guest"><Search className="h-5 w-5"/> Explore Trainers</Link>
                    <div className="pt-6 border-t space-y-3">
                      <Link href="/auth"><Button className="w-full rounded-xl" data-testid="button-mobile-started">Get Started</Button></Link>
                      <Link href="/auth"><Button variant="outline" className="w-full rounded-xl" data-testid="button-mobile-signin">Sign In</Button></Link>
                    </div>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
