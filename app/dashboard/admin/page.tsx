"use client"

import { useAuth } from "@/lib/auth-context"
import { useUserManagement } from "@/lib/user-management-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, Users, Shield, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { UserRole } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const { users, updateUserRole, addUser, deleteUser } = useUserManagement()
  const router = useRouter()
  const { toast } = useToast()
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserName, setNewUserName] = useState("")
  const [newUserRole, setNewUserRole] = useState<UserRole>("field_engineer")

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push(`/dashboard/${user.role}`)
    }
  }, [user, router])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    updateUserRole(userId, newRole)
    toast({
      title: "Role Updated",
      description: "User role has been successfully updated.",
    })
  }

  const handleAddUser = () => {
    if (!newUserEmail || !newUserName) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      })
      return
    }

    if (!newUserEmail.endsWith("@sprintug.com")) {
      toast({
        title: "Error",
        description: "Email must be from @sprintug.com domain.",
        variant: "destructive",
      })
      return
    }

    addUser(newUserEmail, newUserName, newUserRole)
    toast({
      title: "User Added",
      description: `${newUserName} has been added to the system.`,
    })

    setNewUserEmail("")
    setNewUserName("")
    setNewUserRole("field_engineer")
    setIsAddUserOpen(false)
  }

  const handleDeleteUser = (userId: string, userName: string) => {
    if (userId === user?.id) {
      toast({
        title: "Error",
        description: "You cannot delete your own account.",
        variant: "destructive",
      })
      return
    }

    deleteUser(userId)
    toast({
      title: "User Deleted",
      description: `${userName} has been removed from the system.`,
    })
  }

  const roleStats = {
    field_engineer: users.filter((u) => u.role === "field_engineer").length,
    store_manager: users.filter((u) => u.role === "store_manager").length,
    projects: users.filter((u) => u.role === "projects").length,
    management: users.filter((u) => u.role === "management").length,
    accounts: users.filter((u) => u.role === "accounts").length,
    csnoc: users.filter((u) => u.role === "csnoc").length,
    admin: users.filter((u) => u.role === "admin").length,
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Requisition System</h1>
              <p className="text-xs text-muted-foreground">Admin Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        {/* Stats Overview */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Users</CardDescription>
              <CardTitle className="text-3xl">{users.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Field Engineers</CardDescription>
              <CardTitle className="text-3xl">{roleStats.field_engineer}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Store Managers</CardDescription>
              <CardTitle className="text-3xl">{roleStats.store_manager}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Administrators</CardDescription>
              <CardTitle className="text-3xl">{roleStats.admin}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Actions */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">User Management</h2>
            <p className="text-sm text-muted-foreground">Manage user roles and permissions</p>
          </div>

          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the requisition system. Email must be from @sprintug.com domain.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@sprintug.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUserRole} onValueChange={(value) => setNewUserRole(value as UserRole)}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="field_engineer">Field Engineer</SelectItem>
                      <SelectItem value="store_manager">Store Manager</SelectItem>
                      <SelectItem value="projects">Projects</SelectItem>
                      <SelectItem value="management">Management</SelectItem>
                      <SelectItem value="accounts">Accounts</SelectItem>
                      <SelectItem value="csnoc">CSNOC</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddUser}>Add User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {users.map((u) => (
            <Card key={u.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{u.name}</CardTitle>
                    <CardDescription>
                      {u.email} • Joined {formatDistanceToNow(u.createdAt, { addSuffix: true })}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={u.role}
                      onValueChange={(value) => handleRoleChange(u.id, value as UserRole)}
                      disabled={u.id === user?.id}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="field_engineer">Field Engineer</SelectItem>
                        <SelectItem value="store_manager">Store Manager</SelectItem>
                        <SelectItem value="projects">Projects</SelectItem>
                        <SelectItem value="management">Management</SelectItem>
                        <SelectItem value="accounts">Accounts</SelectItem>
                        <SelectItem value="csnoc">CSNOC</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(u.id, u.name)}
                      disabled={u.id === user?.id}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Current Role:{" "}
                    <span className="font-medium text-foreground capitalize">{u.role.replace("_", " ")}</span>
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
