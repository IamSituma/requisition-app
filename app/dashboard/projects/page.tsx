"use client"

import { useAuth } from "@/lib/auth-context"
import { useRequisitions } from "@/lib/requisition-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, LogOut, Bell, DollarSign, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { RequisitionStatusBadge } from "@/components/requisition-status-badge"
import { formatDistanceToNow } from "date-fns"
import { DashboardHeader } from "@/components/dashboard-header"

export default function ProjectsDashboard() {
  const { user, logout } = useAuth()
  const { requisitions, notifications } = useRequisitions()
  const router = useRouter()

  if (!user || user.role !== "projects") return null

  const unreadNotifications = notifications.filter((n) => n.userId === user?.id && !n.read)
  const pricingNeeded = requisitions.filter((r) => r.status === "pricing_needed")
  const pricingProvided = requisitions.filter((r) => r.status === "pricing_received")

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Reusable Header */}
      <DashboardHeader title="Requisition System" subtitle="Projects Dashboard" />

      <main className="container mx-auto p-6">
        {/* Stats Overview */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Awaiting Pricing</CardDescription>
              <CardTitle className="text-3xl">{pricingNeeded.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pricing Provided</CardDescription>
              <CardTitle className="text-3xl">{pricingProvided.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Requests</CardDescription>
              <CardTitle className="text-3xl">{pricingNeeded.length + pricingProvided.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Pricing Needed Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Pricing Requests</h2>
          <p className="text-sm text-muted-foreground mb-4">Requisitions awaiting pricing information</p>

          <div className="space-y-4">
            {pricingNeeded.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <DollarSign className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold text-foreground">No pricing requests</h3>
                  <p className="text-sm text-muted-foreground">All requisitions have been priced</p>
                </CardContent>
              </Card>
            ) : (
              pricingNeeded.map((req) => (
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
                      <Button size="sm" onClick={() => router.push(`/requisition/${req.id}/pricing`)}>
                        <DollarSign className="mr-2 h-4 w-4" />
                        Add Pricing
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
                        <p className="text-sm font-medium text-muted-foreground">Escalated</p>
                        <p className="text-sm text-foreground">{formatDistanceToNow(req.updatedAt, { addSuffix: true })}</p>
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
        </div>

        {/* Pricing Provided Section */}
        {pricingProvided.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Pricing Provided</h2>
            <p className="text-sm text-muted-foreground mb-4">Requisitions with pricing awaiting management approval</p>

            <div className="space-y-4">
              {pricingProvided.map((req) => (
                <Card key={req.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{req.id}</CardTitle>
                          <RequisitionStatusBadge status={req.status} />
                        </div>
                        <CardDescription>
                          Requested by {req.requesterName} • Pricing: ${req.pricing?.toLocaleString()}
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
                        <p className="text-sm font-medium text-muted-foreground">Total Price</p>
                        <p className="text-sm font-semibold text-foreground">${req.pricing?.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
