"use client"

import { useState } from "react"
import { AlertCircle, Bell, BellOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { sendReminder } from "@/lib/actions"

type OverdueClient = {
  id: string
  name: string
  goal: string
  lastCheckIn: string | null
  lastRemindedAt: string | null
  status: string
}

function daysOverdue(lastCheckIn: string | null) {
  if (!lastCheckIn) return "No check-in yet"
  const diff = Date.now() - new Date(lastCheckIn).getTime()
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  return `${days} days ago`
}

export function PendingCheckinsWidget({ clients }: { clients: OverdueClient[] }) {
  const [reminding, setReminding] = useState<Record<string, "idle" | "loading" | "sent" | "cooldown">>({})

  async function handleRemind(clientId: string) {
    setReminding((prev) => ({ ...prev, [clientId]: "loading" }))
    const result = await sendReminder(clientId)
    setReminding((prev) => ({
      ...prev,
      [clientId]: result.success ? "sent" : "cooldown",
    }))
    setTimeout(() => {
      setReminding((prev) => ({ ...prev, [clientId]: "idle" }))
    }, 3000)
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-8">
        <BellOff className="size-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">All clients are up to date</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {clients.map((c) => {
        const state = reminding[c.id] || "idle"
        return (
          <div key={c.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-10 rounded-full bg-muted-foreground/10 flex items-center justify-center text-sm font-semibold text-muted-foreground shrink-0">
                {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">{c.name}</p>
                <p className="text-xs text-muted-foreground truncate">{c.goal}</p>
                <p className="text-xs text-destructive mt-0.5">{daysOverdue(c.lastCheckIn)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              {c.lastRemindedAt && (
                <span className="text-xs text-muted-foreground hidden sm:block">
                  Reminded {new Date(c.lastRemindedAt).toLocaleDateString()}
                </span>
              )}
              <Button
                variant={state === "sent" ? "outline" : "default"}
                size="sm"
                onClick={() => handleRemind(c.id)}
                disabled={state === "loading"}
              >
                {state === "loading" ? (
                  "Sending..."
                ) : state === "sent" ? (
                  <>
                    <Bell className="size-3" /> Sent
                  </>
                ) : state === "cooldown" ? (
                  "Try later"
                ) : (
                  <>
                    <Bell className="size-3" /> Remind
                  </>
                )}
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
