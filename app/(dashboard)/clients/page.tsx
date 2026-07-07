import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getUserWithLatestCheckIn } from "@/lib/queries"
import { ClientsContent } from "./clients-content"

export default async function ClientsPage(props: {
  searchParams: Promise<{ page?: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const sp = await props.searchParams
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1)

  const result = await getUserWithLatestCheckIn(userId, page)

  if (!result) redirect("/sign-in")

  const clients = result.clients.map((c) => ({
    id: c.id,
    name: c.name,
    goal: c.goal,
    currentWeight: c.currentWeight,
    goalWeight: c.goalWeight,
    compliance: c.compliance,
    status: c.status,
    memberSince: c.memberSince.toISOString(),
    lastCheckInDate: c.checkIns[0]?.date.toISOString() ?? null,
    profileImage: c.profileImage,
  }))

  return (
    <ClientsContent
      clients={clients}
      page={result.page}
      total={result.total}
      pageSize={result.pageSize}
    />
  )
}
