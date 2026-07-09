import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const from = process.env.EMAIL_FROM || "CoachFlow <coachflow@farhantechsolutions.com>"

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      html: `<!DOCTYPE html>${html}`,
    })

    if (error) {
      console.error("Resend error:", error)
      return { success: false, error: error.message || "Failed to send email" }
    }

    return { success: true }
  } catch (err) {
    console.error("Email send exception:", err)
    return { success: false, error: "Failed to send email" }
  }
}
