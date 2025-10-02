"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "./types"
import { mockUsers } from "./mock-data"

interface AuthContextType {
  user: User | null
  login: (email: string) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("requisition_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = (email: string) => {
    // In production, this would verify the email and create a session
    // For demo, we'll find the user by email or create a mock user
    let foundUser = mockUsers.find((u) => u.email === email)

    // If user not found in mock data, create a basic field engineer user for demo
    if (!foundUser) {
      foundUser = {
        id: `user-${Date.now()}`,
        email: email,
        name: email.split("@")[0],
        role: "field_engineer",
        createdAt: new Date(),
      }
    }

    setUser(foundUser)
    localStorage.setItem("requisition_user", JSON.stringify(foundUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("requisition_user")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
