import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { auth, isFirebaseConfigured } from "../services/firebase";
import { isSupabaseConfigured, supabase } from "../services/supabase";

interface AuthContextValue {
  user: User | { uid: string; email: string } | null;
  loading: boolean;
  isDemo: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function isAdmin(uid: string): Promise<boolean> {
  if (!supabase) {
    throw new Error("Supabase is not configured. Add its URL and anon key to enable admin access.");
  }
  const { data, error } = await supabase
    .from("admins")
    .select("firebase_uid")
    .eq("firebase_uid", uid)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(`Unable to verify the admin account in Supabase: ${error.message}`);
  return Boolean(data);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const isDemo = !isFirebaseConfigured && !isSupabaseConfigured;
  const [user, setUser] = useState<AuthContextValue["user"]>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      const demo = isDemo && sessionStorage.getItem("jaytronix-demo-admin");
      setUser(demo ? { uid: "demo-admin", email: "admin@jaytronix.co.tz" } : null);
      setLoading(false);
      return;
    }
    const firebaseAuth = auth;
    return onAuthStateChanged(firebaseAuth, async (nextUser) => {
      try {
        if (!nextUser) {
          setUser(null);
        } else {
          const authorized = await isAdmin(nextUser.uid);
          setUser(authorized ? nextUser : null);
          if (!authorized) await signOut(firebaseAuth);
        }
      } catch (error) {
        console.error("Unable to verify the Firebase admin account.", error);
        setUser(null);
        if (nextUser) await signOut(firebaseAuth);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  async function login(email: string, password: string) {
    if (auth) {
      setLoading(true);
      try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        if (!(await isAdmin(credential.user.uid))) {
          await signOut(auth);
          throw new Error("This account is not an authorized admin. Add its Firebase UID to the Supabase admins table.");
        }
        setUser(credential.user);
      } finally {
        setLoading(false);
      }
    } else {
      if (!isDemo) throw new Error("Firebase Authentication is not configured.");
      if (email !== "admin@jaytronix.co.tz" || password !== "demo1234") throw new Error("Use the demo credentials shown below.");
      sessionStorage.setItem("jaytronix-demo-admin", "true");
      setUser({ uid: "demo-admin", email });
    }
  }

  async function logout() {
    if (auth) await signOut(auth);
    sessionStorage.removeItem("jaytronix-demo-admin");
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, isDemo, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
