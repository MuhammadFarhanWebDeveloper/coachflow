"use server"

import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"
import { sendEmail } from "@/lib/email"

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function addClient(data: {
  name: string
  goal: string
  email?: string | null
  currentWeight?: number | null
  goalWeight?: number | null
}): Promise<ActionResult<{ id: string }>> {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: "Unauthorized" }

    if (!data.name?.trim() || !data.goal?.trim()) {
      return { success: false, error: "Name and goal are required" }
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) return { success: false, error: "User not found" }

    const client = await prisma.client.create({
      data: {
        coachId: user.id,
        name: data.name.trim(),
        goal: data.goal.trim(),
        email: data.email?.trim() || null,
        currentWeight: data.currentWeight ?? null,
        goalWeight: data.goalWeight ?? null,
        profileImage: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(data.name.trim())}`,
      },
    })

    revalidatePath("/clients")
    return { success: true, data: { id: client.id } }
  } catch {
    return { success: false, error: "Failed to create client" }
  }
}

export async function updateClient(
  clientId: string,
  data: {
    name: string
    email?: string | null
    goal: string
    currentWeight?: number | null
    goalWeight?: number | null
  }
): Promise<ActionResult<undefined>> {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: "Unauthorized" }

    if (!data.name?.trim() || !data.goal?.trim()) {
      return { success: false, error: "Name and goal are required" }
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) return { success: false, error: "User not found" }

    const client = await prisma.client.findFirst({
      where: { id: clientId, coachId: user.id },
    })
    if (!client) return { success: false, error: "Client not found" }

    await prisma.client.update({
      where: { id: clientId },
      data: {
        name: data.name.trim(),
        email: data.email?.trim() || null,
        goal: data.goal.trim(),
        currentWeight: data.currentWeight ?? null,
        goalWeight: data.goalWeight ?? null,
      },
    })

    revalidatePath("/clients")
    revalidatePath(`/clients/${clientId}`)
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Failed to update client" }
  }
}

export async function deleteClient(
  clientId: string
): Promise<ActionResult<undefined>> {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: "Unauthorized" }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) return { success: false, error: "User not found" }

    const client = await prisma.client.findFirst({
      where: { id: clientId, coachId: user.id },
    })
    if (!client) return { success: false, error: "Client not found" }

    await prisma.client.delete({ where: { id: clientId } })

    revalidatePath("/clients")
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Failed to delete client" }
  }
}

export async function addFeedback(
  clientId: string,
  content: string
): Promise<
  ActionResult<{ id: string; content: string; createdAt: string; coachName: string }>
> {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: "Unauthorized" }

    if (!content?.trim()) {
      return { success: false, error: "Content is required" }
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) return { success: false, error: "User not found" }

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true, coachId: true, email: true, name: true },
    })
    if (!client || client.coachId !== user.id) {
      return { success: false, error: "Client not found" }
    }

    const feedback = await prisma.feedback.create({
      data: { clientId, coachId: user.id, content: content.trim() },
    })

    if (client.email) {
      await sendEmail({
        to: client.email,
        subject: `${user.name || "Your coach"} left you feedback on CoachFlow`,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px">
            <div style="text-align:center;margin-bottom:24px">
              <span style="font-size:32px;font-weight:700;color:#10b981">CoachFlow</span>
            </div>
            <h1 style="font-size:22px;font-weight:600;color:#111;margin-bottom:8px">Hi ${client.name},</h1>
            <p style="font-size:15px;line-height:1.6;color:#374151;margin-bottom:16px">
              Your coach <strong>${user.name || "Your coach"}</strong> has left you some feedback:
            </p>
            <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin-bottom:24px">
              <p style="font-size:15px;line-height:1.6;color:#374151;margin:0">${feedback.content}</p>
            </div>
            <p style="font-size:13px;color:#9ca3af;text-align:center">
              Keep up the great work on your journey!
            </p>
          </div>
        `.trim(),
      })
    }

    revalidatePath(`/clients/${clientId}`)
    return {
      success: true,
      data: {
        id: feedback.id,
        content: feedback.content,
        createdAt: feedback.createdAt.toISOString(),
        coachName: "You",
      },
    }
  } catch {
    return { success: false, error: "Failed to send feedback" }
  }
}

export async function generateCheckInToken(
  clientId: string
): Promise<ActionResult<{ token: string; link: string }>> {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: "Unauthorized" }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) return { success: false, error: "User not found" }

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true, coachId: true, token: true },
    })
    if (!client || client.coachId !== user.id) {
      return { success: false, error: "Client not found" }
    }

    const token = client.token || randomUUID()
    if (!client.token) {
      await prisma.client.update({
        where: { id: clientId },
        data: { token },
      })
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    return { success: true, data: { token, link: `${origin}/check-in/${token}` } }
  } catch {
    return { success: false, error: "Failed to generate check-in link" }
  }
}

