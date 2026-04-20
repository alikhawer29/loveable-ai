// Auth context with profile management
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<UserProfile>) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapUser(supaUser: SupabaseUser): UserProfile {
  return {
    id: supaUser.id,
    name: supaUser.user_metadata?.full_name || supaUser.email?.split("@")[0] || "",
    email: supaUser.email || "",
    phone: supaUser.user_metadata?.phone || "",
    avatar: supaUser.user_metadata?.avatar_url,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const loadProfileFromDB = useCallback(async (userId: string, email: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, phone, avatar_url")
      .eq("user_id", userId)
      .maybeSingle();

    if (data) {
      setUser({
        id: userId,
        name: data.full_name || email.split("@")[0],
        email,
        phone: data.phone || "",
        avatar: data.avatar_url || undefined,
      });
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const applySession = (newSession: Session | null) => {
      if (!mounted) return;
      setSession(newSession);
      if (newSession?.user) {
        setUser(mapUser(newSession.user));
        queueMicrotask(() => {
          if (mounted) loadProfileFromDB(newSession.user.id, newSession.user.email || "");
        });
      } else {
        setUser(null);
      }
    };

    // Do not call getSession() in parallel here: it competes for the same GoTrue lock as
    // INITIAL_SESSION and can deadlock or stall refresh when a session exists in localStorage.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      applySession(newSession);
      if (mounted) setIsLoading(false);
    });

    const safety = window.setTimeout(() => {
      if (mounted) setIsLoading(false);
    }, 8000);

    return () => {
      mounted = false;
      window.clearTimeout(safety);
      subscription.unsubscribe();
    };
  }, [loadProfileFromDB]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, phone?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, phone: phone || "" },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw new Error(error.message);
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    queryClient.clear();
  }, [queryClient]);

  const updateUser = useCallback((data: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : prev));
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return;
    await loadProfileFromDB(session.user.id, session.user.email || "");
  }, [session, loadProfileFromDB]);

  return (
    <AuthContext.Provider value={{ user, session, isAuthenticated: !!session, isLoading, login, register, logout, updateUser, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
