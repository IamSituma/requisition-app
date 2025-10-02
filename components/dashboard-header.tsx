"use client"

import { useAuth } from "@/lib/auth-context"
import { useRequisitions } from "@/lib/requisition-context"
import { Button } from "@/components/ui/button"
import { Shield, FileText, Bell, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface DashboardHeaderProps {
  title: string
  subtitle: string
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const { user, logout } = useAuth()
  const { notifications } = useRequisitions()
  const router = useRouter()

  const unreadNotifications = notifications.filter((n) => n.userId === user?.id && !n.read)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left: Logo + Titles */}
        <div className="flex items-center gap-4">
          <div className="relative h-30 w-30">
            <Image src="/sprint.png" alt="Sprint UG Logo" fill className="object-contain" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        {/* Right: Buttons + User Info */}
        <div className="flex items-center gap-3">
          {user?.role === "admin" && (
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/admin")}>
              <Shield className="mr-2 h-4 w-4" />
              Admin
            </Button>
          )}

          <Button variant="ghost" size="sm" onClick={() => router.push("/reports")}>
            <FileText className="mr-2 h-4 w-4" />
            Reports
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => router.push("/notifications")}
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                {unreadNotifications.length}
              </span>
            )}
          </Button>

          {/* User Info */}
          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {user?.role?.replace("_", " ") || "Role"}
              </p>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  )
}
