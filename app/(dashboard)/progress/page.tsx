import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCoachProgress } from "@/lib/queries";
import { ProgressClient } from "./progress-client";

async function ProgressContent() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await getCoachProgress(userId);
  if (!user) redirect("/sign-in");

  const clients = user.clients.map((c) => ({
    id: c.id,
    name: c.name,
    goal: c.goal,
    compliance: c.compliance,
    currentWeight: c.currentWeight,
    goalWeight: c.goalWeight,
    profileImage: c.profileImage,
    status: c.status,
    createdAt: c.createdAt.toISOString(),
    checkIns: c.checkIns.map((ci) => ({
      week: ci.week,
      date: ci.date.toISOString(),
      energy: ci.energy,
      workoutCompletion: ci.workoutCompletion,
      nutritionAdherence: ci.nutritionAdherence,
      weight: ci.weight,
    })),
  }));

  return <ProgressClient clients={clients} />;
}

export default function ProgressPage() {
  return <ProgressContent />;
}
