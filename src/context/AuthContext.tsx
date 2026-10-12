import type { User } from "@supabase/supabase-js"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import { isSupabaseConfigured, supabase } from "../services/supabase"

interface AuthContextValue {
  user: User | null

  loading: boolean

  isConfigured: boolean

  login: (email: string, password: string) => Promise<void>

  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function isAdmin(userId: string): Promise<boolean> {
  const client = supabase

  if (!client) {
    throw new Error(
      "Supabase is not configured. Add the Supabase URL and publishable key.",
    )
  }

  const { data, error } = await client

    .from("admins")

    .select("user_id")

    .eq("user_id", userId)

    .eq("role", "admin")

    .maybeSingle()

  if (error)
    throw new Error(
      `Unable to verify the admin account in Supabase: ${error.message}`,
    )

  return Boolean(data)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const client = supabase

  const [user, setUser] = useState<User | null>(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!client) {
      setLoading(false)

      return
    }

    let active = true

    let authEvent = 0

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      const currentEvent = ++authEvent

      queueMicrotask(() => {
        void (async () => {
          if (!active || currentEvent !== authEvent) return

          setLoading(true)

          try {
            if (!session) {
              setUser(null)

              return
            }

            if (await isAdmin(session.user.id)) {
              if (active && currentEvent === authEvent) setUser(session.user)
            } else {
              if (active && currentEvent === authEvent) setUser(null)

              await client.auth.signOut()
            }
          } catch (error) {
            console.error("Unable to verify the Supabase admin account.", error)

            if (active && currentEvent === authEvent) setUser(null)

            if (session) await client.auth.signOut()
          } finally {
            if (active && currentEvent === authEvent) setLoading(false)
          }
        })()
      })
    })

    return () => {
      active = false

      subscription.unsubscribe()
    }
  }, [])

  async function login(email: string, password: string) {
    if (!client) {
      throw new Error(
        "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.",
      )
    }

    setLoading(true)

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (!(await isAdmin(data.user.id))) {
        await client.auth.signOut()

        throw new Error(
          "This account is not an authorized admin. Add its Supabase Auth user ID to the admins table.",
        )
      }

      setUser(data.user)
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    if (client) {
      const { error } = await client.auth.signOut()

      if (error) throw error
    }

    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: isSupabaseConfigured,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) throw new Error("useAuth must be used within AuthProvider")

  return context
}
