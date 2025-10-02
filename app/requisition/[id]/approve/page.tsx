"use client"

import { useAuth } from "@/lib/auth-context"
import { useRequisitions } from "@/lib/requisition-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Package, CheckCircle, XCircle } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { RequisitionStatusBadge } from "@/components/requisition-status-badge"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

export default function ApproveRequisitionPage() {
  const { user } = useAuth()
  const { getRequisitionById, updateRequisitionStatus } = useRequisitions()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectForm, setShowRejectForm] = useState(false)

  const requisition = getRequisitionById(params.id as string)

  if (!requisition) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Requisition Not Found</h2>
          <Button className="mt-4" onClick={() => router.push(`/dashboard/${user?.role}`)}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const handleApprove = () => {
    updateRequisitionStatus(requisition.id, "approved", {
      approvedBy: user?.name,
      approvedAt: new Date(),
    })

    toast({
      title: "Requisition Approved",
      description: "The requisition has been sent to Accounts for payment processing",
    })

    router.push(`/dashboard/${user?.role}`)
  }

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      })
      return
    }

    updateRequisitionStatus(requisition.id, "rejected", {
      approvedBy: user?.name,
      approvedAt: new Date(),
      rejectionReason,
    })

    toast({
      title: "Requisition Rejected",
      description: "The requester has been notified of the rejection",
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
              <h1 className="text-lg font-semibold text-foreground">Review Requisition</h1>
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
                <p className="text-sm font-medium text-muted-foreground">Priced By</p>
                <p className="text-base text-foreground">{requisition.pricingAddedBy || "N/A"}</p>
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

            <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Price</p>
              <p className="text-3xl font-bold text-foreground">${requisition.pricing?.toLocaleString()}</p>
              {requisition.pricingNotes && (
                <p className="text-sm text-muted-foreground mt-2">{requisition.pricingNotes}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Approval Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Management Decision</CardTitle>
            <CardDescription>Approve or reject this requisition based on budget and business needs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showRejectForm ? (
              <div className="flex gap-3">
                <Button onClick={handleApprove} className="flex-1">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve Requisition
                </Button>
                <Button onClick={() => setShowRejectForm(true)} variant="destructive" className="flex-1">
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Requisition
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="rejectionReason">Rejection Reason</Label>
                  <Textarea
                    id="rejectionReason"
                    placeholder="Explain why this requisition is being rejected..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowRejectForm(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleReject} variant="destructive" className="flex-1">
                    Confirm Rejection
                  </Button>
                </div>
              </>
            )}

            <p className="text-xs text-muted-foreground">
              Approved requisitions will be sent to Accounts for payment processing. Rejected requisitions will notify
              the requester.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