export async function submitCheckIn(
  token: string,
  data: {
    weight?: number | null
    energy: number
    mood: "happy" | "neutral" | "tired" | "stressed" | "motivated"
    workoutCompletion: number
    nutritionAdherence: number
    waist?: number | null
    chest?: number | null
    arms?: number | null
    notes?: string | null
  }
): Promise<ActionResult<undefined>> {
  try {
    if (!token?.trim()) return { success: false, error: "Invalid check-in link" }

    const client = await prisma.client.findUnique({
      where: { token },
      select: { id: true },
    })
    if (!client) return { success: false, error: "Invalid check-in link" }

    const week = new Date().toISOString().slice(0, 7)

    await prisma.checkIn.create({
      data: {
        clientId: client.id,
        week,
        date: new Date(),
        weight: data.weight ?? null,
        energy: data.energy,
        mood: data.mood,
        workoutCompletion: data.workoutCompletion,
        nutritionAdherence: data.nutritionAdherence,
        waist: data.waist ?? null,
        chest: data.chest ?? null,
        arms: data.arms ?? null,
        notes: data.notes ?? null,
      },
    })

    await prisma.client.update({
      where: { id: client.id },
      data: { lastCheckIn: new Date() },
    })

    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Failed to submit check-in" }
  }
}

export async function sendReminder(
  clientId: string
): Promise<ActionResult<{ remindedAt: string }>> {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: "Unauthorized" }

    const client = await prisma.client.findFirst({
      where: { id: clientId, coach: { clerkId: userId } },
      select: {
        id: true,
        name: true,
        email: true,
        goal: true,
        token: true,
        lastCheckIn: true,
        lastRemindedAt: true,
        coach: { select: { name: true } },
      },
    })
    if (!client) return { success: false, error: "Client not found" }

    const cooldown = 24 * 60 * 60 * 1000
    if (client.lastRemindedAt && Date.now() - client.lastRemindedAt.getTime() < cooldown) {
      return { success: false, error: "Already reminded within the last 24 hours" }
    }

    if (!client.email) {
      return { success: false, error: "Client has no email configured" }
    }

    let token = client.token
    if (!token) {
      token = randomUUID()
      await prisma.client.update({
        where: { id: clientId },
        data: { token },
      })
    }

    const daysOverdue = client.lastCheckIn
      ? Math.floor((Date.now() - client.lastCheckIn.getTime()) / (24 * 60 * 60 * 1000))
      : 0

    const checkInUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/check-in/${token}`

    const daysLabel = daysOverdue > 0
      ? ` It's been ${daysOverdue} day${daysOverdue > 1 ? "s" : ""} since your last check-in.`
      : ""

    const result = await sendEmail({
      to: client.email,
      subject: `Reminder from ${client.coach.name} — Submit your check-in`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px">
          <div style="text-align:center;margin-bottom:24px">
            <span style="font-size:32px;font-weight:700;color:#10b981">CoachFlow</span>
          </div>
          <h1 style="font-size:22px;font-weight:600;color:#111;margin-bottom:8px">Hi ${client.name},</h1>
          <p style="font-size:15px;line-height:1.6;color:#374151;margin-bottom:16px">
            Your coach <strong>${client.coach.name || "Your coach"}</strong> wanted to check in on your progress.${daysLabel}
          </p>
          ${client.goal ? `<p style="font-size:15px;line-height:1.6;color:#374151;margin-bottom:16px">Remember your goal: <strong>${client.goal}</strong></p>` : ""}
          <p style="font-size:15px;line-height:1.6;color:#374151;margin-bottom:24px">
            Take a few minutes to submit your weekly check-in so your coach can track your progress and adjust your plan.
          </p>
          <div style="text-align:center;margin-bottom:24px">
            <a href="${checkInUrl}" style="display:inline-block;padding:12px 32px;font-size:15px;font-weight:600;color:#fff;background-color:#10b981;border-radius:8px;text-decoration:none">
              Submit Check-in
            </a>
          </div>
          <p style="font-size:13px;color:#9ca3af;text-align:center">If the button above doesn't work, copy this URL into your browser:</p>
          <p style="font-size:13px;color:#6b7280;text-align:center;word-break:break-all">${checkInUrl}</p>
        </div>
      `.trim(),
    })

    if (!result.success) {
      return { success: false, error: result.error }
    }

    const updated = await prisma.client.update({
      where: { id: clientId },
      data: { lastRemindedAt: new Date() },
      select: { lastRemindedAt: true },
    })

    revalidatePath("/dashboard")
    return { success: true, data: { remindedAt: updated.lastRemindedAt!.toISOString() } }
  } catch {
    return { success: false, error: "Failed to send reminder" }
  }
}
