import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getUserWithClients, getOverdueClients } from "@/lib/queries"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, AlertCircle, CheckCircle2, TrendingUp, Circle } from "lucide-react"
import { CheckinRateChart, ProgressChart } from "./dashboard-charts"
import { PendingCheckinsWidget } from "@/components/pending-checkins-widget"

function relativeTime(date: Date) {
  const diff = Date.now() - date.getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

export default async function CoachDashboard() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await getUserWithClients(userId)

  if (!user) redirect("/sign-in")

  const clients = user.clients
  const total = clients.length

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const completedThisWeek = clients.filter((c) => c.checkIns.length > 0 && c.checkIns[0].date >= weekAgo).length
  const pending = total - completedThisWeek
  const avgCompliance = total ? Math.round(clients.reduce((s, c) => s + c.compliance, 0) / total) : 0

  const weekMap = new Map<string, Set<string>>()
  for (const c of clients)
    for (const ci of c.checkIns) {
      if (!weekMap.has(ci.week)) weekMap.set(ci.week, new Set())
      weekMap.get(ci.week)!.add(c.id)
    }

  const weekOrder = [...weekMap.keys()].sort((a, b) => {
    const na = parseInt(a.replace("W", "")), nb = parseInt(b.replace("W", ""))
    return isNaN(na) || isNaN(nb) ? a.localeCompare(b) : na - nb
  })

  const weeklyCheckInData = weekOrder.map((w) => ({
    week: w,
    rate: total ? Math.round((weekMap.get(w)!.size / total) * 100) : 0,
  }))

  const clientProgressData = clients.slice(0, 8).map((c) => ({
    name: c.name.split(" ")[0],
    progress: c.compliance,
  }))

  const recentCheckIns = clients
    .flatMap((c) => c.checkIns.map((ci) => ({ date: ci.date, clientName: c.name })))
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 8)

  const overdueClients = await getOverdueClients(userId)

  const metrics = [
    { label: "Total Clients", value: total, icon: Users, active: false },
    { label: "Pending Check-ins", value: pending, icon: AlertCircle, active: true },
    { label: "Completed This Week", value: completedThisWeek, icon: CheckCircle2, active: false },
    { label: "Avg Compliance", value: `${avgCompliance}%`, icon: TrendingUp, active: false },
  ] as const

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {user.name.split(" ")[0]}</h1>
        <p className="text-muted-foreground mt-2">Here&apos;s your coaching dashboard overview</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {metrics.map((m) => {
          const Icon = m.icon
          return (
            <Card key={m.label}>
              <CardContent className="flex items-start justify-between pt-6">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{m.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${m.active ? "text-destructive" : "text-foreground"}`}>
                    {m.value}
                  </p>
                </div>
                <div className="rounded-lg bg-primary/10 p-2">
                  <Icon className="size-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Check-in Rate</CardTitle>
            </CardHeader>
            <CardContent>
              {weeklyCheckInData.length > 0 ? (
                <CheckinRateChart data={weeklyCheckInData} />
              ) : (
                <p className="text-muted-foreground text-center py-12">No check-in data yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Client Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              {clientProgressData.length > 0 ? (
                <ProgressChart data={clientProgressData} />
              ) : (
                <p className="text-muted-foreground text-center py-12">No clients yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentCheckIns.length > 0 ? (
              <div className="space-y-4">
                {recentCheckIns.map((a, i) => (
                  <div key={i} className="pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="flex gap-3">
                      <Circle size={8} fill="currentColor" className="mt-2 shrink-0 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm text-foreground">
                          <span className="font-semibold">{a.clientName}</span> submitted a check-in
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{relativeTime(a.date)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Check-ins</CardTitle>
          <CardAction>
            <Button variant="link" asChild>
              <Link href="/clients">View all</Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <PendingCheckinsWidget clients={overdueClients.map((c) => ({
            id: c.id,
            name: c.name,
            goal: c.goal,
            lastCheckIn: c.lastCheckIn?.toISOString() ?? null,
            lastRemindedAt: c.lastRemindedAt?.toISOString() ?? null,
            status: c.status,
          }))} />
        </CardContent>
      </Card>
    </div>
  )
}
