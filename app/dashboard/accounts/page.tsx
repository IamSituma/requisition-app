"use client"

import { useAuth } from "@/lib/auth-context"
import { useRequisitions } from "@/lib/requisition-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { RequisitionStatusBadge } from "@/components/requisition-status-badge"
import { formatDistanceToNow } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header" // import your header component

export default function AccountsDashboard() {
  const { user } = useAuth()
  const { requisitions, notifications } = useRequisitions()
  const router = useRouter()

  const unreadNotifications = notifications.filter((n) => n.userId === user?.id && !n.read)

  const pendingPayment = requisitions.filter((r) => r.status === "approved")
  const paid = requisitions.filter((r) => r.status === "paid" || r.status === "fulfilled" || r.status === "deployed")

  return (
    <div className="min-h-screen bg-background">
      {/* Reusable Dashboard Header */}
      <DashboardHeader title="Requisition System" subtitle="Accounts Dashboard" />

      {/* Main Content */}
      <main className="container mx-auto p-6">
        {/* Stats Overview */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Payment</CardDescription>
              <CardTitle className="text-3xl">{pendingPayment.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Paid</CardDescription>
              <CardTitle className="text-3xl">{paid.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Value</CardDescription>
              <CardTitle className="text-3xl">
                ${pendingPayment.reduce((sum, r) => sum + (r.pricing || 0), 0).toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Requisitions Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending Payment ({pendingPayment.length})</TabsTrigger>
            <TabsTrigger value="paid">Paid ({paid.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingPayment.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CreditCard className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold text-foreground">No pending payments</h3>
                  <p className="text-sm text-muted-foreground">All approved requisitions have been paid</p>
                </CardContent>
              </Card>
            ) : (
              pendingPayment.map((req) => (
                <Card key={req.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{req.id}</CardTitle>
                          <RequisitionStatusBadge status={req.status} />
                        </div>
                        <CardDescription>
                          Approved by {req.approvedBy} •{" "}
                          {req.approvedAt && formatDistanceToNow(req.approvedAt, { addSuffix: true })}
                        </CardDescription>
                      </div>
                      <Button size="sm" onClick={() => router.push(`/requisition/${req.id}/payment`)}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Process Payment
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
                        <p className="text-sm font-medium text-muted-foreground">Amount</p>
                        <p className="text-base font-semibold text-foreground">${req.pricing?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Requester</p>
                        <p className="text-sm text-foreground">{req.requesterName}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="paid" className="space-y-4">
            {paid.map((req) => (
              <Card key={req.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{req.id}</CardTitle>
                        <RequisitionStatusBadge status={req.status} />
                      </div>
                      <CardDescription>
                        Paid by {req.paidBy} • {req.paidAt && formatDistanceToNow(req.paidAt, { addSuffix: true })}
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
                      <p className="text-sm font-medium text-muted-foreground">Amount Paid</p>
                      <p className="text-base font-semibold text-foreground">${req.pricing?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Reference</p>
                      <p className="text-sm text-foreground">{req.paymentReference || "N/A"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
