import * as React from "react"
import { useNavigate } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ArrowLeftIcon, SaveIcon } from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────────────────

interface Permission {
  id: number
  name: string
  slug: string
  resource: string
  action: string
  description?: string
}

interface PermGroup {
  resource: string
  perms: Permission[]
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CHILD_ACTIONS = new Set(['create', 'edit', 'delete', 'import', 'export', 'approve', 'reject'])

// ── Helpers ───────────────────────────────────────────────────────────────────

function sortPerms(perms: Permission[]): Permission[] {
  return [...perms].sort((a, b) => {
    if (a.action === "view") return -1
    if (b.action === "view") return 1
    return a.action.localeCompare(b.action)
  })
}

function groupByResource(perms: Permission[]): PermGroup[] {
  const map = new Map<string, Permission[]>()
  for (const p of perms) {
    const key = p.resource ?? "other"
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(p)
  }
  return Array.from(map.entries()).map(([resource, ps]) => ({ resource, perms: sortPerms(ps) }))
}

function applyViewGate(nextIds: number[], groups: PermGroup[]): number[] {
  let result = [...nextIds]
  for (const g of groups) {
    const viewPerm   = g.perms.find(p => p.action === "view")
    if (!viewPerm) continue
    const childPerms = g.perms.filter(p => CHILD_ACTIONS.has(p.action))
    const anyChildOn = childPerms.some(p => result.includes(p.id))
    if (!result.includes(viewPerm.id) && anyChildOn) result = [...result, viewPerm.id]
    if (!result.includes(viewPerm.id)) result = result.filter(id => !childPerms.some(p => p.id === id))
  }
  return result
}

// ── PermissionEditor ──────────────────────────────────────────────────────────

interface Props {
  subjectName: string
  subjectType: "Role" | "User"
  allPerms: Permission[]
  assignedIds: number[]
  isLoading: boolean
  onSave: (ids: number[]) => void
  isSaving: boolean
}

export function PermissionEditor({
  subjectName, subjectType, allPerms, assignedIds, isLoading, onSave, isSaving,
}: Props) {
  const navigate = useNavigate()
  const [selectedIds, setSelectedIds] = React.useState<number[]>([])

  const assignedKey = assignedIds.join(",")
  React.useEffect(() => {
    if (!isLoading) setSelectedIds(assignedIds)
  }, [isLoading, assignedKey])  // eslint-disable-line react-hooks/exhaustive-deps

  const groups = React.useMemo(() => groupByResource(allPerms), [allPerms])

  function toggle(id: number) {
    const next = selectedIds.includes(id)
      ? selectedIds.filter(x => x !== id)
      : [...selectedIds, id]
    setSelectedIds(applyViewGate(next, groups))
  }

  function toggleGroup(g: PermGroup) {
    const allSelected = g.perms.every(p => selectedIds.includes(p.id))
    const next = allSelected
      ? selectedIds.filter(id => !g.perms.some(p => p.id === id))
      : [...selectedIds, ...g.perms.map(p => p.id).filter(id => !selectedIds.includes(id))]
    setSelectedIds(applyViewGate(next, groups))
  }

  function isGroupAll(g: PermGroup)     { return g.perms.length > 0 && g.perms.every(p => selectedIds.includes(p.id)) }
  function isGroupPartial(g: PermGroup) { const s = g.perms.filter(p => selectedIds.includes(p.id)); return s.length > 0 && s.length < g.perms.length }

  function isChildDisabled(p: Permission, g: PermGroup): boolean {
    if (!CHILD_ACTIONS.has(p.action)) return false
    const viewPerm = g.perms.find(x => x.action === "view")
    return !!viewPerm && !selectedIds.includes(viewPerm.id)
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": "16rem", "--sidebar-width-icon": "3rem" } as React.CSSProperties}>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6 max-w-4xl">

          {/* Header */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="size-8 cursor-pointer" onClick={() => navigate(-1)}>
              <ArrowLeftIcon className="size-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">Assign Permissions</h1>
                <Badge variant="outline" className="capitalize">{subjectType}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{subjectName}</p>
            </div>
          </div>

          {/* Permission groups */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-4 space-y-3">
                  <Skeleton className="h-5 w-48" />
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: 4 }).map((_, j) => <Skeleton key={j} className="h-10 rounded-md" />)}
                  </div>
                </div>
              ))}
            </div>
          ) : groups.length === 0 ? (
            <p className="text-sm text-muted-foreground">No permissions available.</p>
          ) : (
            <div className="space-y-4">
              {groups.map(g => {
                const viewPerm    = g.perms.find(p => p.action === "view")
                const viewOn      = viewPerm ? selectedIds.includes(viewPerm.id) : true
                const hasViewGate = !!viewPerm

                return (
                  <div key={g.resource} className="rounded-lg border bg-card">
                    {/* Group header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <Checkbox
                          checked={isGroupAll(g)}
                          data-state={isGroupPartial(g) ? "indeterminate" : undefined}
                          onCheckedChange={() => toggleGroup(g)}
                        />
                        <span className="font-semibold text-sm capitalize">
                          {g.resource.replace(/-/g, " ")} Management
                        </span>
                      </label>
                      <button type="button" className="text-xs text-primary hover:underline cursor-pointer"
                        onClick={() => toggleGroup(g)}>
                        {isGroupAll(g) ? "Deselect All" : "Select All"}
                      </button>
                    </div>

                    <div className="p-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {g.perms.map(p => (
                          <PermCard key={p.id} p={p} checked={selectedIds.includes(p.id)}
                            disabled={isChildDisabled(p, g)} onToggle={() => toggle(p.id)} />
                        ))}
                      </div>
                    </div>

                    {hasViewGate && !viewOn && (
                      <div className="px-4 pb-3">
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          Enable <span className="font-semibold">View</span> to unlock other permissions in this group.
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Save bar */}
          {!isLoading && (
            <div className="flex items-center justify-end gap-3 pt-2 border-t">
              <Button variant="outline" className="cursor-pointer" onClick={() => navigate(-1)}>Cancel</Button>
              <Button className="cursor-pointer" onClick={() => onSave(selectedIds)} disabled={isSaving}>
                <SaveIcon className="size-3.5 mr-1.5" />
                {isSaving ? "Saving…" : "Save Permissions"}
              </Button>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

// ── Permission card ───────────────────────────────────────────────────────────

function PermCard({ p, checked, disabled, onToggle }: {
  p: Permission; checked: boolean; disabled: boolean; onToggle: () => void
}) {
  return (
    <label className={[
      "flex items-start gap-2 rounded-md px-3 py-2.5 border transition-colors select-none",
      disabled  ? "opacity-40 cursor-not-allowed bg-muted/20 border-transparent"
                : "cursor-pointer hover:bg-muted/40",
      checked && !disabled ? "border-primary/30 bg-primary/5" : !disabled ? "border-transparent" : "",
    ].join(" ")}>
      <Checkbox className="mt-0.5 shrink-0" checked={checked} disabled={disabled}
        onCheckedChange={() => !disabled && onToggle()} />
      <div className="min-w-0">
        <p className="text-sm capitalize font-medium leading-tight">{p.action}</p>
        {p.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{p.description}</p>}
      </div>
    </label>
  )
}
