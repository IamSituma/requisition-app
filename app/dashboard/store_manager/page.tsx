"use client"

import { useAuth } from "@/lib/auth-context"
import { useRequisitions } from "@/lib/requisition-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, LogOut, Bell, Filter, FileText } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { RequisitionStatusBadge } from "@/components/requisition-status-badge"
import { formatDistanceToNow } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { RequisitionStatus } from "@/lib/types"

export default function StoreManagerDashboard() {
  const { user, logout } = useAuth()
  const { requisitions, notifications } = useRequisitions()
  const router = useRouter()
  const [filterStatus, setFilterStatus] = useState<RequisitionStatus | "all">("all")

  const unreadNotifications = notifications.filter((n) => n.userId === user?.id && !n.read)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const filteredRequisitions =
    filterStatus === "all" ? requisitions : requisitions.filter((req) => req.status === filterStatus)

  const pendingCount = requisitions.filter((r) => r.status === "pending").length
  const pricingNeededCount = requisitions.filter((r) => r.status === "pricing_needed").length
  const paidCount = requisitions.filter((r) => r.status === "paid").length
  const fulfilledCount = requisitions.filter((r) => r.status === "fulfilled").length

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
              <p className="text-xs text-muted-foreground">Store Manager Dashboard</p>
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
                <p className="text-xs text-muted-foreground">Store Manager</p>
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
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus("pending")}>
            <CardHeader className="pb-3">
              <CardDescription>Pending Review</CardDescription>
              <CardTitle className="text-3xl">{pendingCount}</CardTitle>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setFilterStatus("pricing_needed")}
          >
            <CardHeader className="pb-3">
              <CardDescription>Pricing Needed</CardDescription>
              <CardTitle className="text-3xl">{pricingNeededCount}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus("paid")}>
            <CardHeader className="pb-3">
              <CardDescription>Ready to Fulfill</CardDescription>
              <CardTitle className="text-3xl">{paidCount}</CardTitle>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setFilterStatus("fulfilled")}
          >
            <CardHeader className="pb-3">
              <CardDescription>Fulfilled</CardDescription>
              <CardTitle className="text-3xl">{fulfilledCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Actions */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">All Requisitions</h2>
            <p className="text-sm text-muted-foreground">Manage equipment requests and fulfillment</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setFilterStatus("all")}>
              <Filter className="mr-2 h-4 w-4" />
              {filterStatus === "all" ? "All Requisitions" : "Clear Filter"}
            </Button>
          </div>
        </div>

        {/* Requisitions Tabs */}
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">
              Active (
              {
                requisitions.filter(
                  (r) => r.status !== "fulfilled" && r.status !== "deployed" && r.status !== "rejected",
                ).length
              }
              )
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({requisitions.filter((r) => r.status === "fulfilled" || r.status === "deployed").length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({requisitions.filter((r) => r.status === "rejected").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {filteredRequisitions
              .filter((r) => r.status !== "fulfilled" && r.status !== "deployed" && r.status !== "rejected")
              .map((req) => (
                <Card key={req.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{req.id}</CardTitle>
                          <RequisitionStatusBadge status={req.status} />
                        </div>
                        <CardDescription>
                          Requested by {req.requesterName} • {formatDistanceToNow(req.createdAt, { addSuffix: true })}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/requisition/${req.id}`)}>
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => router.push(`/requisition/${req.id}/manage`)}
                          disabled={req.status === "approved" || req.status === "rejected"}
                        >
                          Manage
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Router Type</p>
                        <p className="text-sm text-foreground">{req.routerType}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Quantity</p>
                        <p className="text-sm text-foreground">{req.quantity}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        <p className="text-sm text-foreground capitalize">{req.status.replace("_", " ")}</p>
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
                    {req.pricing && (
                      <div className="mt-4 rounded-lg bg-muted p-3">
                        <p className="text-sm font-medium text-foreground">Pricing: ${req.pricing.toLocaleString()}</p>
                        {req.pricingNotes && <p className="text-sm text-muted-foreground">{req.pricingNotes}</p>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {filteredRequisitions
              .filter((r) => r.status === "fulfilled" || r.status === "deployed")
              .map((req) => (
                <Card key={req.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{req.id}</CardTitle>
                          <RequisitionStatusBadge status={req.status} />
                        </div>
                        <CardDescription>
                          Requested by {req.requesterName} • {formatDistanceToNow(req.createdAt, { addSuffix: true })}
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => router.push(`/requisition/${req.id}`)}>
                        View Details
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Router Type</p>
                        <p className="text-sm text-foreground">{req.routerType}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Quantity</p>
                        <p className="text-sm text-foreground">{req.quantity}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Fulfilled</p>
                        <p className="text-sm text-foreground">
                          {req.fulfilledAt ? formatDistanceToNow(req.fulfilledAt, { addSuffix: true }) : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Deployed</p>
                        <p className="text-sm text-foreground">
                          {req.deployedAt ? formatDistanceToNow(req.deployedAt, { addSuffix: true }) : "Pending"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {filteredRequisitions
              .filter((r) => r.status === "rejected")
              .map((req) => (
                <Card key={req.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{req.id}</CardTitle>
                          <RequisitionStatusBadge status={req.status} />
                        </div>
                        <CardDescription>
                          Requested by {req.requesterName} • {formatDistanceToNow(req.createdAt, { addSuffix: true })}
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
                        <p className="text-sm font-medium text-muted-foreground">Rejected By</p>
                        <p className="text-sm text-foreground">{req.approvedBy || "N/A"}</p>
                      </div>
                    </div>
                    {req.rejectionReason && (
                      <div className="mt-4 rounded-lg bg-destructive/10 p-3">
                        <p className="text-sm font-medium text-destructive">Rejection Reason</p>
                        <p className="text-sm text-foreground">{req.rejectionReason}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
