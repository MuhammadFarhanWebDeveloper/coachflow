"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { addClient } from "@/lib/actions"

export function AddClientDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [goal, setGoal] = useState("")
  const [currentWeight, setCurrentWeight] = useState("")
  const [goalWeight, setGoalWeight] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !goal.trim() || submitting) return
    setSubmitting(true)
    setError("")

    const result = await addClient({
      name: name.trim(),
      goal: goal.trim(),
      email: email.trim() || null,
      currentWeight: currentWeight ? parseFloat(currentWeight) : null,
      goalWeight: goalWeight ? parseFloat(goalWeight) : null,
    })

    setSubmitting(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    setName("")
    setGoal("")
    setCurrentWeight("")
    setGoalWeight("")
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Client</DialogTitle>
          <DialogDescription>
            Add a new client to start tracking their progress.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Name <span className="text-destructive">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Client's full name"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Goal <span className="text-destructive">*</span>
              </label>
              <Input
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Build lean muscle, lose 10kg"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Current Weight (kg)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Goal Weight (kg)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={goalWeight}
                  onChange={(e) => setGoalWeight(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || !goal.trim() || submitting}
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {submitting ? "Adding..." : "Add Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
