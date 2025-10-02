"use client"

import { useAuth } from "@/lib/auth-context"
import { useRequisitions } from "@/lib/requisition-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Package, Send } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { RequisitionStatusBadge } from "@/components/requisition-status-badge"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

export default function ManageRequisitionPage() {
  const { user } = useAuth()
  const { getRequisitionById, updateRequisitionStatus } = useRequisitions()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [notes, setNotes] = useState("")

  const requisition = getRequisitionById(params.id as string)

  if (!requisition) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Requisition Not Found</h2>
          <p className="text-muted-foreground">The requisition you're looking for doesn't exist.</p>
          <Button className="mt-4" onClick={() => router.push(`/dashboard/${user?.role}`)}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const handleFulfillFromStock = () => {
    updateRequisitionStatus(requisition.id, "fulfilled", {
      fulfilledBy: user?.name,
      fulfilledAt: new Date(),
    })

    toast({
      title: "Requisition Fulfilled",
      description: "The requisition has been marked as fulfilled from stock",
    })

    router.push(`/dashboard/${user?.role}`)
  }

  const handleEscalateForPricing = () => {
    updateRequisitionStatus(requisition.id, "pricing_needed")

    toast({
      title: "Escalated for Pricing",
      description: "The requisition has been sent to Projects for pricing",
    })

    router.push(`/dashboard/${user?.role}`)
  }

  const handleMarkFulfilled = () => {
    updateRequisitionStatus(requisition.id, "fulfilled", {
      fulfilledBy: user?.name,
      fulfilledAt: new Date(),
    })

    toast({
      title: "Requisition Fulfilled",
      description: "The requisition has been marked as fulfilled",
    })

    router.push(`/dashboard/${user?.role}`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Manage Requisition</h1>
              <p className="text-xs text-muted-foreground">{requisition.id}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-4xl p-6">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl">{requisition.id}</CardTitle>
                  <RequisitionStatusBadge status={requisition.status} />
                </div>
                <CardDescription>Requested by {requisition.requesterName}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Router Type</p>
                <p className="text-base text-foreground">{requisition.routerType}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Quantity</p>
                <p className="text-base text-foreground">{requisition.quantity}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <p className="text-base text-foreground">{format(requisition.createdAt, "PPP")}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                <p className="text-base text-foreground">{format(requisition.updatedAt, "PPP")}</p>
              </div>
            </div>

            {requisition.notes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Requester Notes</p>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm text-foreground">{requisition.notes}</p>
                </div>
              </div>
            )}

            {requisition.pricing && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Pricing Information</p>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-base font-semibold text-foreground">${requisition.pricing.toLocaleString()}</p>
                  {requisition.pricingNotes && (
                    <p className="text-sm text-muted-foreground mt-1">{requisition.pricingNotes}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Management Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Store Manager Actions</CardTitle>
            <CardDescription>Choose an action to manage this requisition</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {requisition.status === "pending" && (
              <>
                <div className="space-y-2">
                  <Label>Management Notes (Optional)</Label>
                  <Textarea
                    placeholder="Add any notes about stock availability or fulfillment..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleFulfillFromStock} className="flex-1">
                    <Package className="mr-2 h-4 w-4" />
                    Fulfill from Stock
                  </Button>
                  <Button onClick={handleEscalateForPricing} variant="outline" className="flex-1 bg-transparent">
                    <Send className="mr-2 h-4 w-4" />
                    Escalate for Pricing
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Choose "Fulfill from Stock" if the items are available, or "Escalate for Pricing" if you need to order
                  them.
                </p>
              </>
            )}

            {requisition.status === "pricing_needed" && (
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  This requisition has been sent to Projects for pricing. You'll be notified when pricing is received.
                </p>
              </div>
            )}

            {requisition.status === "paid" && (
              <>
                <div className="space-y-2">
                  <Label>Fulfillment Notes (Optional)</Label>
                  <Textarea
                    placeholder="Add any notes about the fulfillment..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button onClick={handleMarkFulfilled} className="w-full">
                  <Package className="mr-2 h-4 w-4" />
                  Mark as Fulfilled
                </Button>

                <p className="text-xs text-muted-foreground">
                  Mark this requisition as fulfilled once the items have been prepared for deployment.
                </p>
              </>
            )}

            {(requisition.status === "approved" ||
              requisition.status === "pricing_received" ||
              requisition.status === "fulfilled") && (
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  This requisition is currently being processed. No action required at this time.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
