"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Requisition, Notification, RequisitionStatus } from "./types"
import { mockRequisitions, mockNotifications, mockUsers } from "./mock-data"
import { useAuth } from "./auth-context"
import { sendRequisitionNotification, getNotificationRecipients } from "./email-service"

interface RequisitionContextType {
  requisitions: Requisition[]
  notifications: Notification[]
  createRequisition: (
    data: Omit<Requisition, "id" | "createdAt" | "updatedAt" | "requesterId" | "requesterName" | "requesterEmail">,
  ) => void
  updateRequisitionStatus: (id: string, status: RequisitionStatus, updates?: Partial<Requisition>) => void
  markNotificationRead: (id: string) => void
  getRequisitionById: (id: string) => Requisition | undefined
}

const RequisitionContext = createContext<RequisitionContextType | undefined>(undefined)

export function RequisitionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [requisitions, setRequisitions] = useState<Requisition[]>(mockRequisitions)
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)

  const createRequisition = (
    data: Omit<Requisition, "id" | "createdAt" | "updatedAt" | "requesterId" | "requesterName" | "requesterEmail">,
  ) => {
    if (!user) return

    const newRequisition: Requisition = {
      ...data,
      id: `REQ-${String(requisitions.length + 1).padStart(3, "0")}`,
      requesterId: user.id,
      requesterName: user.name,
      requesterEmail: user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setRequisitions((prev) => [newRequisition, ...prev])

    createNotification("2", newRequisition.id, `New requisition ${newRequisition.id} submitted by ${user.name}`, "info")

    const recipients = getNotificationRecipients("pending", newRequisition, mockUsers)
    sendRequisitionNotification(newRequisition, "pending", recipients)
  }

  const updateRequisitionStatus = (id: string, status: RequisitionStatus, updates?: Partial<Requisition>) => {
    setRequisitions((prev) =>
      prev.map((req) => {
        if (req.id === id) {
          const updated = {
            ...req,
            status,
            updatedAt: new Date(),
            ...updates,
          }

          // Notify requester of status change
          createNotification(
            req.requesterId,
            id,
            `Requisition ${id} status updated to ${status.replace("_", " ")}`,
            "info",
          )

          const recipients = getNotificationRecipients(status, updated, mockUsers)
          sendRequisitionNotification(updated, status, recipients)

          // Additional role-specific notifications
          if (status === "pricing_needed") {
            // Notify Projects team
            createNotification("3", id, `Requisition ${id} needs pricing`, "info")
          } else if (status === "pricing_received") {
            // Notify Management
            createNotification("4", id, `Requisition ${id} has received pricing and awaits approval`, "info")
            // Notify Store Manager
            createNotification("2", id, `Pricing received for requisition ${id}`, "info")
          } else if (status === "approved") {
            // Notify Accounts
            createNotification("5", id, `Requisition ${id} approved and ready for payment`, "success")
          } else if (status === "rejected") {
            // Notify Store Manager
            createNotification("2", id, `Requisition ${id} was rejected`, "warning")
          } else if (status === "paid") {
            // Notify Store Manager to fulfill
            createNotification("2", id, `Requisition ${id} has been paid and is ready to fulfill`, "success")
          } else if (status === "fulfilled") {
            // Notify CSNOC for deployment
            createNotification("6", id, `Requisition ${id} fulfilled and ready for deployment assignment`, "info")
          } else if (status === "deployed") {
            // Final notification to requester
            createNotification(req.requesterId, id, `Requisition ${id} has been deployed`, "success")
          }

          return updated
        }
        return req
      }),
    )
  }

  const createNotification = (userId: string, requisitionId: string, message: string, type: Notification["type"]) => {
    const newNotification: Notification = {
      id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      requisitionId,
      message,
      read: false,
      createdAt: new Date(),
      type,
    }
    setNotifications((prev) => [newNotification, ...prev])
  }

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const getRequisitionById = (id: string) => {
    return requisitions.find((req) => req.id === id)
  }

  return (
    <RequisitionContext.Provider
      value={{
        requisitions,
        notifications,
        createRequisition,
        updateRequisitionStatus,
        markNotificationRead,
        getRequisitionById,
      }}
    >
      {children}
    </RequisitionContext.Provider>
  )
}

export function useRequisitions() {
  const context = useContext(RequisitionContext)
  if (context === undefined) {
    throw new Error("useRequisitions must be used within a RequisitionProvider")
  }
  return context
}
