import * as React from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { TableRow, TableCell } from "@/components/ui/table"

// ── Toggle Switch ─────────────────────────────────────────────────────────────

export function ToggleSwitch({ checked, onChange, disabled }: {
  checked: boolean; onChange: () => void; disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={[
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-input",
      ].join(" ")}
    >
      <span className={[
        "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform duration-200",
        checked ? "translate-x-4" : "translate-x-0",
      ].join(" ")} />
    </button>
  )
}

// ── Table helpers ─────────────────────────────────────────────────────────────

export function TableSkeleton({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

export function EmptyRow({ cols, message }: { cols: number; message: string }) {
  return (
    <TableRow>
      <TableCell colSpan={cols} className="py-12 text-center text-sm text-muted-foreground">
        {message}
      </TableCell>
    </TableRow>
  )
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────

export function ConfirmDialog({ open, onOpenChange, title, description, onConfirm, loading }: {
  open: boolean; onOpenChange: (v: boolean) => void
  title: string; description: string; onConfirm: () => void; loading?: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">{description}</p>
        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" className="cursor-pointer" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" className="cursor-pointer" onClick={onConfirm} disabled={loading}>
            {loading ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Utility ───────────────────────────────────────────────────────────────────

export function toggleId(id: number, list: number[], setList: (v: number[]) => void) {
  setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id])
}
