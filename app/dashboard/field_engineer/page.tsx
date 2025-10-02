"use client"

import { useAuth } from "@/lib/auth-context"
import { useRequisitions } from "@/lib/requisition-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Plus, LogOut, Bell, FileText } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { CreateRequisitionDialog } from "@/components/create-requisition-dialog"
import { RequisitionStatusBadge } from "@/components/requisition-status-badge"
import { formatDistanceToNow } from "date-fns"

export default function FieldEngineerDashboard() {
  const { user, logout } = useAuth()
  const { requisitions, notifications } = useRequisitions()
  const router = useRouter()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const myRequisitions = requisitions.filter((req) => req.requesterId === user?.id)
  const unreadNotifications = notifications.filter((n) => n.userId === user?.id && !n.read)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Requisition System</h1>
              <p className="text-xs text-muted-foreground">Field Engineer Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/reports")}>
              <FileText className="mr-2 h-4 w-4" />
              Reports
            </Button>

            <Button variant="ghost" size="icon" className="relative" onClick={() => router.push("/notifications")}>
              <Bell className="h-5 w-5" />
              {unreadNotifications.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                  {unreadNotifications.length}
                </span>
              )}
            </Button>

            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground">Field Engineer</p>
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
              <CardDescription>Total Requisitions</CardDescription>
              <CardTitle className="text-3xl">{myRequisitions.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending</CardDescription>
              <CardTitle className="text-3xl">{myRequisitions.filter((r) => r.status === "pending").length}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Approved</CardDescription>
              <CardTitle className="text-3xl">
                {myRequisitions.filter((r) => r.status === "approved" || r.status === "paid").length}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Fulfilled</CardDescription>
              <CardTitle className="text-3xl">
                {myRequisitions.filter((r) => r.status === "fulfilled" || r.status === "deployed").length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Actions */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">My Requisitions</h2>
            <p className="text-sm text-muted-foreground">Track and manage your equipment requests</p>
          </div>

          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Requisition
          </Button>
        </div>

        {/* Requisitions List */}
        <div className="space-y-4">
          {myRequisitions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold text-foreground">No requisitions yet</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Create your first equipment requisition to get started
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Requisition
                </Button>
              </CardContent>
            </Card>
          ) : (
            myRequisitions.map((req) => (
              <Card key={req.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{req.id}</CardTitle>
                        <RequisitionStatusBadge status={req.status} />
                      </div>
                      <CardDescription>
                        Created {formatDistanceToNow(req.createdAt, { addSuffix: true })}
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/requisition/${req.id}`)}>
                      View Details
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Router Type</p>
                      <p className="text-sm text-foreground">{req.routerType}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Quantity</p>
                      <p className="text-sm text-foreground">{req.quantity}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                      <p className="text-sm text-foreground">
                        {formatDistanceToNow(req.updatedAt, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  {req.notes && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-muted-foreground">Notes</p>
                      <p className="text-sm text-foreground">{req.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      <CreateRequisitionDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>
  )
}
