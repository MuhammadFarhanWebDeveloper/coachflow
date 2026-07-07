"use client"

import { useParams, useRouter } from "next/navigation"
import { submitCheckIn } from "@/lib/actions"
import { useState } from "react"

const moods = [
  { value: "happy", label: "Happy", emoji: "😊" },
  { value: "neutral", label: "Neutral", emoji: "😐" },
  { value: "tired", label: "Tired", emoji: "😴" },
  { value: "stressed", label: "Stressed", emoji: "😰" },
  { value: "motivated", label: "Motivated", emoji: "💪" },
] as const

export default function CheckInPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    weight: "",
    energy: "5",
    mood: "neutral",
    workoutCompletion: "50",
    nutritionAdherence: "50",
    waist: "",
    chest: "",
    arms: "",
    notes: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const result = await submitCheckIn(token, {
      weight: formData.weight ? parseFloat(formData.weight) : null,
      energy: parseInt(formData.energy),
      mood: formData.mood as "happy" | "neutral" | "tired" | "stressed" | "motivated",
      workoutCompletion: parseInt(formData.workoutCompletion),
      nutritionAdherence: parseInt(formData.nutritionAdherence),
      waist: formData.waist ? parseFloat(formData.waist) : null,
      chest: formData.chest ? parseFloat(formData.chest) : null,
      arms: formData.arms ? parseFloat(formData.arms) : null,
      notes: formData.notes || null,
    })

    if (result.success) {
      setSubmitted(true)
    } else {
      setError(result.error)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-semibold text-zinc-100 mb-2">Check-in Submitted!</h1>
          <p className="text-zinc-400 mb-6">Your coach will review it shortly.</p>
          <button
            onClick={() => router.push("/")}
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-zinc-100">Weekly Check-in</h1>
          <p className="text-zinc-400 text-sm mt-1">Let your coach know how your week went</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="75.5"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Energy Level</label>
              <input
                type="range"
                name="energy"
                min="1"
                max="10"
                value={formData.energy}
                onChange={handleChange}
                className="w-full mt-2 accent-emerald-500"
              />
              <span className="text-xs text-zinc-500 mt-1 block text-center">{formData.energy}/10</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Mood</label>
            <div className="grid grid-cols-5 gap-2">
              {moods.map((m) => (
                <button
                  type="button"
                  key={m.value}
                  onClick={() => setFormData((prev) => ({ ...prev, mood: m.value }))}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-colors ${
                    formData.mood === m.value
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                      : "border-zinc-800 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  <span className="text-lg">{m.emoji}</span>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Workout Completion</label>
              <input
                type="range"
                name="workoutCompletion"
                min="0"
                max="100"
                value={formData.workoutCompletion}
                onChange={handleChange}
                className="w-full mt-2 accent-emerald-500"
              />
              <span className="text-xs text-zinc-500 mt-1 block text-center">{formData.workoutCompletion}%</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Nutrition Adherence</label>
              <input
                type="range"
                name="nutritionAdherence"
                min="0"
                max="100"
                value={formData.nutritionAdherence}
                onChange={handleChange}
                className="w-full mt-2 accent-emerald-500"
              />
              <span className="text-xs text-zinc-500 mt-1 block text-center">{formData.nutritionAdherence}%</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Waist (cm)</label>
              <input
                type="number"
                step="0.1"
                name="waist"
                value={formData.waist}
                onChange={handleChange}
                placeholder="85"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Chest (cm)</label>
              <input
                type="number"
                step="0.1"
                name="chest"
                value={formData.chest}
                onChange={handleChange}
                placeholder="100"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Arms (cm)</label>
              <input
                type="number"
                step="0.1"
                name="arms"
                value={formData.arms}
                onChange={handleChange}
                placeholder="35"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="How was your week? Any challenges or wins?"
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 resize-none"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors text-sm"
          >
            Submit Check-in
          </button>
        </form>
      </div>
    </div>
  )
}
