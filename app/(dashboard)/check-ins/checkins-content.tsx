"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { MessageSquare, Send, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/empty-state"
import { Pagination } from "@/components/pagination"
import { addFeedback } from "@/lib/actions"

type CheckInRow = {
  id: string
  clientId: string
  clientName: string
  clientImage: string | null
  week: string
  date: string
  weight: number | null
  energy: number
  mood: string
  workoutCompletion: number
  nutritionAdherence: number
  notes: string | null
  coachFeedback: string | null
}

export function CheckInsContent({
  checkIns,
  page,
  total,
  pageSize,
}: {
  checkIns: CheckInRow[]
  page: number
  total: number
  pageSize: number
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [feedbackText, setFeedbackText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({})

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(p))
    router.push(`/check-ins?${params.toString()}`)
  }

  async function handleSubmit(clientId: string) {
    if (!feedbackText.trim() || submitting) return
    setSubmitting(true)
    const result = await addFeedback(clientId, feedbackText.trim())
    setSubmitting(false)
    if (result.success) {
      setFeedbackText("")
      setReviewingId(null)
    }
  }

  if (checkIns.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-8">Weekly Check-ins</h1>
        <EmptyState
          icon={ClipboardList}
          title="No check-ins yet"
          description="Check-ins submitted by your clients will appear here."
        />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Weekly Check-ins</h1>
        <p className="text-muted-foreground mt-2">{total} total check-ins</p>
      </div>

      <div className="grid gap-6">
        {checkIns.map((ci) => (
          <Card key={ci.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar name={ci.clientName} src={ci.clientImage} />
                  <div>
                    <h3 className="font-semibold text-foreground">{ci.clientName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {ci.week} &mdash; {new Date(ci.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {!feedbackMap[ci.id] && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setReviewingId(reviewingId === ci.id ? null : ci.id)}
                  >
                    <MessageSquare className="size-4" />
                    {reviewingId === ci.id ? "Cancel" : "Review"}
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4 mb-4">
                <Metric label="Weight" value={ci.weight != null ? `${ci.weight} kg` : "-"} />
                <Metric label="Energy" value={`${ci.energy}/10`} />
                <Metric label="Workout %" value={`${ci.workoutCompletion}%`} />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <Metric label="Nutrition %" value={`${ci.nutritionAdherence}%`} />
                <Metric label="Mood" value={ci.mood} capitalize />
              </div>

              {ci.notes && (
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">Client Notes</p>
                  <p className="text-sm text-foreground">{ci.notes}</p>
                </div>
              )}

              {feedbackMap[ci.id] && (
                <div className="bg-primary/10 rounded-lg p-4 mb-4">
                  <p className="text-xs text-primary font-semibold mb-1">Your Feedback</p>
                  <p className="text-sm text-foreground">{feedbackMap[ci.id]}</p>
                </div>
              )}

              {reviewingId === ci.id && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Leave coach feedback for this check-in..."
                    className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground text-sm"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-3">
                    <Button onClick={() => handleSubmit(ci.clientId)} disabled={!feedbackText.trim() || submitting} size="sm">
                      <Send className="size-4" />
                      {submitting ? "Sending..." : "Send Feedback"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setReviewingId(null); setFeedbackText("") }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Pagination
        page={page}
        totalPages={Math.ceil(total / pageSize)}
        total={total}
        onPageChange={goToPage}
      />
    </div>
  )
}

function Avatar({ name, src }: { name: string; src: string | null }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
  if (src) {
    return <img src={src} alt={name} className="size-12 rounded-full object-cover" />
  }
  return (
    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
      {initials}
    </div>
  )
}

function Metric({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`font-semibold text-foreground ${capitalize ? "capitalize" : ""}`}>{value}</p>
    </div>
  )
}
