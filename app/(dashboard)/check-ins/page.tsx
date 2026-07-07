import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getAllCheckIns } from "@/lib/queries"
import { CheckInsContent } from "./checkins-content"

export default async function CheckInsPage(props: {
  searchParams: Promise<{ page?: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const sp = await props.searchParams
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1)

  const result = await getAllCheckIns(userId, page)

  const data = result.checkIns.map((ci) => ({
    id: ci.id,
    clientId: ci.clientId,
    clientName: ci.client.name,
    clientImage: ci.client.profileImage,
    week: ci.week,
    date: ci.date.toISOString(),
    weight: ci.weight,
    energy: ci.energy,
    mood: ci.mood,
    workoutCompletion: ci.workoutCompletion,
    nutritionAdherence: ci.nutritionAdherence,
    notes: ci.notes,
    coachFeedback: ci.coachFeedback,
  }))

  return (
    <CheckInsContent
      checkIns={data}
      page={result.page}
      total={result.total}
      pageSize={result.pageSize}
    />
  )
}
