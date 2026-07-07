import prisma from "../lib/prisma";

const CLIENTS = [
  {
    name: "Alex Chen",
    goal: "Build lean muscle mass and improve overall strength",
    currentWeight: 75,
    goalWeight: 82,
    compliance: 85,
    status: "active" as const,
    checkIns: [
      { week: "W1", weight: 75, energy: 7, mood: "motivated" as const, workoutCompletion: 80, nutritionAdherence: 75, waist: 34, chest: 38, arms: 14, notes: "Started strong, excited about the program" },
      { week: "W2", weight: 74.5, energy: 6, mood: "happy" as const, workoutCompletion: 85, nutritionAdherence: 80, waist: 33.5, chest: 38.5, arms: 14.2, notes: "Slight dip in energy but staying consistent" },
      { week: "W3", weight: 74.8, energy: 8, mood: "motivated" as const, workoutCompletion: 90, nutritionAdherence: 85, waist: 33, chest: 39, arms: 14.5, notes: "Feeling great, seeing early progress" },
      { week: "W4", weight: 75.2, energy: 8, mood: "happy" as const, workoutCompletion: 95, nutritionAdherence: 90, waist: 32.5, chest: 39.5, arms: 14.8, notes: "Weight is stable but composition is changing" },
    ],
  },
  {
    name: "Sarah Johnson",
    goal: "Weight loss and improved cardiovascular endurance",
    currentWeight: 84,
    goalWeight: 68,
    compliance: 75,
    status: "active" as const,
    checkIns: [
      { week: "W1", weight: 84, energy: 5, mood: "neutral" as const, workoutCompletion: 70, nutritionAdherence: 65, waist: 32, chest: 36, arms: 12, notes: "Finding the routine challenging but committed" },
      { week: "W2", weight: 82.5, energy: 6, mood: "motivated" as const, workoutCompletion: 75, nutritionAdherence: 75, waist: 31, chest: 36, arms: 12, notes: "Already seeing results on the scale, very motivating" },
      { week: "W3", weight: 81, energy: 7, mood: "happy" as const, workoutCompletion: 85, nutritionAdherence: 80, waist: 30.5, chest: 35.5, arms: 11.8, notes: "Energy levels improving, enjoying the workouts more" },
    ],
  },
  {
    name: "Marcus Williams",
    goal: "Recovery from knee injury and regain mobility",
    currentWeight: 91,
    goalWeight: 85,
    compliance: 60,
    status: "paused" as const,
    checkIns: [
      { week: "W1", weight: 91, energy: 4, mood: "stressed" as const, workoutCompletion: 50, nutritionAdherence: 60, waist: 36, chest: 42, arms: 15, notes: "Frustrated with limited mobility, taking it slow" },
      { week: "W2", weight: 90, energy: 5, mood: "neutral" as const, workoutCompletion: 60, nutritionAdherence: 70, waist: 35.5, chest: 42, arms: 15, notes: "Slight improvement, PT sessions helping" },
    ],
  },
];

function weeksAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n * 7);
  return d;
}

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: "muhammadfarhan3789076@gmail.com" },
  });

  if (!user) {
    console.error("User not found. Make sure the user exists before seeding.");
    process.exit(1);
  }

  console.log(`Found coach: ${user.name} (${user.email})`);

  await prisma.feedback.deleteMany({ where: { coachId: user.id } });
  await prisma.checkIn.deleteMany({ where: { client: { coachId: user.id } } });
  await prisma.client.deleteMany({ where: { coachId: user.id } });
  console.log("Cleared existing data\n");

  for (const c of CLIENTS) {
    const client = await prisma.client.create({
      data: {
        coachId: user.id,
        name: c.name,
        goal: c.goal,
        currentWeight: c.currentWeight,
        goalWeight: c.goalWeight,
        compliance: c.compliance,
        status: c.status,
        profileImage: `https://api.dicebear.com/9.x/initials/svg?seed=${c.name}`,
      },
    });

    console.log(`  Created client: ${client.name}`);

    for (let i = 0; i < c.checkIns.length; i++) {
      const ci = c.checkIns[i];
      await prisma.checkIn.create({
        data: {
          clientId: client.id,
          week: ci.week,
          date: weeksAgo(c.checkIns.length - i),
          weight: ci.weight,
          energy: ci.energy,
          mood: ci.mood,
          workoutCompletion: ci.workoutCompletion,
          nutritionAdherence: ci.nutritionAdherence,
          waist: ci.waist,
          chest: ci.chest,
          arms: ci.arms,
          notes: ci.notes,
        },
      });
    }

    console.log(`  Created ${c.checkIns.length} check-ins`);
  }

  const clients = await prisma.client.findMany({ where: { coachId: user.id } });
  const feedbackData = [
    { clientId: clients[0].id, content: "Great progress this week, Alex! Your consistency is paying off. Let's push the intensity next week." },
    { clientId: clients[1].id, content: "Sarah, you're doing well on the weight loss track. Try adding an extra cardio session this week." },
  ];
  for (const fb of feedbackData) {
    await prisma.feedback.create({
      data: { ...fb, coachId: user.id },
    });
  }
  console.log(`  Created ${feedbackData.length} feedback entries`);

  console.log("\nSeed complete!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
