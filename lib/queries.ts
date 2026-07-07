import prisma from "./prisma";

export async function getCurrentUser(clerkId: string) {
  return prisma.user.findUnique({ where: { clerkId } });
}

export async function getUserWithClients(clerkId: string) {
  return prisma.user.findUnique({
    where: { clerkId },
    include: {
      clients: {
        include: { checkIns: { orderBy: { date: "desc" } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getUserWithLatestCheckIn(
  clerkId: string,
  page = 1,
  pageSize = 20
) {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
  if (!user) return null;

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where: { coachId: user.id },
      include: { checkIns: { orderBy: { date: "desc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.client.count({ where: { coachId: user.id } }),
  ]);

  return { clients, total, page, pageSize };
}

export async function getClientWithCheckIns(clientId: string) {
  return prisma.client.findFirst({
    where: { id: clientId },
    include: { checkIns: { orderBy: { date: "desc" } } },
  });
}

export async function getClientWithFeedback(clientId: string) {
  return prisma.client.findFirst({
    where: { id: clientId },
    include: {
      checkIns: { orderBy: { date: "desc" } },
      feedback: {
        orderBy: { createdAt: "desc" },
        include: { coach: { select: { name: true } } },
      },
    },
  });
}

export async function getAllCheckIns(clerkId: string, page = 1, pageSize = 20) {
  const where = { client: { coach: { clerkId } } };
  const [checkIns, total] = await Promise.all([
    prisma.checkIn.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, profileImage: true } },
      },
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.checkIn.count({ where }),
  ]);

  return { checkIns, total, page, pageSize };
}

export async function getCoachProgress(clerkId: string) {
  return prisma.user.findUnique({
    where: { clerkId },
    include: {
      clients: {
        include: { checkIns: { orderBy: { date: "asc" }, take: 52 } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function getOverdueClients(clerkId: string) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return prisma.client.findMany({
    where: {
      coach: { clerkId },
      OR: [
        { lastCheckIn: null },
        { lastCheckIn: { lt: sevenDaysAgo } },
      ],
    },
    select: {
      id: true,
      name: true,
      goal: true,
      lastCheckIn: true,
      lastRemindedAt: true,
      status: true,
    },
    orderBy: { lastCheckIn: "asc" },
  });
}

export async function getCoachFeedback(clerkId: string, clientId: string) {
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return [];
  return prisma.feedback.findMany({
    where: { clientId, coachId: user.id },
    orderBy: { createdAt: "desc" },
  });
}
