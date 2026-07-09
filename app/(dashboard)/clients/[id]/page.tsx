import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getClientWithFeedback } from "@/lib/queries";
import { ClientProfile } from "./client-profile";

export type { FeedbackData } from "./client-profile";

export default async function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const client = await getClientWithFeedback(id);

  if (!client) notFound();

  const data = {
    id: client.id,
    name: client.name,
    email: client.email,
    goal: client.goal,
    currentWeight: client.currentWeight,
    goalWeight: client.goalWeight,
    compliance: client.compliance,
    status: client.status,
    memberSince: client.memberSince.toISOString(),
    profileImage: client.profileImage,
    checkIns: client.checkIns.map((ci) => ({
      id: ci.id,
      week: ci.week,
      date: ci.date.toISOString(),
      weight: ci.weight,
      energy: ci.energy,
      mood: ci.mood,
      workoutCompletion: ci.workoutCompletion,
      nutritionAdherence: ci.nutritionAdherence,
      waist: ci.waist,
      chest: ci.chest,
      arms: ci.arms,
      notes: ci.notes,
      coachFeedback: ci.coachFeedback,
    })),
    feedback: client.feedback.map((f) => ({
      id: f.id,
      content: f.content,
      createdAt: f.createdAt.toISOString(),
      coachName: f.coach.name,
    })),
  };

  return <ClientProfile client={data} />;
}
