"use client"

import { useState } from "react"
import Link from "next/link"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts"
import { ArrowLeft, MessageSquare, Plus, Send, ClipboardList, LineChart as LineChartIcon, MessageCircle, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/empty-state"
import { addFeedback, generateCheckInToken } from "@/lib/actions"

type CheckInData = {
  id: string
  week: string
  date: string
  weight: number | null
  energy: number
  mood: string
  workoutCompletion: number
  nutritionAdherence: number
  waist: number | null
  chest: number | null
  arms: number | null
  notes: string | null
  coachFeedback: string | null
}

export type FeedbackData = {
  id: string
  content: string
  createdAt: string
  coachName: string
}

type ClientData = {
  id: string
  name: string
  goal: string
  currentWeight: number | null
  goalWeight: number | null
  compliance: number
  status: string
  memberSince: string
  profileImage: string | null
  checkIns: CheckInData[]
  feedback: FeedbackData[]
}

type Tab = "overview" | "progress" | "checkins" | "notes"

const tabs: Tab[] = ["overview", "progress", "checkins", "notes"]

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "var(--color-popover)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-lg)",
    color: "var(--color-popover-foreground)",
  },
}

function Avatar({ name, src, size = "md" }: { name: string; src: string | null; size?: "md" | "lg" }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
  const dims = size === "lg" ? "size-20" : "size-10"

  if (src) return <img src={src} alt={name} className={`${dims} rounded-full object-cover`} />

  return (
    <div className={`${dims} rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold text-primary`}>
      {initials}
    </div>
  )
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export function ClientProfile({ client }: { client: ClientData }) {
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const [feedback, setFeedback] = useState<FeedbackData[]>(client.feedback)
  const [shareState, setShareState] = useState<"idle" | "loading" | "copied">("idle")

  async function handleShare() {
    setShareState("loading")
    const result = await generateCheckInToken(client.id)
    if (result.success) {
      await navigator.clipboard.writeText(result.data.link)
      setShareState("copied")
      setTimeout(() => setShareState("idle"), 2000)
    } else {
      setShareState("idle")
    }
  }

  const hasMeasurements = client.checkIns.some((ci) => ci.waist != null || ci.chest != null || ci.arms != null)
  const measurementData = hasMeasurements
    ? client.checkIns
        .filter((ci) => ci.waist != null || ci.chest != null || ci.arms != null)
        .map((ci) => ({ week: ci.week, waist: ci.waist ?? 0, chest: ci.chest ?? 0, arms: ci.arms ?? 0 }))
    : []

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/clients" className="flex items-center gap-2">
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Back to Clients</span>
          </Link>
        </Button>
        <div className="ml-auto">
          <Button variant="outline" size="sm" onClick={handleShare} disabled={shareState === "loading"}>
            <Share2 className="size-4" />
            {shareState === "copied" ? "Copied!" : shareState === "loading" ? "Generating..." : "Share Check-in Link"}
          </Button>
        </div>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar name={client.name} src={client.profileImage} size="lg" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">{client.name}</h1>
                <p className="text-muted-foreground mt-1">{client.goal}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Member since {new Date(client.memberSince).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6 w-full sm:w-auto">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{client.currentWeight ?? "-"}</p>
                <p className="text-xs text-muted-foreground">Current kg</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{client.goalWeight ?? "-"}</p>
                <p className="text-xs text-muted-foreground">Goal kg</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-chart-1">{client.compliance}%</p>
                <p className="text-xs text-muted-foreground">Compliance</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 mb-6 border-b border-border bg-card rounded-t-xl px-6 pt-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 font-medium border-b-2 transition -mb-px capitalize ${
              activeTab === tab
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <Card className="rounded-t-none">
        <CardContent className="pt-6">
          {activeTab === "overview" && <OverviewTab client={client} />}
          {activeTab === "progress" && (
            <ProgressTab checkIns={client.checkIns} measurementData={measurementData} />
          )}
          {activeTab === "checkins" && <CheckInsTab checkIns={client.checkIns} />}
          {activeTab === "notes" && (
            <NotesTab
              clientId={client.id}
              feedback={feedback}
              onNewFeedback={(f) => setFeedback((prev) => [f, ...prev])}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function OverviewTab({ client }: { client: ClientData }) {
  const latest = client.checkIns[0]
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Client Information</h3>
        <div className="space-y-4">
          <InfoRow label="Goal" value={client.goal} />
          <InfoRow label="Member Since" value={new Date(client.memberSince).toLocaleDateString()} />
          <InfoRow label="Current Weight" value={`${client.currentWeight ?? "-"} kg`} />
          <InfoRow label="Goal Weight" value={`${client.goalWeight ?? "-"} kg`} />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Latest Check-in</h3>
        {latest ? (
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <InfoRow label="Date" value={new Date(latest.date).toLocaleDateString()} />
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Energy Level" value={`${latest.energy}/10`} />
              <InfoRow label="Mood" value={latest.mood} capitalize />
            </div>
            <InfoRow label="Workout Completion" value={`${latest.workoutCompletion}%`} />
            <InfoRow label="Nutrition Adherence" value={`${latest.nutritionAdherence}%`} />
            {latest.notes && <InfoRow label="Notes" value={latest.notes} />}
          </div>
        ) : (
          <EmptyState
            icon={ClipboardList}
            title="No check-ins yet"
            description="This client hasn&apos;t submitted any check-ins."
          />
        )}
      </div>
    </div>
  )
}

function ProgressTab({
  checkIns,
  measurementData,
}: {
  checkIns: CheckInData[]
  measurementData: { week: string; waist: number; chest: number; arms: number }[]
}) {
  const weightData = checkIns
    .filter((ci) => ci.weight != null)
    .reverse()
    .map((ci) => ({ week: ci.week, weight: ci.weight! }))

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Weight Progress</h3>
        {weightData.length > 1 ? (
          <div className="bg-muted rounded-lg p-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="week" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" domain={["auto", "auto"]} />
                <RechartsTooltip {...tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-chart-1)", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState
            icon={LineChartIcon}
            title="Not enough data"
            description="At least two check-ins with weight are needed to show progress."
          />
        )}
      </div>

      {measurementData.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Body Measurements</h3>
          <div className="space-y-3">
            {measurementData.map((m, idx) => (
              <div key={idx} className="bg-muted rounded-lg p-4">
                <p className="font-medium text-foreground mb-2">{m.week}</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <InfoRow label="Waist" value={`${m.waist} cm`} />
                  <InfoRow label="Chest" value={`${m.chest} cm`} />
                  <InfoRow label="Arms" value={`${m.arms} cm`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CheckInsTab({ checkIns }: { checkIns: CheckInData[] }) {
  if (checkIns.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No check-ins submitted yet"
        description="Check-ins will appear here once the client submits them."
      />
    )
  }

  return (
    <div className="space-y-4">
      {checkIns.map((ci) => (
        <div key={ci.id} className="bg-muted rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-semibold text-foreground">{ci.week}</h4>
              <p className="text-sm text-muted-foreground">{new Date(ci.date).toLocaleDateString()}</p>
            </div>
            <Button variant="ghost" size="icon-sm">
              <MessageSquare className="size-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <InfoRow label="Weight" value={`${ci.weight ?? "-"} kg`} />
            <InfoRow label="Energy" value={`${ci.energy}/10`} />
            <InfoRow label="Mood" value={ci.mood} capitalize />
            <InfoRow label="Workout %" value={`${ci.workoutCompletion}%`} />
            <InfoRow label="Nutrition %" value={`${ci.nutritionAdherence}%`} />
          </div>

          {ci.notes && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground font-semibold mb-1">Client Notes</p>
              <p className="text-sm text-foreground">{ci.notes}</p>
            </div>
          )}

          {ci.coachFeedback && (
            <div className="bg-primary/10 rounded-lg p-4">
              <p className="text-xs text-primary font-semibold mb-1">Your Feedback</p>
              <p className="text-sm text-foreground">{ci.coachFeedback}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function NotesTab({
  clientId,
  feedback,
  onNewFeedback,
}: {
  clientId: string
  feedback: FeedbackData[]
  onNewFeedback: (f: FeedbackData) => void
}) {
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function handleSubmit() {
    if (!content.trim() || submitting) return
    setSubmitting(true)
    const result = await addFeedback(clientId, content.trim())
    setSubmitting(false)
    if (result.success) {
      onNewFeedback(result.data)
      setContent("")
      setShowForm(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus className="size-4" />
          {showForm ? "Cancel" : "Leave Feedback"}
        </Button>
      </div>

      {showForm && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Leave feedback for your client..."
            className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
            rows={4}
          />
          <div className="flex gap-3 mt-4">
            <Button onClick={handleSubmit} disabled={!content.trim() || submitting}>
              <Send className="size-4" />
              {submitting ? "Sending..." : "Send Feedback"}
            </Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setContent("") }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {feedback.length > 0 ? (
        <div className="space-y-4">
          {feedback.map((f) => (
            <div key={f.id} className="bg-muted rounded-lg p-4">
              <p className="text-xs text-muted-foreground font-semibold mb-2">
                {f.coachName} &mdash; {timeAgo(f.createdAt)}
              </p>
              <p className="text-sm text-foreground">{f.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={MessageCircle}
          title="No feedback yet"
          description="Leave your first note for this client."
        />
      )}
    </div>
  )
}

function InfoRow({
  label,
  value,
  capitalize,
}: {
  label: string
  value: string | number
  capitalize?: boolean
}) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`font-medium text-foreground ${capitalize ? "capitalize" : ""}`}>
        {value}
      </p>
    </div>
  )
}
