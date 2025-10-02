"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRequisitions } from "@/lib/requisition-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileDown, Calendar, TrendingUp, Package, DollarSign, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import type { RequisitionStatus } from "@/lib/types"
import { useRouter } from "next/navigation"

export default function ReportsPage() {
  const { user } = useAuth()
  const { requisitions } = useRequisitions()
  const router = useRouter()
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [statusFilter, setStatusFilter] = useState<RequisitionStatus | "all">("all")

  // Filter requisitions by date range and status
  const filteredRequisitions = requisitions.filter((req) => {
    const reqDate = new Date(req.createdAt)
    const start = startDate ? new Date(startDate) : null
    const end = endDate ? new Date(endDate) : null

    const dateMatch = (!start || reqDate >= start) && (!end || reqDate <= end)
    const statusMatch = statusFilter === "all" || req.status === statusFilter

    return dateMatch && statusMatch
  })

  // Calculate statistics
  const totalRequisitions = filteredRequisitions.length
  const approvedRequisitions = filteredRequisitions.filter(
    (r) => r.status === "approved" || r.status === "paid" || r.status === "fulfilled" || r.status === "deployed",
  ).length
  const rejectedRequisitions = filteredRequisitions.filter((r) => r.status === "rejected").length
  const totalValue = filteredRequisitions.reduce((sum, r) => sum + (r.pricing || 0) * r.quantity, 0)

  // Generate PDF report
  const generatePDF = async () => {
    // Dynamic import to avoid SSR issues
    const jsPDF = (await import("jspdf")).default
    await import("jspdf-autotable")

    const doc = new jsPDF()

    // Add title
    doc.setFontSize(20)
    doc.text("Requisition Report", 14, 20)

    // Add date range
    doc.setFontSize(12)
    const dateRange = `Period: ${startDate || "All time"} to ${endDate || "Present"}`
    doc.text(dateRange, 14, 30)

    // Add summary statistics
    doc.setFontSize(14)
    doc.text("Summary", 14, 45)
    doc.setFontSize(11)
    doc.text(`Total Requisitions: ${totalRequisitions}`, 14, 55)
    doc.text(`Approved: ${approvedRequisitions}`, 14, 62)
    doc.text(`Rejected: ${rejectedRequisitions}`, 14, 69)
    doc.text(`Total Value: $${totalValue.toLocaleString()}`, 14, 76)

    // Add table of requisitions
    const tableData = filteredRequisitions.map((req) => [
      req.id.slice(0, 8),
      req.requesterName,
      req.routerType,
      req.quantity.toString(),
      req.status.replace("_", " "),
      req.pricing ? `$${(req.pricing * req.quantity).toLocaleString()}` : "N/A",
      format(new Date(req.createdAt), "MMM d, yyyy"),
    ])

    // @ts-ignore - jspdf-autotable adds autoTable to jsPDF
    doc.autoTable({
      startY: 85,
      head: [["ID", "Requester", "Router Type", "Qty", "Status", "Value", "Date"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 },
    })

    // Save the PDF
    const filename = `requisition-report-${format(new Date(), "yyyy-MM-dd")}.pdf`
    doc.save(filename)
  }

  const handleBack = () => {
    const dashboardRoutes: Record<string, string> = {
      field_engineer: "/dashboard/field_engineer",
      store_manager: "/dashboard/store_manager",
      projects: "/dashboard/projects",
      management: "/dashboard/management",
      accounts: "/dashboard/accounts",
      csnoc: "/dashboard/csnoc",
      admin: "/dashboard/admin",
    }
    router.push(dashboardRoutes[user.role] || "/")
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground">Generate and export requisition reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>Select date range and status to generate report</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status Filter</Label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="pricing_needed">Pricing Needed</SelectItem>
                  <SelectItem value="pricing_received">Pricing Received</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="fulfilled">Fulfilled</SelectItem>
                  <SelectItem value="deployed">Deployed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={generatePDF} className="w-full md:w-auto">
            <FileDown className="mr-2 h-4 w-4" />
            Export to PDF
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requisitions</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequisitions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedRequisitions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <Calendar className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedRequisitions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Requisitions ({filteredRequisitions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredRequisitions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No requisitions found for selected filters</p>
            ) : (
              <div className="space-y-2">
                {filteredRequisitions.map((req) => (
                  <div key={req.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div>
                      <p className="font-medium">{req.routerType}</p>
                      <p className="text-sm text-muted-foreground">
                        {req.requesterName} • Qty: {req.quantity} • {format(new Date(req.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {req.pricing ? `$${(req.pricing * req.quantity).toLocaleString()}` : "N/A"}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">{req.status.replace("_", " ")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
