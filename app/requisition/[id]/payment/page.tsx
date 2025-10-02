"use client"

import { useAuth } from "@/lib/auth-context"
import { useRequisitions } from "@/lib/requisition-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Package, CreditCard } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { RequisitionStatusBadge } from "@/components/requisition-status-badge"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

export default function ProcessPaymentPage() {
  const { user } = useAuth()
  const { getRequisitionById, updateRequisitionStatus } = useRequisitions()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [paymentReference, setPaymentReference] = useState("")

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

  const handleProcessPayment = () => {
    if (!paymentReference.trim()) {
      toast({
        title: "Payment Reference Required",
        description: "Please enter a payment reference number",
        variant: "destructive",
      })
      return
    }

    updateRequisitionStatus(requisition.id, "paid", {
      paidBy: user?.name,
      paidAt: new Date(),
      paymentReference,
    })

    toast({
      title: "Payment Processed",
      description: "The Store Manager has been notified to fulfill this requisition",
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
              <h1 className="text-lg font-semibold text-foreground">Process Payment</h1>
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
                <p className="text-sm font-medium text-muted-foreground">Approved By</p>
                <p className="text-base text-foreground">{requisition.approvedBy}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved Date</p>
                <p className="text-base text-foreground">
                  {requisition.approvedAt ? format(requisition.approvedAt, "PPP") : "N/A"}
                </p>
              </div>
            </div>

            <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
              <p className="text-sm font-medium text-muted-foreground mb-1">Amount to Pay</p>
              <p className="text-3xl font-bold text-foreground">${requisition.pricing?.toLocaleString()}</p>
              {requisition.pricingNotes && (
                <p className="text-sm text-muted-foreground mt-2">{requisition.pricingNotes}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>Enter payment details to complete the transaction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentReference">Payment Reference Number</Label>
              <Input
                id="paymentReference"
                placeholder="e.g., INV-2024-001, PO-12345"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter the invoice number, purchase order, or transaction reference
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.back()} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleProcessPayment} className="flex-1">
                <CreditCard className="mr-2 h-4 w-4" />
                Confirm Payment
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Once payment is confirmed, the Store Manager will be notified to fulfill this requisition.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
