import type React from "react"
import { Badge } from "@/components/ui/badge"
import type { RequisitionStatus } from "@/lib/types"
import { Clock, DollarSign, CheckCircle, XCircle, Package, Truck } from "lucide-react"

interface RequisitionStatusBadgeProps {
  status: RequisitionStatus
}

export function RequisitionStatusBadge({ status }: RequisitionStatusBadgeProps) {
  const statusConfig: Record<
    RequisitionStatus,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }
  > = {
    pending: {
      label: "Pending",
      variant: "secondary",
      icon: <Clock className="mr-1 h-3 w-3" />,
    },
    pricing_needed: {
      label: "Pricing Needed",
      variant: "outline",
      icon: <DollarSign className="mr-1 h-3 w-3" />,
    },
    pricing_received: {
      label: "Pricing Received",
      variant: "outline",
      icon: <DollarSign className="mr-1 h-3 w-3" />,
    },
    approved: {
      label: "Approved",
      variant: "default",
      icon: <CheckCircle className="mr-1 h-3 w-3" />,
    },
    rejected: {
      label: "Rejected",
      variant: "destructive",
      icon: <XCircle className="mr-1 h-3 w-3" />,
    },
    paid: {
      label: "Paid",
      variant: "default",
      icon: <CheckCircle className="mr-1 h-3 w-3" />,
    },
    fulfilled: {
      label: "Fulfilled",
      variant: "default",
      icon: <Package className="mr-1 h-3 w-3" />,
    },
    deployed: {
      label: "Deployed",
      variant: "default",
      icon: <Truck className="mr-1 h-3 w-3" />,
    },
  }

  const config = statusConfig[status]

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      {config.icon}
      {config.label}
    </Badge>
  )
}
