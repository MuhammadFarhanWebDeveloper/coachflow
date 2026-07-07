"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertTriangle className="size-8 text-destructive" />
            </div>
          </div>
          <CardTitle>Dashboard Error</CardTitle>
          <CardDescription>
            Something went wrong loading your dashboard. This might be a temporary issue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={reset}>
            <RefreshCw className="size-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
