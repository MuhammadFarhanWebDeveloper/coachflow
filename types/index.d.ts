export interface Client {
  id: string
  name: string
  goal: string
  currentWeight: number
  goalWeight: number
  memberSince: string
  status: string
  lastCheckIn: string | null
  compliance: number
  profileImage: string
}

export interface CheckIn {
  id: string
  clientId: string
  week: string
  date: string
  weight: number
  energy: number
  mood: string
  workoutCompletion: number
  nutritionAdherence: number
  waist: number
  chest: number
  arms: number
  notes: string
  coachFeedback: string
}

export interface Activity {
  id: string
  clientName: string
  action: string
  timestamp: string
  type: "checkin" | "photos" | "missed"
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export type ProfileTab = "overview" | "progress" | "checkins" | "notes"

export type FilterStatus = "all" | "active" | "pending"
