"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowRight } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
  const { user, isLoading, login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [step, setStep] = useState<"email" | "verify">("email")
  const [sentCode, setSentCode] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (user && !isLoading) {
      router.push(`/dashboard/${user.role}`)
    }
  }, [user, isLoading, router])

  const handleSendCode = () => {
    setError("")
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setSentCode(code)
    setStep("verify")

    console.log(`[v0] Verification code for ${email}: ${code}`)
    alert(`Demo: Your verification code is ${code}`)
  }

  const handleVerifyCode = () => {
    setError("")
    if (verificationCode !== sentCode) {
      setError("Invalid verification code")
      return
    }
    login(email)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 bg-background">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/auth-background.jpg"
          alt="Background"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/95" />
      </div>

      {/* Content (slightly moved up) */}
      <div className="relative z-10 flex flex-col items-center -mt-10 w-full max-w-md">
        {/* Logo */}
        <div className="relative h-36 w-36 sm:h-40 sm:w-40 md:h-48 md:w-48">
          <Image src="/sprint.png" alt="Sprint UG Logo" fill className="object-contain" />
        </div>

        {/* Card slightly below logo */}
        <Card className="w-full -mt-12">
          <CardHeader className="space-y-0.5 pt-6 text-center">
            <CardTitle className="text-xl sm:text-3xl">
              {step === "email" ? "Sign in to your Account" : "Verify your email"}
            </CardTitle>
            <CardDescription className="text-sm sm:text-sm">
              {step === "email"
                ? "Enter your email address to receive a verification code"
                : `We sent a verification code to ${email}`}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {step === "email" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@sprintug.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                    className="h-12 text-base"
                  />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button
                  onClick={handleSendCode}
                  className="w-full h-12 text-white text-base flex items-center justify-center"
                  style={{ backgroundColor: "#9A2582" }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#03124D")}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#9A2582")}
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Send Verification Code
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleVerifyCode()}
                    maxLength={6}
                    className="h-12 text-base"
                  />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep("email")}
                    className="flex-1 h-12 text-base"
                    style={{ borderColor: "#9A2582", color: "#9A2582" }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#03124D")}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleVerifyCode}
                    className="flex-1 h-12 text-base"
                    style={{ backgroundColor: "#9A2582", color: "#ffffff" }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#03124D")}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#9A2582")}
                  >
                    Verify & Sign In
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </>
            )}

            <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              <p className="font-medium mb-1">Demo Mode</p>
              <p>
                In production, verification codes will be sent via email. For demo, the code is
                shown in an alert.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
