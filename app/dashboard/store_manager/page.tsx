"use client"

import { useAuth } from "@/lib/auth-context"
import { useRequisitions } from "@/lib/requisition-context"
import { Button } from "@/components/ui/button"
import { Package, DollarSign, Filter } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { RequisitionStatusBadge } from "@/components/requisition-status-badge"
import { formatDistanceToNow } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import type { RequisitionStatus } from "@/lib/types"

export default function StoreManagerDashboard() {
  const { user } = useAuth()
  const { requisitions } = useRequisitions()
  const router = useRouter()
  const [filterStatus, setFilterStatus] = useState<RequisitionStatus | "all">("all")

  const filteredRequisitions =
    filterStatus === "all" ? requisitions : requisitions.filter((req) => req.status === filterStatus)

  const counts = {
    pending: requisitions.filter((r) => r.status === "pending").length,
    pricing_needed: requisitions.filter((r) => r.status === "pricing_needed").length,
    paid: requisitions.filter((r) => r.status === "paid").length,
    fulfilled: requisitions.filter((r) => r.status === "fulfilled").length,
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <DashboardHeader title="Requisition System" subtitle="Store Manager Dashboard" />

      {/* Main Content */}
      <main className="container mx-auto p-6">
        {/* Stats Overview */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          {Object.entries(counts).map(([status, count]) => (
            <Button
              key={status}
              className="cursor-pointer hover:shadow-md transition-shadow bg-card p-4"
              onClick={() => setFilterStatus(status as RequisitionStatus)}
            >
              <div className="flex flex-col items-center">
                <span className="text-muted-foreground capitalize">{status.replace("_", " ")}</span>
                <span className="text-2xl font-bold">{count}</span>
              </div>
            </Button>
          ))}
        </div>

        {/* Actions */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">All Requisitions</h2>
            <p className="text-sm text-muted-foreground">Manage equipment requests and fulfillment</p>
          </div>

          <Button variant="outline" onClick={() => setFilterStatus("all")}>
            <Filter className="mr-2 h-4 w-4" />
            {filterStatus === "all" ? "All Requisitions" : "Clear Filter"}
          </Button>
        </div>

        {/* Requisitions Tabs */}
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">
              Active (
              {requisitions.filter(
                (r) => !["fulfilled", "deployed", "rejected"].includes(r.status),
              ).length}
              )
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({requisitions.filter((r) => ["fulfilled", "deployed"].includes(r.status)).length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({requisitions.filter((r) => r.status === "rejected").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {filteredRequisitions
              .filter((r) => !["fulfilled", "deployed", "rejected"].includes(r.status))
              .map((req) => (
                <RequisitionCard key={req.id} req={req} />
              ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {filteredRequisitions
              .filter((r) => ["fulfilled", "deployed"].includes(r.status))
              .map((req) => (
                <RequisitionCard key={req.id} req={req} completed />
              ))}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {filteredRequisitions
              .filter((r) => r.status === "rejected")
              .map((req) => (
                <RequisitionCard key={req.id} req={req} rejected />
              ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

// Separate component for each requisition card
interface RequisitionCardProps {
  req: any
  completed?: boolean
  rejected?: boolean
}

function RequisitionCard({ req, completed, rejected }: RequisitionCardProps) {
  const router = useRouter()
  return (
    <div className="border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4 flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{req.id}</h3>
            <RequisitionStatusBadge status={req.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            Requested by {req.requesterName} • {formatDistanceToNow(req.createdAt, { addSuffix: true })}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(`/requisition/${req.id}`)}>
            View Details
          </Button>
          {!completed && !rejected && (
            <Button
              size="sm"
              onClick={() => router.push(`/requisition/${req.id}/manage`)}
              disabled={req.status === "approved" || req.status === "rejected"}
            >
              Manage
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 grid gap-4 md:grid-cols-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Router Type</p>
          <p className="text-sm text-foreground">{req.routerType}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Quantity</p>
          <p className="text-sm text-foreground">{req.quantity}</p>
        </div>
        {completed ? (
          <>
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
          </>
        ) : rejected ? (
          <div>
            <p className="text-sm font-medium text-muted-foreground">Rejected By</p>
            <p className="text-sm text-foreground">{req.approvedBy || "N/A"}</p>
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <p className="text-sm text-foreground capitalize">{req.status.replace("_", " ")}</p>
          </div>
        )}
      </div>

      {req.notes && (
        <div className="p-4">
          <p className="text-sm font-medium text-muted-foreground">Notes</p>
          <p className="text-sm text-foreground">{req.notes}</p>
        </div>
      )}

      {req.pricing && (
        <div className="p-4 rounded-lg bg-muted m-4">
          <p className="text-sm font-medium text-foreground">
            Pricing: ${req.pricing.toLocaleString()}
          </p>
          {req.pricingNotes && <p className="text-sm text-muted-foreground">{req.pricingNotes}</p>}
        </div>
      )}
    </div>
  )
}
