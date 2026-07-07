"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  ClipboardList,
  TrendingUp,
  Zap,
  Target,
  Camera,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
} from "lucide-react"
import { EmptyState } from "@/components/empty-state"

type CheckInData = {
  week: string
  date: string
  energy: number
  workoutCompletion: number
  nutritionAdherence: number
  weight: number | null
}

type ClientData = {
  id: string
  name: string
  goal: string
  compliance: number
  currentWeight: number | null
  goalWeight: number | null
  profileImage: string | null
  status: string
  createdAt: string
  checkIns: CheckInData[]
}

type Range = "all" | "3m" | "6m" | "1y"

const ranges: { label: string; value: Range }[] = [
  { label: "All Time", value: "all" },
  { label: "3 Months", value: "3m" },
  { label: "6 Months", value: "6m" },
  { label: "1 Year", value: "1y" },
]

type SortKey = "name" | "compliance" | "avgEnergy" | "avgWorkout" | "lastCheckIn"

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "var(--color-popover)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-lg)",
    color: "var(--color-popover-foreground)",
  },
}

function getDateThreshold(range: Range): Date | null {
  if (range === "all") return null
  const months = range === "3m" ? 3 : range === "6m" ? 6 : 12
  const d = new Date()
  d.setMonth(d.getMonth() - months)
  return d
}

function Avatar({ name, src }: { name: string; src: string | null }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
  if (src) return <img src={src} alt={name} className="size-8 rounded-full object-cover" />
  return (
    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
      {initials}
    </div>
  )
}

function goalProgress(current: number, goal: number, firstWeight: number | null): number {
  if (!firstWeight || firstWeight === goal) return 0
  const total = Math.abs(goal - firstWeight)
  const done = Math.abs(current - firstWeight)
  return Math.min(100, Math.round((done / total) * 100))
}

function trend(completions: number[]): "up" | "down" | "stable" {
  if (completions.length < 2) return "stable"
  const recent = completions.slice(-2)
  return recent[1] > recent[0] ? "up" : recent[1] < recent[0] ? "down" : "stable"
}

