import * as React from "react"

interface CheckInReminderEmailProps {
  clientName: string
  coachName: string
  goal: string
  daysOverdue: number
  checkInUrl: string
}

export function CheckInReminderEmail({
  clientName,
  coachName,
  goal,
  daysOverdue,
  checkInUrl,
}: CheckInReminderEmailProps) {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 560, margin: "0 auto", padding: 32 }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <span style={{ fontSize: 32, fontWeight: 700, color: "#10b981" }}>CoachFlow</span>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 600, color: "#111", marginBottom: 8 }}>
        Hi {clientName},
      </h1>

      <p style={{ fontSize: 15, lineHeight: "1.6", color: "#374151", marginBottom: 16 }}>
        Your coach <strong>{coachName}</strong> wanted to check in on your progress.
        {daysOverdue > 0 && ` It's been ${daysOverdue} day${daysOverdue > 1 ? "s" : ""} since your last check-in.`}
      </p>

      {goal && (
        <p style={{ fontSize: 15, lineHeight: "1.6", color: "#374151", marginBottom: 16 }}>
          Remember your goal: <strong>{goal}</strong>
        </p>
      )}

      <p style={{ fontSize: 15, lineHeight: "1.6", color: "#374151", marginBottom: 24 }}>
        Take a few minutes to submit your weekly check-in so your coach can track your progress and adjust your plan.
      </p>

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <a
          href={checkInUrl}
          style={{
            display: "inline-block",
            padding: "12px 32px",
            fontSize: 15,
            fontWeight: 600,
            color: "#fff",
            backgroundColor: "#10b981",
            borderRadius: 8,
            textDecoration: "none",
          }}
        >
          Submit Check-in
        </a>
      </div>

      <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center" }}>
        If the button above doesn&apos;t work, copy this URL into your browser:
      </p>
      <p style={{ fontSize: 13, color: "#6b7280", textAlign: "center", wordBreak: "break-all" }}>
        {checkInUrl}
      </p>
    </div>
  )
}
