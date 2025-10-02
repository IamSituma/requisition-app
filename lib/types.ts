// User roles in the system
export type UserRole = "field_engineer" | "store_manager" | "projects" | "management" | "accounts" | "csnoc" | "admin"

// Requisition status workflow
export type RequisitionStatus =
  | "pending" // Initial submission
  | "pricing_needed" // Store Manager escalated to Projects
  | "pricing_received" // Projects returned pricing
  | "approved" // Management approved
  | "rejected" // Management rejected
  | "paid" // Accounts processed payment
  | "fulfilled" // Store Manager fulfilled
  | "deployed" // CSNOC assigned deployment

// Router types available for requisition
export type RouterType = "Cisco ISR 4000" | "Cisco ASR 1000" | "Juniper MX Series" | "Mikrotik" | "Other"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: Date
}

export interface Requisition {
  id: string
  requesterId: string
  requesterName: string
  requesterEmail: string
  routerType: RouterType
  quantity: number
  notes: string
  status: RequisitionStatus
  createdAt: Date
  updatedAt: Date

  // Pricing information (added by Projects)
  pricing?: number
  pricingNotes?: string
  pricingAddedAt?: Date
  pricingAddedBy?: string

  // Approval information (added by Management)
  approvedBy?: string
  approvedAt?: Date
  rejectionReason?: string

  // Payment information (added by Accounts)
  paidBy?: string
  paidAt?: Date
  paymentReference?: string

  // Fulfillment information (added by Store Manager)
  fulfilledBy?: string
  fulfilledAt?: Date

  // Deployment information (added by CSNOC)
  assignedEngineerId?: string
  assignedEngineerName?: string
  deployedAt?: Date
}

export interface Notification {
  id: string
  userId: string
  requisitionId: string
  message: string
  read: boolean
  createdAt: Date
  type: "info" | "success" | "warning" | "error"
}

export interface AuditLog {
  id: string
  requisitionId: string
  userId: string
  userName: string
  action: string
  previousStatus?: RequisitionStatus
  newStatus?: RequisitionStatus
  notes?: string
  createdAt: Date
}
