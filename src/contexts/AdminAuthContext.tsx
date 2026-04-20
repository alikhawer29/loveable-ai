import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  adminEmail: string | null;
  isLoading: boolean;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAdminRole = async (session: any) => {
      if (!session?.user) {
        if (mounted) {
          setIsAdminAuthenticated(false);
          setAdminEmail(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();
        
        if (mounted) {
          if (data) {
            setIsAdminAuthenticated(true);
            setAdminEmail(session.user.email || null);
          } else {
            setIsAdminAuthenticated(false);
            setAdminEmail(null);
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Admin role check failed:", err);
        if (mounted) {
          setIsAdminAuthenticated(false);
          setAdminEmail(null);
          setIsLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Don't await inside the callback — let it return immediately, then check role async.
      if (!mounted) return;
      queueMicrotask(() => checkAdminRole(session));
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const adminLogin = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return false;

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      // Not an admin — sign out
      await supabase.auth.signOut();
      return false;
    }

    setIsAdminAuthenticated(true);
    setAdminEmail(email);
    return true;
  }, []);

  const adminLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setIsAdminAuthenticated(false);
    setAdminEmail(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ isAdminAuthenticated, adminEmail, isLoading, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return context;
}
