"use client"

import { useAuth } from "@/lib/auth-context"
import { useRequisitions } from "@/lib/requisition-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, LogOut, Bell, Truck, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { RequisitionStatusBadge } from "@/components/requisition-status-badge"
import { formatDistanceToNow } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CSNOCDashboard() {
  const { user, logout } = useAuth()
  const { requisitions, notifications } = useRequisitions()
  const router = useRouter()

  const unreadNotifications = notifications.filter((n) => n.userId === user?.id && !n.read)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const awaitingDeployment = requisitions.filter((r) => r.status === "fulfilled")
  const deployed = requisitions.filter((r) => r.status === "deployed")

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
              <p className="text-xs text-muted-foreground">CSNOC Dashboard</p>
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
                <p className="text-xs text-muted-foreground">CSNOC</p>
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
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Awaiting Deployment</CardDescription>
              <CardTitle className="text-3xl">{awaitingDeployment.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Deployed</CardDescription>
              <CardTitle className="text-3xl">{deployed.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Managed</CardDescription>
              <CardTitle className="text-3xl">{awaitingDeployment.length + deployed.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Requisitions Tabs */}
        <Tabs defaultValue="awaiting" className="space-y-4">
          <TabsList>
            <TabsTrigger value="awaiting">Awaiting Deployment ({awaitingDeployment.length})</TabsTrigger>
            <TabsTrigger value="deployed">Deployed ({deployed.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="awaiting" className="space-y-4">
            {awaitingDeployment.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Truck className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold text-foreground">No pending deployments</h3>
                  <p className="text-sm text-muted-foreground">All fulfilled requisitions have been deployed</p>
                </CardContent>
              </Card>
            ) : (
              awaitingDeployment.map((req) => (
                <Card key={req.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{req.id}</CardTitle>
                          <RequisitionStatusBadge status={req.status} />
                        </div>
                        <CardDescription>
                          Requested by {req.requesterName} • Fulfilled{" "}
                          {req.fulfilledAt && formatDistanceToNow(req.fulfilledAt, { addSuffix: true })}
                        </CardDescription>
                      </div>
                      <Button size="sm" onClick={() => router.push(`/requisition/${req.id}/deploy`)}>
                        <Truck className="mr-2 h-4 w-4" />
                        Assign Deployment
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
                        <p className="text-sm font-medium text-muted-foreground">Original Requester</p>
                        <p className="text-sm text-foreground">{req.requesterName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Fulfilled By</p>
                        <p className="text-sm text-foreground">{req.fulfilledBy || "N/A"}</p>
                      </div>
                    </div>
                    {req.notes && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-muted-foreground">Original Notes</p>
                        <p className="text-sm text-foreground">{req.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="deployed" className="space-y-4">
            {deployed.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Truck className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold text-foreground">No deployed requisitions</h3>
                  <p className="text-sm text-muted-foreground">Deployed requisitions will appear here</p>
                </CardContent>
              </Card>
            ) : (
              deployed.map((req) => (
                <Card key={req.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{req.id}</CardTitle>
                          <RequisitionStatusBadge status={req.status} />
                        </div>
                        <CardDescription>
                          Deployed to {req.assignedEngineerName} •{" "}
                          {req.deployedAt && formatDistanceToNow(req.deployedAt, { addSuffix: true })}
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
                        <p className="text-sm font-medium text-muted-foreground">Original Requester</p>
                        <p className="text-sm text-foreground">{req.requesterName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Deployed To</p>
                        <p className="text-sm text-foreground">{req.assignedEngineerName}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
