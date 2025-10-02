"use client"

import { useAuth } from "@/lib/auth-context"
import { useRequisitions } from "@/lib/requisition-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Package, DollarSign } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { RequisitionStatusBadge } from "@/components/requisition-status-badge"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

export default function AddPricingPage() {
  const { user } = useAuth()
  const { getRequisitionById, updateRequisitionStatus } = useRequisitions()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [pricing, setPricing] = useState("")
  const [pricingNotes, setPricingNotes] = useState("")

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

  const handleSubmitPricing = () => {
    const priceValue = Number.parseFloat(pricing)

    if (!priceValue || priceValue <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price",
        variant: "destructive",
      })
      return
    }

    updateRequisitionStatus(requisition.id, "pricing_received", {
      pricing: priceValue,
      pricingNotes,
      pricingAddedAt: new Date(),
      pricingAddedBy: user?.name,
    })

    toast({
      title: "Pricing Added",
      description: "Pricing has been sent to Management for approval",
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
              <h1 className="text-lg font-semibold text-foreground">Add Pricing</h1>
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
                <p className="text-sm font-medium text-muted-foreground">Escalated</p>
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
          </CardContent>
        </Card>

        {/* Pricing Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add Pricing Information</CardTitle>
            <CardDescription>Provide pricing details for this requisition</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pricing">Total Price (USD)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="pricing"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={pricing}
                  onChange={(e) => setPricing(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricingNotes">Pricing Notes (Optional)</Label>
              <Textarea
                id="pricingNotes"
                placeholder="Add details about pricing, vendors, delivery time, etc..."
                value={pricingNotes}
                onChange={(e) => setPricingNotes(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.back()} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSubmitPricing} className="flex-1">
                Submit Pricing
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Once submitted, this pricing will be sent to Management for budget approval.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
