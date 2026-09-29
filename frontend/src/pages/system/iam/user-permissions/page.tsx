import * as React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeftIcon, SaveIcon, ShieldCheckIcon, KeyRoundIcon } from "lucide-react"
import {
  usePermissions, useAssignableRoles,
  useUserRoles, useSyncUserRoles,
  useUserPermissions, useSyncUserPermissions,
} from "@/hooks/iam/useIam"
import { useUsers } from "@/hooks/iam/useUsers"
import { PATHS } from "@/routes/paths"

// ── Types ─────────────────────────────────────────────────────────────────────

interface Perm { id: number; name: string; slug: string; resource: string; action: string; description?: string }
interface PermGroup { resource: string; perms: Perm[] }

// ── Constants ─────────────────────────────────────────────────────────────────

const CHILD_ACTIONS = new Set(['create', 'edit', 'delete', 'import', 'export', 'approve', 'reject'])

// ── Helpers ───────────────────────────────────────────────────────────────────

function groupByResource(perms: Perm[]): PermGroup[] {
  const map = new Map<string, Perm[]>()
  for (const p of perms) {
    const key = p.resource ?? "other"
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(p)
  }
  return Array.from(map.entries()).map(([resource, ps]) => ({
    resource,
    perms: [...ps].sort((a, b) => a.action === "view" ? -1 : b.action === "view" ? 1 : a.action.localeCompare(b.action)),
  }))
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function UserAssignPage() {
  const { id }   = useParams<{ id: string }>()
  const userId   = Number(id)
  const navigate = useNavigate()

  const { data: users = [] }                                  = useUsers()
  const { data: allRoles = [],  isLoading: loadingRoles }     = useAssignableRoles()
  const { data: allPerms = [],  isLoading: loadingPerms }     = usePermissions()
  const { data: userRoles = [], isLoading: loadingUserRoles } = useUserRoles(userId)
  const { data: userPerms = [], isLoading: loadingUserPerms } = useUserPermissions(userId)

  const syncRoles = useSyncUserRoles()
  const syncPerms = useSyncUserPermissions()

  const [selectedRoleId,  setSelectedRoleId]  = React.useState<number | null>(null)
  const [selectedPermIds, setSelectedPermIds] = React.useState<number[]>([])

  const isLoadingRoles = loadingRoles || loadingUserRoles
  const isLoadingPerms = loadingPerms || loadingUserPerms

  // Init role (single)
  const userRoleKey = (userRoles as any[]).map((r: any) => r.id).join(",")
  React.useEffect(() => {
    if (!loadingUserRoles) {
      const first = (userRoles as any[])[0]
      setSelectedRoleId(first ? first.id : null)
    }
  }, [loadingUserRoles, userRoleKey])  // eslint-disable-line

  // Init permissions
  const userPermKey = (userPerms as any[]).map((p: any) => p.id).join(",")
  React.useEffect(() => {
    if (!loadingUserPerms) setSelectedPermIds((userPerms as any[]).map((p: any) => p.id))
  }, [loadingUserPerms, userPermKey])  // eslint-disable-line

  const groups = React.useMemo(() => groupByResource(allPerms as Perm[]), [allPerms])
  const user   = (users as any[]).find((u: any) => u.id === userId)

  // ── Permission helpers ────────────────────────────────────────────────────

  function togglePerm(id: number) {
    const next = selectedPermIds.includes(id)
      ? selectedPermIds.filter(x => x !== id)
      : [...selectedPermIds, id]
    setSelectedPermIds(applyViewGate(next, groups))
  }

  function togglePermGroup(g: PermGroup) {
    const allSel = g.perms.every(p => selectedPermIds.includes(p.id))
    const next = allSel
      ? selectedPermIds.filter(id => !g.perms.some(p => p.id === id))
      : [...selectedPermIds, ...g.perms.map(p => p.id).filter(id => !selectedPermIds.includes(id))]
    setSelectedPermIds(applyViewGate(next, groups))
  }

  function isGroupAll(g: PermGroup)     { return g.perms.length > 0 && g.perms.every(p => selectedPermIds.includes(p.id)) }
  function isGroupPartial(g: PermGroup) { const s = g.perms.filter(p => selectedPermIds.includes(p.id)); return s.length > 0 && s.length < g.perms.length }
  function isChildDisabled(p: Perm, g: PermGroup) {
    if (!CHILD_ACTIONS.has(p.action)) return false
    const vp = g.perms.find(x => x.action === "view")
    return !!vp && !selectedPermIds.includes(vp.id)
  }

  // ── Save handlers ─────────────────────────────────────────────────────────

  function handleSaveRole() {
    syncRoles.mutate(
      { userId, roleIds: selectedRoleId !== null ? [selectedRoleId] : [] },
      { onSuccess: () => navigate(PATHS.SYSTEM.IAM) },
    )
  }

  function handleSavePerms() {
    syncPerms.mutate({ userId, permissionIds: selectedPermIds }, { onSuccess: () => navigate(PATHS.SYSTEM.IAM) })
  }

  // ── Perm card ─────────────────────────────────────────────────────────────

  function PermCard({ p, g }: { p: Perm; g: PermGroup }) {
    const disabled = isChildDisabled(p, g)
    const checked  = selectedPermIds.includes(p.id)
    return (
      <label className={[
        "flex items-center gap-2 rounded px-2 py-1.5 border transition-colors select-none text-sm",
        disabled ? "opacity-40 cursor-not-allowed bg-muted/20 border-transparent"
                 : "cursor-pointer hover:bg-muted/40",
        checked && !disabled ? "border-primary/30 bg-primary/5" : !disabled ? "border-transparent" : "",
      ].join(" ")}>
        <Checkbox checked={checked} disabled={disabled}
          onCheckedChange={() => !disabled && togglePerm(p.id)} />
        <span className="capitalize font-medium">{p.action}</span>
      </label>
    )
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": "16rem", "--sidebar-width-icon": "3rem" } as React.CSSProperties}>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">

          {/* Header */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="size-8 cursor-pointer" onClick={() => navigate(-1)}>
              <ArrowLeftIcon className="size-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">Assign Role & Permissions</h1>
                <Badge variant="outline">User</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {user?.name ?? user?.email ?? `User #${userId}`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">

            {/* ── Role (single select) ──────────────────────────────────── */}
            <div className="rounded-lg border bg-card flex flex-col">
              <div className="flex items-center gap-2 px-4 py-3 border-b">
                <ShieldCheckIcon className="size-4 text-primary" />
                <h2 className="font-semibold text-sm">Role</h2>
                <span className="text-xs text-muted-foreground ml-auto">Select one</span>
              </div>

              <div className="flex-1 p-4 space-y-1 min-h-32">
                {isLoadingRoles
                  ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-md" />)
                  : (allRoles as any[]).length === 0
                    ? <p className="text-sm text-muted-foreground text-center py-6">No roles available</p>
                    : (allRoles as any[]).map((r: any) => {
                        const isSelected = selectedRoleId === r.id
                        return (
                          <label key={r.id} className={[
                            "flex items-center gap-3 cursor-pointer rounded-md px-3 py-2 transition-colors select-none",
                            isSelected ? "bg-primary/5 border border-primary/20" : "hover:bg-muted border border-transparent",
                          ].join(" ")}>
                            <input
                              type="radio"
                              name="user-role"
                              className="accent-primary cursor-pointer"
                              checked={isSelected}
                              onChange={() => setSelectedRoleId(r.id)}
                              onClick={() => { if (isSelected) setSelectedRoleId(null) }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{r.name}</p>
                              {r.description && <p className="text-xs text-muted-foreground truncate">{r.description}</p>}
                            </div>
                            {r.roleType && (
                              <Badge variant="outline" className="text-xs px-1.5 py-0 capitalize shrink-0">{r.roleType}</Badge>
                            )}
                          </label>
                        )
                      })
                }
              </div>

              <div className="px-4 py-3 border-t flex items-center justify-between gap-2">
                {selectedRoleId !== null
                  ? <button type="button" className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                      onClick={() => setSelectedRoleId(null)}>Clear selection</button>
                  : <span />
                }
                <Button size="sm" className="cursor-pointer" onClick={handleSaveRole} disabled={syncRoles.isPending}>
                  <SaveIcon className="size-3.5 mr-1.5" />
                  {syncRoles.isPending ? "Saving…" : "Save Role"}
                </Button>
              </div>
            </div>

            {/* ── Direct Permissions ────────────────────────────────────── */}
            <div className="rounded-lg border bg-card flex flex-col">
              <div className="flex items-center gap-2 px-4 py-3 border-b">
                <KeyRoundIcon className="size-4 text-primary" />
                <h2 className="font-semibold text-sm">Direct Permissions</h2>
                <span className="text-xs text-muted-foreground ml-auto">Overrides role permissions</span>
              </div>

              <div className="flex-1 p-4 space-y-4 min-h-32 max-h-[60vh] overflow-y-auto">
                {isLoadingPerms
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <div className="grid grid-cols-2 gap-2">
                          {Array.from({ length: 4 }).map((_, j) => <Skeleton key={j} className="h-9 rounded-md" />)}
                        </div>
                      </div>
                    ))
                  : groups.length === 0
                    ? <p className="text-sm text-muted-foreground text-center py-6">No permissions available</p>
                    : groups.map(g => {
                        const viewPerm = g.perms.find(p => p.action === "view")
                        const viewOn   = viewPerm ? selectedPermIds.includes(viewPerm.id) : true
                        return (
                          <div key={g.resource} className="rounded-md border">
                            <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
                              <label className="flex items-center gap-2 cursor-pointer select-none">
                                <Checkbox
                                  checked={isGroupAll(g)}
                                  data-state={isGroupPartial(g) ? "indeterminate" : undefined}
                                  onCheckedChange={() => togglePermGroup(g)}
                                />
                                <span className="text-sm font-medium capitalize">
                                  {g.resource.replace(/-/g, " ")} Management
                                </span>
                              </label>
                              <button type="button" className="text-xs text-primary hover:underline cursor-pointer"
                                onClick={() => togglePermGroup(g)}>
                                {isGroupAll(g) ? "Deselect All" : "Select All"}
                              </button>
                            </div>

                            <div className="p-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {g.perms.map(p => <PermCard key={p.id} p={p} g={g} />)}
                              </div>
                            </div>

                            {viewPerm && !viewOn && (
                              <p className="px-3 pb-2 text-xs text-amber-600 dark:text-amber-400">
                                Enable <span className="font-semibold">View</span> to unlock other permissions.
                              </p>
                            )}
                          </div>
                        )
                      })
                }
              </div>

              <div className="px-4 py-3 border-t flex justify-end">
                <Button size="sm" className="cursor-pointer" onClick={handleSavePerms} disabled={syncPerms.isPending}>
                  <SaveIcon className="size-3.5 mr-1.5" />
                  {syncPerms.isPending ? "Saving…" : "Save Permissions"}
                </Button>
              </div>
            </div>

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
