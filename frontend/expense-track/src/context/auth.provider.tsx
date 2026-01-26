import { useEffect, useState } from "react"
import React from "react"
import type { UserType } from "@/types/auth.types"
import { AuthContext } from "./auth.context"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function fetchMe() {
      try {
        setLoading(true)
        const res = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        })

        const data = await res.json().catch(() => ({}))

        if (!res.ok) {
          throw new Error(data.error || data.message || "Fetch Failed")
        }

        setUser(data)        
      } catch (err: any) {
        console.error(err.message || "Error fetching data")
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchMe()
  }, [])


  async function logOut() {
    try {
      const res = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      })

      if (!res.ok) {
        throw new Error("Logout failed")
      }

      setUser(null)
    } catch (err: any) {
      console.error(err.message || "Error logging out")
    }
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logOut }}>
      {children}
    </AuthContext.Provider>
  )
}
