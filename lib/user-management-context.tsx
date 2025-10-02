"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { User, UserRole } from "./types"
import { mockUsers } from "./mock-data"

interface UserManagementContextType {
  users: User[]
  updateUserRole: (userId: string, newRole: UserRole) => void
  addUser: (email: string, name: string, role: UserRole) => void
  deleteUser: (userId: string) => void
}

const UserManagementContext = createContext<UserManagementContextType | undefined>(undefined)

export function UserManagementProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(mockUsers)

  const updateUserRole = (userId: string, newRole: UserRole) => {
    setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
  }

  const addUser = (email: string, name: string, role: UserRole) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      role,
      createdAt: new Date(),
    }
    setUsers((prevUsers) => [...prevUsers, newUser])
  }

  const deleteUser = (userId: string) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId))
  }

  return (
    <UserManagementContext.Provider value={{ users, updateUserRole, addUser, deleteUser }}>
      {children}
    </UserManagementContext.Provider>
  )
}

export function useUserManagement() {
  const context = useContext(UserManagementContext)
  if (context === undefined) {
    throw new Error("useUserManagement must be used within a UserManagementProvider")
  }
  return context
}
