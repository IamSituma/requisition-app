import type { Requisition, RequisitionStatus, User } from "./types"

interface EmailNotification {
  to: string
  subject: string
  body: string
  requisitionId: string
  stage: RequisitionStatus
}

// Email templates for each stage
const emailTemplates = {
  pending: (req: Requisition, recipient: User) => ({
    subject: `New Requisition ${req.id} Submitted`,
    body: `
Hello ${recipient.name},

A new requisition has been submitted:

Requisition ID: ${req.id}
Requester: ${req.requesterName}
Router Type: ${req.routerType}
Quantity: ${req.quantity}
Site: ${req.siteName}
Reason: ${req.reason}

Please review this requisition in your dashboard.

Best regards,
Requisition Management System
    `,
  }),

  pricing_needed: (req: Requisition, recipient: User) => ({
    subject: `Pricing Required for Requisition ${req.id}`,
    body: `
Hello ${recipient.name},

Requisition ${req.id} requires pricing information:

Router Type: ${req.routerType}
Quantity: ${req.quantity}
Site: ${req.siteName}
Requester: ${req.requesterName}

Please provide pricing details in your dashboard.

Best regards,
Requisition Management System
    `,
  }),

  pricing_received: (req: Requisition, recipient: User) => ({
    subject: `Pricing Received for Requisition ${req.id}`,
    body: `
Hello ${recipient.name},

Pricing has been received for requisition ${req.id}:

Router Type: ${req.routerType}
Quantity: ${req.quantity}
Unit Price: $${req.pricing?.toLocaleString() || "N/A"}
Total Cost: $${req.pricing ? (req.pricing * req.quantity).toLocaleString() : "N/A"}
Requester: ${req.requesterName}

${recipient.role === "management" ? "Please review and approve/reject this requisition." : "Awaiting management approval."}

Best regards,
Requisition Management System
    `,
  }),

  approved: (req: Requisition, recipient: User) => ({
    subject: `Requisition ${req.id} Approved`,
    body: `
Hello ${recipient.name},

Requisition ${req.id} has been approved:

Router Type: ${req.routerType}
Quantity: ${req.quantity}
Total Cost: $${req.pricing ? (req.pricing * req.quantity).toLocaleString() : "N/A"}
Approved By: ${req.approvedBy || "Management"}

${recipient.role === "accounts" ? "Please process payment for this requisition." : "Payment processing will begin shortly."}

Best regards,
Requisition Management System
    `,
  }),

  rejected: (req: Requisition, recipient: User) => ({
    subject: `Requisition ${req.id} Rejected`,
    body: `
Hello ${recipient.name},

Unfortunately, requisition ${req.id} has been rejected:

Router Type: ${req.routerType}
Quantity: ${req.quantity}
Reason for Rejection: ${req.rejectionReason || "Not specified"}

Please contact management if you have questions.

Best regards,
Requisition Management System
    `,
  }),

  paid: (req: Requisition, recipient: User) => ({
    subject: `Payment Processed for Requisition ${req.id}`,
    body: `
Hello ${recipient.name},

Payment has been processed for requisition ${req.id}:

Router Type: ${req.routerType}
Quantity: ${req.quantity}
Amount Paid: $${req.pricing ? (req.pricing * req.quantity).toLocaleString() : "N/A"}

${recipient.role === "store_manager" ? "Please fulfill this requisition and update the status." : "The store manager will fulfill this order."}

Best regards,
Requisition Management System
    `,
  }),

  fulfilled: (req: Requisition, recipient: User) => ({
    subject: `Requisition ${req.id} Fulfilled`,
    body: `
Hello ${recipient.name},

Requisition ${req.id} has been fulfilled:

Router Type: ${req.routerType}
Quantity: ${req.quantity}
Site: ${req.siteName}

${recipient.role === "csnoc" ? "Please assign a field engineer for deployment." : "Deployment assignment is in progress."}

Best regards,
Requisition Management System
    `,
  }),

  deployed: (req: Requisition, recipient: User) => ({
    subject: `Requisition ${req.id} Deployed`,
    body: `
Hello ${recipient.name},

Requisition ${req.id} has been successfully deployed:

Router Type: ${req.routerType}
Quantity: ${req.quantity}
Site: ${req.siteName}
Deployed By: ${req.deployedBy || "Field Engineer"}

This requisition is now complete.

Best regards,
Requisition Management System
    `,
  }),
}

// Mock email sending function (in production, use Resend, SendGrid, etc.)
async function sendEmail(notification: EmailNotification): Promise<void> {
  console.log("[v0] Email Notification Sent:")
  console.log(`To: ${notification.to}`)
  console.log(`Subject: ${notification.subject}`)
  console.log(`Body: ${notification.body}`)
  console.log(`Requisition: ${notification.requisitionId}`)
  console.log(`Stage: ${notification.stage}`)
  console.log("---")

  // In production, replace with actual email service:
  // await resend.emails.send({
  //   from: 'noreply@requisition.sprintug.com',
  //   to: notification.to,
  //   subject: notification.subject,
  //   text: notification.body,
  // })
}

// Send email notifications to relevant users based on requisition stage
export async function sendRequisitionNotification(
  requisition: Requisition,
  stage: RequisitionStatus,
  recipients: User[],
): Promise<void> {
  const template = emailTemplates[stage]
  if (!template) {
    console.warn(`No email template found for stage: ${stage}`)
    return
  }

  const notifications: EmailNotification[] = recipients.map((recipient) => {
    const { subject, body } = template(requisition, recipient)
    return {
      to: recipient.email,
      subject,
      body,
      requisitionId: requisition.id,
      stage,
    }
  })

  // Send all emails in parallel
  await Promise.all(notifications.map((notification) => sendEmail(notification)))
}

// Helper to determine which users should receive notifications for each stage
export function getNotificationRecipients(
  stage: RequisitionStatus,
  requisition: Requisition,
  allUsers: User[],
): User[] {
  const recipients: User[] = []

  // Always notify the requester
  const requester = allUsers.find((u) => u.id === requisition.requesterId)
  if (requester) {
    recipients.push(requester)
  }

  // Add role-specific recipients based on stage
  switch (stage) {
    case "pending":
      // Notify store managers
      recipients.push(...allUsers.filter((u) => u.role === "store_manager"))
      break

    case "pricing_needed":
      // Notify projects team
      recipients.push(...allUsers.filter((u) => u.role === "projects"))
      break

    case "pricing_received":
      // Notify management and store manager
      recipients.push(...allUsers.filter((u) => u.role === "management" || u.role === "store_manager"))
      break

    case "approved":
      // Notify accounts team
      recipients.push(...allUsers.filter((u) => u.role === "accounts"))
      break

    case "rejected":
      // Only requester (already added)
      break

    case "paid":
      // Notify store manager
      recipients.push(...allUsers.filter((u) => u.role === "store_manager"))
      break

    case "fulfilled":
      // Notify CSNOC
      recipients.push(...allUsers.filter((u) => u.role === "csnoc"))
      break

    case "deployed":
      // Only requester (already added)
      break
  }

  // Remove duplicates
  return Array.from(new Map(recipients.map((u) => [u.id, u])).values())
}
