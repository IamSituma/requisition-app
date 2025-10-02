"use client"

import { useAuth } from "@/lib/auth-context"
import { useRequisitions } from "@/lib/requisition-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Plus } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { CreateRequisitionDialog } from "@/components/create-requisition-dialog"
import { RequisitionStatusBadge } from "@/components/requisition-status-badge"
import { formatDistanceToNow } from "date-fns"
import { DashboardHeader } from "@/components/dashboard-header" // import your header component

export default function FieldEngineerDashboard() {
  const { user } = useAuth()
  const { requisitions, notifications } = useRequisitions()
  const router = useRouter()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const myRequisitions = requisitions.filter((req) => req.requesterId === user?.id)
  const unreadNotifications = notifications.filter((n) => n.userId === user?.id && !n.read)

  return (
    <div className="min-h-screen bg-background">
      {/* Reusable Dashboard Header */}
      <DashboardHeader title="Requisition System" subtitle="Field Engineer Dashboard" />

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
