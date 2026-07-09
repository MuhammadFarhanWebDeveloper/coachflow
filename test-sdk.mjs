import { Resend } from "resend"
import { config } from "dotenv"
config()

const resend = new Resend(process.env.RESEND_API_KEY)

console.log("FROM env:", JSON.stringify(process.env.EMAIL_FROM))
console.log("KEY length:", process.env.RESEND_API_KEY?.length)

try {
  const result = await resend.emails.send({
    from: process.env.EMAIL_FROM || "CoachFlow <coachflow@farhantechsolutions.com>",
    to: "muhammadfarhan3789076@gmail.com",
    subject: "SDK Direct Test",
    html: "<h1>Test from SDK</h1>",
  })
  console.log("Result:", JSON.stringify(result))
} catch (e) {
  console.log("Exception:", e)
}
