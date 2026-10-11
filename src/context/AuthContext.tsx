import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { auth, db, isFirebaseConfigured } from "../services/firebase";

interface AuthContextValue {
  user: User | { uid: string; email: string } | null;
  loading: boolean;
  isDemo: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextValue["user"]>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !db) {
      const demo = sessionStorage.getItem("jaytronix-demo-admin");
      setUser(demo ? { uid: "demo-admin", email: "admin@jaytronix.co.tz" } : null);
      setLoading(false);
      return;
    }
    const firebaseAuth = auth;
    const firestore = db;
    return onAuthStateChanged(firebaseAuth, async (nextUser) => {
      try {
        if (!nextUser) {
          setUser(null);
        } else {
          const admin = await getDoc(doc(firestore, "admins", nextUser.uid));
          const authorized = admin.exists() && admin.data().role === "admin";
          setUser(authorized ? nextUser : null);
          if (!authorized) await signOut(firebaseAuth);
        }
      } catch (error) {
        console.error("Unable to verify the Firebase admin account.", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  async function login(email: string, password: string) {
    if (auth) {
      if (!db) throw new Error("Firebase Firestore is not configured.");
      setLoading(true);
      try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        const admin = await getDoc(doc(db, "admins", credential.user.uid));
        if (!admin.exists() || admin.data().role !== "admin") {
          await signOut(auth);
          throw new Error("This account is not authorized as an admin. Check the admins document for this user's UID.");
        }
        setUser(credential.user);
      } finally {
        setLoading(false);
      }
    } else {
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

  return <AuthContext.Provider value={{ user, loading, isDemo: !isFirebaseConfigured, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
