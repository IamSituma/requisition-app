"use client"

import { useAuth } from "@/lib/auth-context"
import { useRequisitions } from "@/lib/requisition-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Package, Truck } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { RequisitionStatusBadge } from "@/components/requisition-status-badge"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { mockUsers } from "@/lib/mock-data"

export default function DeployRequisitionPage() {
  const { user } = useAuth()
  const { getRequisitionById, updateRequisitionStatus } = useRequisitions()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [selectedEngineerId, setSelectedEngineerId] = useState("")

  const requisition = getRequisitionById(params.id as string)

  // Get all field engineers for deployment assignment
  const fieldEngineers = mockUsers.filter((u) => u.role === "field_engineer")

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

  const handleAssignDeployment = () => {
    if (!selectedEngineerId) {
      toast({
        title: "Engineer Required",
        description: "Please select a field engineer for deployment",
        variant: "destructive",
      })
      return
    }

    const selectedEngineer = fieldEngineers.find((e) => e.id === selectedEngineerId)

    if (!selectedEngineer) {
      toast({
        title: "Error",
        description: "Selected engineer not found",
        variant: "destructive",
      })
      return
    }

    updateRequisitionStatus(requisition.id, "deployed", {
      assignedEngineerId: selectedEngineer.id,
      assignedEngineerName: selectedEngineer.name,
      deployedAt: new Date(),
    })

    toast({
      title: "Deployment Assigned",
      description: `Requisition assigned to ${selectedEngineer.name} for deployment`,
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
              <h1 className="text-lg font-semibold text-foreground">Assign Deployment</h1>
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
                <CardDescription>Originally requested by {requisition.requesterName}</CardDescription>
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
                <p className="text-sm font-medium text-muted-foreground">Fulfilled By</p>
                <p className="text-base text-foreground">{requisition.fulfilledBy || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fulfilled Date</p>
                <p className="text-base text-foreground">
                  {requisition.fulfilledAt ? format(requisition.fulfilledAt, "PPP") : "N/A"}
                </p>
              </div>
            </div>

            {requisition.notes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Original Requester Notes</p>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm text-foreground">{requisition.notes}</p>
                </div>
              </div>
            )}

            <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
              <p className="text-sm font-medium text-muted-foreground mb-1">Equipment Ready for Deployment</p>
              <p className="text-base font-semibold text-foreground">
                {requisition.quantity}x {requisition.routerType}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Deployment Assignment */}
        <Card>
          <CardHeader>
            <CardTitle>Assign Field Engineer</CardTitle>
            <CardDescription>
              Select a field engineer to deploy this equipment. This may be the original requester or a different
              engineer.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="engineer">Field Engineer</Label>
              <Select value={selectedEngineerId} onValueChange={setSelectedEngineerId}>
                <SelectTrigger id="engineer">
                  <SelectValue placeholder="Select field engineer" />
                </SelectTrigger>
                <SelectContent>
                  {fieldEngineers.map((engineer) => (
                    <SelectItem key={engineer.id} value={engineer.id}>
                      <div className="flex items-center gap-2">
                        <span>{engineer.name}</span>
                        {engineer.id === requisition.requesterId && (
                          <span className="text-xs text-muted-foreground">(Original Requester)</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The selected engineer will be notified and can view deployment details
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.back()} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAssignDeployment} className="flex-1">
                <Truck className="mr-2 h-4 w-4" />
                Assign Deployment
              </Button>
            </div>

            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground">
                Once assigned, the field engineer will receive a notification and the requisition will be marked as
                deployed. The original requester will also be notified of the deployment.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
