"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

export function Pagination({
  page,
  totalPages,
  total,
  onPageChange,
}: {
  page: number
  totalPages: number
  total: number
  onPageChange: (p: number) => void
}) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between mt-6 text-sm">
      <p className="text-muted-foreground">
        {total} total
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-muted-foreground px-2">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}
