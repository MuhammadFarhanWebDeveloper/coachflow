-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('active', 'inactive', 'paused');

-- CreateEnum
CREATE TYPE "Mood" AS ENUM ('happy', 'neutral', 'tired', 'stressed', 'motivated');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('checkin', 'photos', 'missed');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "currentWeight" DOUBLE PRECISION,
    "goalWeight" DOUBLE PRECISION,
    "compliance" INTEGER NOT NULL DEFAULT 0,
    "profileImage" TEXT,
    "memberSince" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastCheckIn" TIMESTAMP(3),
    "status" "ClientStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckIn" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "week" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "weight" DOUBLE PRECISION,
    "energy" INTEGER NOT NULL,
    "mood" "Mood" NOT NULL,
    "workoutCompletion" INTEGER NOT NULL,
    "nutritionAdherence" INTEGER NOT NULL,
    "waist" DOUBLE PRECISION,
    "chest" DOUBLE PRECISION,
    "arms" DOUBLE PRECISION,
    "notes" TEXT,
    "coachFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
