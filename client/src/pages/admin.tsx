import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, API_BASE } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Users, FileWarning, TrendingUp, ShieldAlert, MoreVertical, Loader2, AlertCircle, Trash2, AlertTriangle } from "lucide-react";

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Admin Dashboard | Fit Finder";
    return () => { document.title = "Fit Finder"; };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) setLocation("/auth");
    else if (user && !user.isAdmin) setLocation("/dashboard");
  }, [isAuthenticated, user, setLocation]);

  if (!isAuthenticated || !user || !(user as any).isAdmin) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-8 py-8 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">Platform moderation and metrics</p>
        </div>

        <AdminStats />

        <div className="mt-8">
          <Tabs defaultValue="reports">
            <TabsList className="mb-4">
              <TabsTrigger value="reports" className="gap-2">
                <FileWarning className="w-4 h-4" /> Reports
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="w-4 h-4" /> Users
              </TabsTrigger>
            </TabsList>
            <TabsContent value="reports"><ReportsTab /></TabsContent>
            <TabsContent value="users"><UsersTab /></TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}

function AdminStats() {
  const { data, isLoading, isError } = useQuery<any>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/admin/stats`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  if (isError) {
    return (
      <div className="flex items-center gap-3 p-4 border border-destructive/30 rounded-2xl bg-destructive/5 text-sm">
        <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
        <p className="text-destructive font-medium">Failed to load stats. Please refresh the page.</p>
      </div>
    );
  }

  const cards = [
    { label: "Total Users", value: isLoading ? "—" : (data?.totalUsers ?? 0), icon: <Users className="w-5 h-5 text-muted-foreground" /> },
    { label: "Total Trainers", value: isLoading ? "—" : (data?.totalTrainers ?? 0), icon: <TrendingUp className="w-5 h-5 text-muted-foreground" /> },
    { label: "Revenue (USD)", value: isLoading ? "—" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format((data?.totalRevenue ?? 0) / 100), icon: <TrendingUp className="w-5 h-5 text-muted-foreground" /> },
    { label: "Open Reports", value: isLoading ? "—" : (data?.openReports ?? 0), icon: <ShieldAlert className="w-5 h-5 text-muted-foreground" /> },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <Card
          key={c.label}
          className="animate-in fade-in slide-in-from-bottom-3 duration-500 rounded-2xl transition-shadow hover:shadow-md"
          style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
        >
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
            {c.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{c.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ReportsTab() {
  const { toast } = useToast();

  const { data: reports, isLoading, isError } = useQuery<any[]>({
    queryKey: ["/api/admin/reports"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/admin/reports`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/admin/reports/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Report updated" });
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      OPEN: "bg-red-100 text-red-700 border-red-200",
      REVIEWING: "bg-amber-100 text-amber-700 border-amber-200",
      CLOSED: "bg-green-100 text-green-700 border-green-200",
    };
    return (
      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${map[status] || ""}`}>
        {status}
      </span>
    );
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (isError) return (
    <div className="flex items-center gap-3 p-4 border border-destructive/30 rounded-2xl bg-destructive/5 text-sm">
      <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
      <p className="text-destructive font-medium">Failed to load reports. Please refresh the page.</p>
    </div>
  );
  if (!reports?.length) return <div className="text-center py-12 text-muted-foreground">No reports yet.</div>;

  return (
    <div className="rounded-2xl border overflow-x-auto">
      <table className="w-full text-sm min-w-[640px]">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Reporter</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Reported</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Details</th>
            <th className="p-3" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {reports.map((r: any) => (
            <tr key={r.id} className="bg-card hover:bg-muted/20 transition-colors">
              <td className="p-3 text-muted-foreground whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString()}</td>
              <td className="p-3">{r.reporterName}</td>
              <td className="p-3">
                <Link href={`/profile/${r.reportedId}`} className="text-primary hover:underline">
                  {r.reportedName}
                </Link>
              </td>
              <td className="p-3">
                <Badge variant="outline" className="text-xs">{r.category}</Badge>
              </td>
              <td className="p-3">{statusBadge(r.status)}</td>
              <td className="p-3 text-muted-foreground max-w-xs">
                <span title={r.details}>
                  {r.details ? (r.details.length > 100 ? r.details.slice(0, 100) + "…" : r.details) : "—"}
                </span>
              </td>
              <td className="p-3">
                {r.status !== "CLOSED" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {r.status === "OPEN" && (
                        <DropdownMenuItem onClick={() => updateMutation.mutate({ id: r.id, status: "REVIEWING" })}>
                          Mark Reviewing
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => updateMutation.mutate({ id: r.id, status: "CLOSED" })}>
                        Close Report
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const PAGE_SIZE = 20;

function UsersTab() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [banTarget, setBanTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [warnTarget, setWarnTarget] = useState<{ id: string; name: string } | null>(null);
  const [warnReason, setWarnReason] = useState("");

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError: usersError } = useQuery<{ users: any[]; total: number }>({
    queryKey: ["/api/admin/users", debouncedSearch, page],
    queryFn: async () => {
      const params = new URLSearchParams({ search: debouncedSearch, pageSize: String(PAGE_SIZE), page: String(page) });
      const res = await fetch(`${API_BASE}/api/admin/users?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  const banMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("POST", `/api/admin/users/${userId}/ban`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "User banned" });
      setBanTarget(null);
    },
    onError: () => toast({ title: "Failed to ban user", variant: "destructive" }),
  });

  const unbanMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("POST", `/api/admin/users/${userId}/unban`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User unbanned" });
    },
    onError: () => toast({ title: "Failed to unban user", variant: "destructive" }),
  });

  const warnMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      await apiRequest("POST", `/api/admin/users/${userId}/warn`, { reason });
    },
    onSuccess: () => {
      toast({ title: "Warning sent via email" });
      setWarnTarget(null);
      setWarnReason("");
    },
    onError: () => toast({ title: "Failed to send warning", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "User deleted" });
      setDeleteTarget(null);
    },
    onError: () => toast({ title: "Failed to delete user", variant: "destructive" }),
  });

  const roleBadge = (role: string | null) => {
    if (!role) return <Badge variant="outline" className="text-xs">No Role</Badge>;
    const map: Record<string, string> = {
      TRAINER: "bg-blue-100 text-blue-700 border-blue-200",
      CLIENT: "bg-purple-100 text-purple-700 border-purple-200",
      BOTH: "bg-green-100 text-green-700 border-green-200",
    };
    return (
      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${map[role] || ""}`}>
        {role}
      </span>
    );
  };

  return (
    <div>
      <div className="mb-4">
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : usersError ? (
        <div className="flex items-center gap-3 p-4 border border-destructive/30 rounded-2xl bg-destructive/5 text-sm">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
          <p className="text-destructive font-medium">Failed to load users. Please refresh the page.</p>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Email</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Role</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Joined</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {(data?.users || []).map((u: any) => (
                <tr key={u.id} className="bg-card hover:bg-muted/20 transition-colors">
                  <td className="p-3 font-medium">{u.name || "—"}</td>
                  <td className="p-3 text-muted-foreground">{u.email}</td>
                  <td className="p-3">{roleBadge(u.role)}</td>
                  <td className="p-3 text-muted-foreground whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    {u.bannedAt ? (
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium border bg-red-100 text-red-700 border-red-200">Banned</span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium border bg-green-100 text-green-700 border-green-200">Active</span>
                    )}
                  </td>
                  <td className="p-3">
                    {!u.isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setWarnTarget({ id: u.id, name: u.name }); setWarnReason(""); }}>
                            <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" /> Send Warning
                          </DropdownMenuItem>
                          {u.bannedAt ? (
                            <DropdownMenuItem onClick={() => unbanMutation.mutate(u.id)} disabled={unbanMutation.isPending}>
                              Unban
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="text-destructive" onClick={() => setBanTarget({ id: u.id, name: u.name })}>
                              Ban
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget({ id: u.id, name: u.name })}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.users?.length && (
            <div className="text-center py-8 text-muted-foreground">No users found.</div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <span>{data?.total ?? 0} users total</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <span className="px-2">Page {page} of {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Ban dialog */}
      <Dialog open={!!banTarget} onOpenChange={(open) => !open && setBanTarget(null)}>
        <DialogContent className="rounded-2xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Ban {banTarget?.name}?</DialogTitle>
            <DialogDescription>This will immediately log them out and prevent them from signing in.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setBanTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => banTarget && banMutation.mutate(banTarget.id)} disabled={banMutation.isPending}>
              {banMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm Ban
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Warn dialog */}
      <Dialog open={!!warnTarget} onOpenChange={(open) => !open && setWarnTarget(null)}>
        <DialogContent className="rounded-2xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Warn {warnTarget?.name}</DialogTitle>
            <DialogDescription>A warning email will be sent to this user explaining the reason.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              placeholder="Reason (e.g. 'Posting inappropriate content')"
              value={warnReason}
              onChange={e => setWarnReason(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setWarnTarget(null)}>Cancel</Button>
            <Button
              onClick={() => warnTarget && warnMutation.mutate({ userId: warnTarget.id, reason: warnReason })}
              disabled={warnMutation.isPending || !warnReason.trim()}
            >
              {warnMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Send Warning
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="rounded-2xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete {deleteTarget?.name}?</DialogTitle>
            <DialogDescription>This permanently deletes their account, messages, orders, and all data. This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
