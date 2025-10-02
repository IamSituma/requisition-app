"use client"

import { useAuth } from "@/lib/auth-context"
import { useRequisitions } from "@/lib/requisition-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Package, ArrowLeft, CheckCheck, Bell } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function NotificationsPage() {
  const { user } = useAuth()
  const { notifications, markNotificationRead } = useRequisitions()
  const router = useRouter()

  const userNotifications = notifications.filter((n) => n.userId === user?.id)
  const unreadNotifications = userNotifications.filter((n) => !n.read)
  const readNotifications = userNotifications.filter((n) => n.read)

  const handleMarkAsRead = (id: string) => {
    markNotificationRead(id)
  }

  const handleMarkAllAsRead = () => {
    unreadNotifications.forEach((n) => markNotificationRead(n.id))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-500/10 text-green-500"
      case "warning":
        return "bg-yellow-500/10 text-yellow-500"
      case "error":
        return "bg-red-500/10 text-red-500"
      default:
        return "bg-blue-500/10 text-blue-500"
    }
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
              <h1 className="text-lg font-semibold text-foreground">Notifications</h1>
              <p className="text-xs text-muted-foreground">{unreadNotifications.length} unread</p>
            </div>
          </div>

          {unreadNotifications.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark All as Read
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-4xl p-6">
        <Tabs defaultValue="unread" className="space-y-4">
          <TabsList>
            <TabsTrigger value="unread">Unread ({unreadNotifications.length})</TabsTrigger>
            <TabsTrigger value="all">All ({userNotifications.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="unread" className="space-y-3">
            {unreadNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold text-foreground">No unread notifications</h3>
                  <p className="text-sm text-muted-foreground">You're all caught up!</p>
                </CardContent>
              </Card>
            ) : (
              unreadNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${getNotificationIcon(notification.type)}`}
                      >
                        <Bell className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-foreground leading-relaxed">{notification.message}</p>
                          <Badge variant="secondary" className="shrink-0">
                            New
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                          </p>
                          <span className="text-xs text-muted-foreground">•</span>
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/requisition/${notification.requisitionId}`)
                            }}
                          >
                            View Requisition
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-3">
            {userNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold text-foreground">No notifications</h3>
                  <p className="text-sm text-muted-foreground">You don't have any notifications yet</p>
                </CardContent>
              </Card>
            ) : (
              userNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`transition-shadow ${notification.read ? "opacity-60" : "hover:shadow-md"}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${getNotificationIcon(notification.type)}`}
                      >
                        <Bell className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-foreground leading-relaxed">{notification.message}</p>
                          {!notification.read && (
                            <Badge variant="secondary" className="shrink-0">
                              New
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                          </p>
                          <span className="text-xs text-muted-foreground">•</span>
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={() => router.push(`/requisition/${notification.requisitionId}`)}
                          >
                            View Requisition
                          </Button>
                        </div>
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
