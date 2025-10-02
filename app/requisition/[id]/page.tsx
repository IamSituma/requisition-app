"use client"

import { useAuth } from "@/lib/auth-context"
import { useRequisitions } from "@/lib/requisition-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Package, User, Calendar, DollarSign, FileText } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { RequisitionStatusBadge } from "@/components/requisition-status-badge"
import { format } from "date-fns"
import { Separator } from "@/components/ui/separator"

export default function RequisitionDetailsPage() {
  const { user } = useAuth()
  const { getRequisitionById } = useRequisitions()
  const router = useRouter()
  const params = useParams()

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
              <h1 className="text-lg font-semibold text-foreground">Requisition Details</h1>
              <p className="text-xs text-muted-foreground">{requisition.id}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-4xl p-6">
        {/* Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl">{requisition.id}</CardTitle>
                  <RequisitionStatusBadge status={requisition.status} />
                </div>
                <CardDescription>
                  Created {format(requisition.createdAt, "PPP")} • Last updated {format(requisition.updatedAt, "PPP")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Requisition Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Requisition Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Router Type</p>
                  <p className="text-base text-foreground">{requisition.routerType}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Quantity</p>
                  <p className="text-base text-foreground">{requisition.quantity}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Requester</p>
                  <p className="text-base text-foreground">{requisition.requesterName}</p>
                  <p className="text-sm text-muted-foreground">{requisition.requesterEmail}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created Date</p>
                  <p className="text-base text-foreground">{format(requisition.createdAt, "PPP")}</p>
                </div>
              </div>
            </div>

            {requisition.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Requester Notes</p>
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-sm text-foreground">{requisition.notes}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pricing Information */}
        {requisition.pricing && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Pricing Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Price</p>
                  <p className="text-2xl font-bold text-foreground">${requisition.pricing.toLocaleString()}</p>
                </div>
              </div>

              {requisition.pricingNotes && (
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm font-medium text-foreground mb-1">Pricing Notes</p>
                  <p className="text-sm text-muted-foreground">{requisition.pricingNotes}</p>
                </div>
              )}

              {requisition.pricingAddedBy && (
                <div className="text-sm text-muted-foreground">
                  Priced by {requisition.pricingAddedBy} on{" "}
                  {requisition.pricingAddedAt && format(requisition.pricingAddedAt, "PPP")}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Approval Information */}
        {(requisition.status === "approved" ||
          requisition.status === "paid" ||
          requisition.status === "fulfilled" ||
          requisition.status === "deployed" ||
          requisition.status === "rejected") && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {requisition.status === "rejected" ? "Rejection Information" : "Approval Information"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {requisition.status === "rejected" ? "Rejected By" : "Approved By"}
                  </p>
                  <p className="text-base text-foreground">{requisition.approvedBy || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date</p>
                  <p className="text-base text-foreground">
                    {requisition.approvedAt ? format(requisition.approvedAt, "PPP") : "N/A"}
                  </p>
                </div>
              </div>

              {requisition.rejectionReason && (
                <div className="rounded-lg bg-destructive/10 p-3">
                  <p className="text-sm font-medium text-destructive mb-1">Rejection Reason</p>
                  <p className="text-sm text-foreground">{requisition.rejectionReason}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payment Information */}
        {(requisition.status === "paid" || requisition.status === "fulfilled" || requisition.status === "deployed") && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Paid By</p>
                  <p className="text-base text-foreground">{requisition.paidBy || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment Date</p>
                  <p className="text-base text-foreground">
                    {requisition.paidAt ? format(requisition.paidAt, "PPP") : "N/A"}
                  </p>
                </div>
                {requisition.paymentReference && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Payment Reference</p>
                    <p className="text-base text-foreground">{requisition.paymentReference}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fulfillment Information */}
        {(requisition.status === "fulfilled" || requisition.status === "deployed") && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Fulfillment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fulfilled By</p>
                  <p className="text-base text-foreground">{requisition.fulfilledBy || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fulfillment Date</p>
                  <p className="text-base text-foreground">
                    {requisition.fulfilledAt ? format(requisition.fulfilledAt, "PPP") : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Deployment Information */}
        {requisition.status === "deployed" && (
          <Card>
            <CardHeader>
              <CardTitle>Deployment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Assigned Engineer</p>
                  <p className="text-base text-foreground">{requisition.assignedEngineerName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Deployment Date</p>
                  <p className="text-base text-foreground">
                    {requisition.deployedAt ? format(requisition.deployedAt, "PPP") : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
