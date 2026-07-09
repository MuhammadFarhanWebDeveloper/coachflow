"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Plus, Eye, ExternalLink, Users, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/empty-state"
import { Pagination } from "@/components/pagination"
import { AddClientDialog } from "@/components/add-client-dialog"
import { EditClientDialog } from "@/components/edit-client-dialog"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { deleteClient } from "@/lib/actions"

type Filter = "all" | "active" | "paused" | "inactive"

const filters: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Inactive", value: "inactive" },
]

type ClientRow = {
  id: string
  name: string
  email: string | null
  goal: string
  currentWeight: number | null
  goalWeight: number | null
  compliance: number
  status: string
  memberSince: string
  lastCheckInDate: string | null
  profileImage: string | null
}

function getStatusBadge(status: string, compliance: number, hasCheckIn: boolean) {
  if (status === "paused") {
    return { text: "Paused", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" }
  }
  if (status === "inactive") {
    return { text: "Inactive", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" }
  }
  if (!hasCheckIn) {
    return { text: "Pending Check-in", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" }
  }
  if (compliance < 70) {
    return { text: "Needs Follow-up", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" }
  }
  return { text: "Active", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" }
}

function daysAgo(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
}

function Avatar({ name, src, size = "md" }: { name: string; src: string | null; size?: "md" | "lg" }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const dims = size === "lg" ? "size-14" : "size-10"

  if (src) {
    return <img src={src} alt={name} className={`${dims} rounded-full object-cover`} />
  }

  return (
    <div className={`${dims} rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary`}>
      {initials}
    </div>
  )
}

export function ClientsContent({
  clients,
  page,
  total,
  pageSize,
}: {
  clients: ClientRow[]
  page: number
  total: number
  pageSize: number
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [filter, setFilter] = useState<Filter>("all")
  const [selected, setSelected] = useState<ClientRow | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(p))
    router.push(`/clients?${params.toString()}`)
  }

  const filtered = clients.filter((c) => {
    if (filter === "all") return true
    return c.status === filter
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Your Clients</h1>
          <p className="text-muted-foreground mt-2">{filtered.length} of {clients.length} clients</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />
          Add Client
        </Button>
      </div>

      <AddClientDialog open={addOpen} onOpenChange={setAddOpen} onSuccess={() => { setAddOpen(false); router.refresh() }} />

      <div className="flex gap-3 mb-6 flex-wrap">
        {filters.map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? "default" : "outline"}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <TH>Client</TH>
                <TH>Status</TH>
                <TH>Last Check-in</TH>
                <TH>Compliance</TH>
                <TH className="w-20">Actions</TH>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length > 0 ? (
                filtered.map((c) => (
                  <ClientRow
                    key={c.id}
                    client={c}
                    onSelect={() => setSelected(c)}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12">
                    {clients.length === 0 ? (
                      <EmptyState
                        icon={Users}
                        title="No clients yet"
                        description="Add your first client to start tracking their progress."
                        action={{ label: "Add Client" }}
                      />
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No clients match the selected filter
                      </p>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Pagination
        page={page}
        totalPages={Math.ceil(total / pageSize)}
        total={total}
        onPageChange={goToPage}
      />

      <Sheet open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null) }}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          {selected && <ClientSheetContent client={selected} />}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function TH({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider ${className ?? ""}`}>
      {children}
    </th>
  )
}

function ClientRow({ client, onSelect }: { client: ClientRow; onSelect: () => void }) {
  const router = useRouter()
  const badge = getStatusBadge(client.status, client.compliance, !!client.lastCheckInDate)
  return (
    <tr
      className="hover:bg-muted/50 transition cursor-pointer"
      onClick={onSelect}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar name={client.name} src={client.profileImage} />
          <div>
            <p className="font-medium text-foreground">{client.name}</p>
            <p className="text-sm text-muted-foreground">
              Member since {new Date(client.memberSince).toLocaleDateString()}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
          {badge.text}
        </span>
      </td>
      <td className="px-6 py-4">
        {client.lastCheckInDate ? (
          <>
            <div className="text-foreground">
              {new Date(client.lastCheckInDate).toLocaleDateString()}
            </div>
            <div className="text-sm text-muted-foreground">
              {daysAgo(client.lastCheckInDate)} days ago
            </div>
          </>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="text-foreground font-semibold">{client.compliance}%</div>
        <div className="w-16 h-1.5 bg-muted rounded-full mt-1">
          <div
            className="h-full rounded-full bg-chart-1"
            style={{ width: `${client.compliance}%` }}
          />
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            asChild
            onClick={(e) => e.stopPropagation()}
          >
            <Link href={`/clients/${client.id}`}>
              <Eye className="size-4" />
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Client</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {client.name}? This will
                  permanently remove the client and all their check-in data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={async (e) => {
                    e.stopPropagation()
                    await deleteClient(client.id)
                    router.refresh()
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </td>
    </tr>
  )
}

function ClientSheetContent({ client }: { client: ClientRow }) {
  const badge = getStatusBadge(client.status, client.compliance, !!client.lastCheckInDate)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()
  return (
    <>
      <SheetHeader className="pb-0">
        <div className="flex items-center gap-4">
          <Avatar name={client.name} src={client.profileImage} size="lg" />
          <div>
            <SheetTitle>{client.name}</SheetTitle>
            <SheetDescription>Member since {new Date(client.memberSince).toLocaleDateString()}</SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1">Goal</p>
            <p className="text-sm text-foreground">{client.goal}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1">Status</p>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
              {badge.text}
            </span>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-3">Weight</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted rounded-lg p-3">
              <p className="text-sm text-muted-foreground">Current</p>
              <p className="text-xl font-bold text-foreground">{client.currentWeight ?? "-"} kg</p>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <p className="text-sm text-muted-foreground">Goal</p>
              <p className="text-xl font-bold text-foreground">{client.goalWeight ?? "-"} kg</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-3">Compliance</p>
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-foreground font-medium">Overall</span>
              <span className="text-sm font-bold text-foreground">{client.compliance}%</span>
            </div>
            <div className="w-full h-2 bg-muted-foreground/20 rounded-full">
              <div
                className="h-full rounded-full bg-chart-1"
                style={{ width: `${client.compliance}%` }}
              />
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-3">Email</p>
          <div className="bg-muted rounded-lg p-3">
            <p className="text-sm text-foreground">{client.email ?? "No email on file"}</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-3">Last Check-in</p>
          <div className="bg-muted rounded-lg p-3">
            {client.lastCheckInDate ? (
              <>
                <p className="text-sm text-foreground">{new Date(client.lastCheckInDate).toLocaleDateString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{daysAgo(client.lastCheckInDate)} days ago</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No check-in yet</p>
            )}
          </div>
        </div>
      </div>

      <SheetFooter className="flex-col gap-2">
        <div className="flex gap-2 w-full">
          <EditClientDialog client={client} onSuccess={() => router.refresh()} />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" className="text-destructive">
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Client</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {client.name}? This will
                  permanently remove the client and all their check-in data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={deleting}
                  onClick={async () => {
                    setDeleting(true)
                    await deleteClient(client.id)
                    setDeleting(false)
                    router.refresh()
                  }}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <Button className="w-full" asChild>
          <Link href={`/clients/${client.id}`}>
            <ExternalLink className="size-4" />
            View Full Profile
          </Link>
        </Button>
      </SheetFooter>
    </>
  )
}