export function ProgressClient({ clients }: { clients: ClientData[] }) {
  const [range, setRange] = useState<Range>("all")
  const [sortKey, setSortKey] = useState<SortKey>("compliance")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  const threshold = getDateThreshold(range)

  const filtered = useMemo(() => {
    if (!threshold) return clients
    return clients
      .map((c) => ({
        ...c,
        checkIns: c.checkIns.filter((ci) => new Date(ci.date) >= threshold!),
      }))
      .filter((c) => c.checkIns.length > 0)
  }, [clients, threshold])

  const totalCheckIns = filtered.reduce((s, c) => s + c.checkIns.length, 0)
  const avgCompliance = filtered.length
    ? Math.round(filtered.reduce((s, c) => s + c.compliance, 0) / filtered.length)
    : 0
  const allCheckIns = filtered.flatMap((c) => c.checkIns)
  const avgEnergy = allCheckIns.length
    ? Math.round(allCheckIns.reduce((s, ci) => s + ci.energy, 0) / allCheckIns.length)
    : 0

  const weekMap = new Map<
    string,
    { energy: number[]; workout: number[]; nutrition: number[]; compliance: number[] }
  >()
  for (const c of filtered) {
    for (const ci of c.checkIns) {
      if (!weekMap.has(ci.week)) {
        weekMap.set(ci.week, { energy: [], workout: [], nutrition: [], compliance: [] })
      }
      const entry = weekMap.get(ci.week)!
      entry.energy.push(ci.energy)
      entry.workout.push(ci.workoutCompletion)
      entry.nutrition.push(ci.nutritionAdherence)
    }
  }

  const weekOrder = [...weekMap.keys()].sort((a, b) => {
    const na = parseInt(a.replace("W", "")),
      nb = parseInt(b.replace("W", ""))
    return isNaN(na) || isNaN(nb) ? a.localeCompare(b) : na - nb
  })

  const metricsTrend = weekOrder.map((w) => {
    const e = weekMap.get(w)!
    const avg = (arr: number[]) => Math.round(arr.reduce((s, v) => s + v, 0) / arr.length)
    return {
      week: w,
      energy: avg(e.energy),
      workout: avg(e.workout),
      nutrition: avg(e.nutrition),
    }
  })

  const weekComplianceMap = new Map<string, number[]>()
  for (const c of filtered) {
    for (const ci of c.checkIns) {
      if (!weekComplianceMap.has(ci.week)) weekComplianceMap.set(ci.week, [])
      weekComplianceMap.get(ci.week)!.push(c.compliance)
    }
  }
  const complianceTrend = weekOrder.map((w) => {
    const vals = weekComplianceMap.get(w)!
    return {
      week: w,
      compliance: Math.round(vals.reduce((s, v) => s + v, 0) / vals.length),
    }
  })

  const sortedByCreated = [...clients].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
  const clientGrowth: { week: string; count: number }[] = []
  const growthWeekMap = new Map<string, number>()
  for (const c of sortedByCreated) {
    const d = new Date(c.createdAt)
    const weekLabel = `W${Math.ceil((d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}`
    growthWeekMap.set(weekLabel, (growthWeekMap.get(weekLabel) || 0) + 1)
  }
  let cum = 0
  for (const [week, count] of growthWeekMap) {
    cum += count
    clientGrowth.push({ week, count: cum })
  }

  const goalClients = filtered
    .filter((c) => c.currentWeight != null && c.goalWeight != null && c.checkIns.length > 0)
    .map((c) => {
      const firstWeight = c.checkIns.find((ci) => ci.weight != null)?.weight ?? null
      return {
        ...c,
        progress: goalProgress(c.currentWeight!, c.goalWeight!, firstWeight),
        firstWeight,
      }
    })
    .sort((a, b) => b.progress - a.progress)

  const metrics = [
    { label: "Total Clients", value: filtered.length, icon: Users },
    { label: "Total Check-ins", value: totalCheckIns, icon: ClipboardList },
    { label: "Avg Compliance", value: `${avgCompliance}%`, icon: TrendingUp },
    { label: "Avg Energy", value: `${avgEnergy}/10`, icon: Zap },
  ] as const

  const sortedClients = [...filtered]
    .map((c) => {
      const avgE = c.checkIns.length
        ? Math.round(c.checkIns.reduce((s, ci) => s + ci.energy, 0) / c.checkIns.length)
        : 0
      const avgW = c.checkIns.length
        ? Math.round(c.checkIns.reduce((s, ci) => s + ci.workoutCompletion, 0) / c.checkIns.length)
        : 0
      const lastDate = c.checkIns.length > 0 ? c.checkIns[0].date : null
      const completions = c.checkIns.map((ci) => ci.workoutCompletion)
      return { ...c, avgEnergy: avgE, avgWorkout: avgW, lastCheckIn: lastDate, completions }
    })
    .sort((a, b) => {
      const dir = sortDir === "desc" ? -1 : 1
      if (sortKey === "name") return dir * a.name.localeCompare(b.name)
      if (sortKey === "avgEnergy") return dir * (a.avgEnergy - b.avgEnergy)
      if (sortKey === "avgWorkout") return dir * (a.avgWorkout - b.avgWorkout)
      if (sortKey === "lastCheckIn") {
        if (!a.lastCheckIn && !b.lastCheckIn) return 0
        if (!a.lastCheckIn) return 1
        if (!b.lastCheckIn) return -1
        return dir * (new Date(a.lastCheckIn).getTime() - new Date(b.lastCheckIn).getTime())
      }
      return dir * (a.compliance - b.compliance)
    })

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "desc" ? "asc" : "desc"))
    else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  function SortableHeader({
    label,
    sortKey: key,
  }: {
    label: string
    sortKey: SortKey
  }) {
    const active = sortKey === key
    return (
      <th
        className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground select-none"
        onClick={() => toggleSort(key)}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          {active && (sortDir === "desc" ? <ArrowDown className="size-3" /> : <ArrowUp className="size-3" />)}
        </span>
      </th>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Overall Progress</h1>
          <p className="text-muted-foreground mt-2">
            View all-time progress trends across your coaching practice
          </p>
        </div>
        <div className="flex gap-2">
          {ranges.map((r) => (
            <Button
              key={r.value}
              variant={range === r.value ? "default" : "outline"}
              size="sm"
              onClick={() => setRange(r.value)}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {metrics.map((m) => {
          const Icon = m.icon
          return (
            <Card key={m.label}>
              <CardContent className="flex items-start justify-between pt-6">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{m.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{m.value}</p>
                </div>
                <div className="rounded-lg bg-primary/10 p-2">
                  <Icon className="size-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader><CardTitle>Compliance Trend</CardTitle></CardHeader>
          <CardContent>
            {complianceTrend.length > 1 ? (
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={complianceTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="week" stroke="var(--color-muted-foreground)" />
                    <YAxis stroke="var(--color-muted-foreground)" domain={[0, 100]} />
                    <Tooltip {...tooltipStyle} />
                    <Line type="monotone" dataKey="compliance" stroke="var(--color-chart-1)" strokeWidth={2} dot={{ fill: "var(--color-chart-1)", r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-16">Not enough data to show compliance trend</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Average Metrics</CardTitle></CardHeader>
          <CardContent>
            {metricsTrend.length > 1 ? (
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metricsTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="week" stroke="var(--color-muted-foreground)" />
                    <YAxis stroke="var(--color-muted-foreground)" domain={[0, 100]} />
                    <Tooltip {...tooltipStyle} />
                    <Line type="monotone" dataKey="workout" stroke="var(--color-chart-1)" strokeWidth={2} name="Workout %" dot={false} />
                    <Line type="monotone" dataKey="nutrition" stroke="var(--color-chart-2)" strokeWidth={2} name="Nutrition %" dot={false} />
                    <Line type="monotone" dataKey="energy" stroke="var(--color-chart-3)" strokeWidth={2} name="Energy (×10)" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-16">Not enough data to show metric trends</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader><CardTitle>Client Growth</CardTitle></CardHeader>
        <CardContent>
          {clientGrowth.length > 1 ? (
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={clientGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="week" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip {...tooltipStyle} />
                  <Area type="monotone" dataKey="count" stroke="var(--color-chart-4)" fill="var(--color-chart-4)" fillOpacity={0.15} strokeWidth={2} name="Clients" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-16">Not enough data to show growth trend</p>
          )}
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="size-4" />
            Goal Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          {goalClients.length > 0 ? (
            <div className="space-y-4">
              {goalClients.slice(0, 8).map((c) => (
                <div key={c.id} className="flex items-center gap-4">
                  <Avatar name={c.name} src={c.profileImage} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                      <p className="text-sm text-muted-foreground shrink-0 ml-2">
                        {c.currentWeight} → {c.goalWeight} kg
                      </p>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full">
                      <div
                        className="h-full rounded-full bg-chart-1 transition-all"
                        style={{ width: `${c.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.progress}% toward goal</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Target}
              title="No goal data"
              description="Client weight and goal data will appear here once check-ins are submitted."
            />
          )}
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-4" />
            Client Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {sortedClients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Client</th>
                    <SortableHeader label="Compliance" sortKey="compliance" />
                    <SortableHeader label="Avg Energy" sortKey="avgEnergy" />
                    <SortableHeader label="Avg Workout" sortKey="avgWorkout" />
                    <SortableHeader label="Last Check-in" sortKey="lastCheckIn" />
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trend</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Profile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sortedClients.map((c) => {
                    const t = trend(c.completions)
                    return (
                      <tr key={c.id} className="hover:bg-muted/50 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={c.name} src={c.profileImage} />
                            <span className="font-medium text-foreground text-sm">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-foreground">{c.compliance}%</span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{c.avgEnergy}/10</td>
                        <td className="px-4 py-3 text-muted-foreground">{c.avgWorkout}%</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {c.lastCheckIn ? new Date(c.lastCheckIn).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-4 py-3">
                          {t === "up" ? (
                            <ArrowUp className="size-4 text-chart-1" />
                          ) : t === "down" ? (
                            <ArrowDown className="size-4 text-destructive" />
                          ) : (
                            <Minus className="size-4 text-muted-foreground" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/clients/${c.id}`}>
                              <Eye className="size-4" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6">
              <EmptyState
                icon={Users}
                title="No client data"
                description="Client data will appear here once check-ins are submitted."
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="size-4" />
            Progress Photos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
            <Camera className="size-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Progress Photos Coming Soon</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Clients will be able to upload progress photos during check-ins. You&apos;ll be able to view them here side-by-side to track visual changes over time.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
