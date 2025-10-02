import type { User, Requisition, Notification } from "./types"

// Mock users for demonstration (in production, these would come from Google Workspace)
export const mockUsers: User[] = [
  {
    id: "1",
    email: "john.doe@sprintug.com",
    name: "John Doe",
    role: "field_engineer",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    email: "jane.smith@sprintug.com",
    name: "Jane Smith",
    role: "store_manager",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "3",
    email: "bob.wilson@sprintug.com",
    name: "Bob Wilson",
    role: "projects",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "4",
    email: "alice.johnson@sprintug.com",
    name: "Alice Johnson",
    role: "management",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "5",
    email: "charlie.brown@sprintug.com",
    name: "Charlie Brown",
    role: "accounts",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "6",
    email: "diana.prince@sprintug.com",
    name: "Diana Prince",
    role: "csnoc",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "7",
    email: "admin@sprintug.com",
    name: "System Admin",
    role: "admin",
    createdAt: new Date("2024-01-01"),
  },
]

// Mock requisitions for demonstration
export const mockRequisitions: Requisition[] = [
  {
    id: "REQ-001",
    requesterId: "1",
    requesterName: "John Doe",
    requesterEmail: "john.doe@sprintug.com",
    routerType: "Cisco ISR 4000",
    quantity: 2,
    notes: "Needed for new branch office deployment",
    status: "pending",
    createdAt: new Date("2024-12-15"),
    updatedAt: new Date("2024-12-15"),
  },
  {
    id: "REQ-002",
    requesterId: "1",
    requesterName: "John Doe",
    requesterEmail: "john.doe@sprintug.com",
    routerType: "Mikrotik",
    quantity: 5,
    notes: "Replacement units for existing infrastructure",
    status: "approved",
    createdAt: new Date("2024-12-10"),
    updatedAt: new Date("2024-12-14"),
    pricing: 2500,
    pricingNotes: "Bulk discount applied",
    approvedBy: "Alice Johnson",
    approvedAt: new Date("2024-12-14"),
  },
]

export const mockNotifications: Notification[] = []
