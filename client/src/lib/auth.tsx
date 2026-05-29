import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, API_BASE } from "./queryClient";
import { queryClient } from "./queryClient";
import { useLocation } from "wouter";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "CLIENT" | "TRAINER" | "BOTH" | null;
  image: string | null;
  onboardingComplete: boolean;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) return null;
      return res.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/signin", { email, password });
      return res.json() as Promise<{ user: AuthUser; profile: any } | null>;
    },
    onSuccess: (data) => {
      // Hydrate the cache directly from the sign-in response so the redirect
      // fires immediately without depending on a second cross-origin /me fetch.
      if (data?.user) {
        queryClient.setQueryData(["/api/auth/me"], data);
      }
      // Also invalidate so the query stays fresh (background refetch).
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  const signupMutation = useMutation({
    mutationFn: async ({ email, password, name }: { email: string; password: string; name: string }) => {
      const res = await apiRequest("POST", "/api/auth/signup", { email, password, name });
      return res.json() as Promise<{ user: AuthUser; profile: any } | null>;
    },
    onSuccess: (data) => {
      // Same pattern: hydrate immediately, then schedule a background refresh.
      if (data?.user) {
        queryClient.setQueryData(["/api/auth/me"], data);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      setLocation("/");
    },
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const signup = async (email: string, password: string, name: string) => {
    await signupMutation.mutateAsync({ email, password, name });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider
      value={{
        user: data?.user ?? null,
        profile: data?.profile ?? null,
        isLoading,
        isAuthenticated: !!data?.user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
