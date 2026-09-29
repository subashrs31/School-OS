import * as React from "react"
import { useParams, Link } from "react-router-dom"
import { ChevronRightIcon, PlusIcon, PencilIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useStaff, useCreateStaff, useUpdateStaff, useDesignations, useCreateDesignation, useUpdateDesignation, useOrganization } from "@/hooks/organization/useOrganization"
import { useUsers } from "@/hooks/iam/useUsers"
import { useHasPermission } from "@/hooks/auth/usePermissions"
import { PATHS } from "@/routes/paths"
import { OrgPageShell } from "../OrgPageShell"

export default function StaffListPage() {
  const { organizationId } = useParams<{ organizationId: string }>()
  const orgId = Number(organizationId)

  const { data: staff = [], isLoading }        = useStaff(orgId)
  const { data: designations = [] }            = useDesignations(orgId)
  const { data: org }                          = useOrganization(orgId)
  const { data: allUsers = [] }                = useUsers()

  const staffUserIds = React.useMemo(() => new Set((staff as any[]).map((s: any) => s.userId)), [staff])
  const availableUsers = React.useMemo(() => (allUsers as any[]).filter((u: any) => !staffUserIds.has(u.id)), [allUsers, staffUserIds])
  const createStaff        = useCreateStaff()
  const updateStaff        = useUpdateStaff()
  const createDesignation  = useCreateDesignation()
  const updateDesignation  = useUpdateDesignation()
  const canCreate          = useHasPermission("staff.create")
  const canEdit            = useHasPermission("staff.edit")

  const [createOpen, setCreateOpen]       = React.useState(false)
  const [editStaff, setEditStaff]         = React.useState<any>(null)
  const [desigOpen, setDesigOpen]         = React.useState(false)
  const [editDesig, setEditDesig]         = React.useState<any>(null)
  const [desigForm, setDesigForm]         = React.useState({ name: "", description: "" })
  const [form, setForm]                   = React.useState({ userId: "", designationId: "", employeeCode: "", joiningDate: "", status: "active" })

  const set      = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }))
  const setDesig = (field: string, value: string) => setDesigForm((f) => ({ ...f, [field]: value }))

  function openEditDesig(d: any) {
    setEditDesig(d)
    setDesigForm({ name: d.name, description: d.description ?? "" })
  }

  function handleDesigSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!desigForm.name.trim()) return
    if (editDesig) {
      updateDesignation.mutate(
        { orgId, dId: editDesig.id, data: desigForm },
        { onSuccess: () => { setEditDesig(null); setDesigForm({ name: "", description: "" }) } }
      )
    } else {
      createDesignation.mutate(
        { orgId, data: desigForm },
        { onSuccess: () => setDesigForm({ name: "", description: "" }) }
      )
    }
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.userId) return
    const data: Record<string, unknown> = { userId: Number(form.userId), status: form.status }
    if (form.designationId) data["designationId"] = Number(form.designationId)
    if (form.employeeCode)  data["employeeCode"]  = form.employeeCode
    if (form.joiningDate)   data["joiningDate"]   = form.joiningDate
    createStaff.mutate({ orgId, data }, { onSuccess: () => { setCreateOpen(false); setForm({ userId: "", designationId: "", employeeCode: "", joiningDate: "", status: "active" }) } })
  }

  function openEdit(s: any) {
    setEditStaff(s)
    setForm({ userId: String(s.userId), designationId: String(s.designationId ?? ""), employeeCode: s.employeeCode ?? "", joiningDate: s.joiningDate ?? "", status: s.status ?? "active" })
  }

  function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    const data: Record<string, unknown> = { status: form.status }
    if (form.designationId) data["designationId"] = Number(form.designationId)
    if (form.employeeCode)  data["employeeCode"]  = form.employeeCode
    if (form.joiningDate)   data["joiningDate"]   = form.joiningDate
    updateStaff.mutate({ orgId, staffId: editStaff.id, data }, { onSuccess: () => setEditStaff(null) })
  }

  const statusColor: Record<string, string> = {
    active: "text-emerald-600 dark:text-emerald-400",
    inactive: "text-muted-foreground",
    on_leave: "text-amber-600 dark:text-amber-400",
  }

  return (
    <OrgPageShell>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link to={PATHS.ORGANIZATION.ROOT} className="hover:text-foreground transition-colors">Organizations</Link>
            <ChevronRightIcon className="size-3.5" />
            <Link to={PATHS.ORGANIZATION.DETAIL(orgId)} className="hover:text-foreground transition-colors">{(org as any)?.name ?? "…"}</Link>
            <ChevronRightIcon className="size-3.5" />
            <span className="text-foreground">Staff</span>
          </nav>
          <h1 className="text-xl font-bold tracking-tight">Staff</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="cursor-pointer" onClick={() => setDesigOpen(true)}>
            Manage Designations
          </Button>
          {canCreate && (
            <Button size="sm" className="cursor-pointer" onClick={() => setCreateOpen(true)}>
              <PlusIcon className="size-3.5" /> Add Staff
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-10 text-center">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Employee Code</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead className="w-28">Status</TableHead>
              {canEdit && <TableHead className="w-20 text-right pr-4">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>{Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}</TableRow>
                ))
              : (staff as any[]).length === 0
              ? <TableRow><TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">No staff found</TableCell></TableRow>
              : (staff as any[]).map((s: any, idx: number) => (
                  <TableRow key={s.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-center text-xs text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                          {(s.User?.name ?? s.User?.email ?? "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{s.User?.name ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">{s.User?.email ?? ""}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.employeeCode ?? "—"}</TableCell>
                    <TableCell>
                      {s.Designation
                        ? <Badge variant="secondary" className="text-xs">{s.Designation.name}</Badge>
                        : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-medium capitalize ${statusColor[s.status] ?? ""}`}>
                        {s.status?.replace("_", " ")}
                      </span>
                    </TableCell>
                    {canEdit && (
                      <TableCell className="pr-4">
                        <div className="flex justify-end">
                          <Button size="icon" variant="ghost" className="size-7 cursor-pointer"
                            onClick={() => openEdit(s)}><PencilIcon className="size-3.5" /></Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
            }
          </TableBody>
        </Table>
      </div>

      {/* Create */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Staff</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <Label>User *</Label>
              <select value={form.userId} onChange={(e) => set("userId", e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">— Select user —</option>
                {availableUsers.map((u: any) => (
                  <option key={u.id} value={u.id}>{u.name ?? u.email} {u.name && u.email ? `(${u.email})` : ""}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Designation</Label>
              <select value={form.designationId} onChange={(e) => set("designationId", e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">— None —</option>
                {(designations as any[]).map((d: any) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Employee Code</Label>
                <Input value={form.employeeCode} onChange={(e) => set("employeeCode", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Joining Date</Label>
                <Input type="date" value={form.joiningDate} onChange={(e) => set("joiningDate", e.target.value)} />
              </div>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" type="button" className="cursor-pointer" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" className="cursor-pointer" disabled={createStaff.isPending}>
                {createStaff.isPending ? "Saving…" : "Add Staff"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Designations */}
      <Dialog open={desigOpen} onOpenChange={(v) => { setDesigOpen(v); if (!v) { setEditDesig(null); setDesigForm({ name: "", description: "" }) } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Manage Designations</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-1">
            <form onSubmit={handleDesigSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Name *</Label>
                  <Input placeholder="e.g. Principal" value={desigForm.name} onChange={(e) => setDesig("name", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Input placeholder="Optional" value={desigForm.description} onChange={(e) => setDesig("description", e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                {editDesig && (
                  <Button type="button" variant="ghost" size="sm" className="cursor-pointer" onClick={() => { setEditDesig(null); setDesigForm({ name: "", description: "" }) }}>Cancel Edit</Button>
                )}
                <Button type="submit" size="sm" className="cursor-pointer" disabled={createDesignation.isPending || updateDesignation.isPending}>
                  {editDesig ? (updateDesignation.isPending ? "Saving…" : "Update") : (createDesignation.isPending ? "Adding…" : "Add")}
                </Button>
              </div>
            </form>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-16 text-right pr-3">Edit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(designations as any[]).length === 0
                    ? <TableRow><TableCell colSpan={3} className="py-6 text-center text-sm text-muted-foreground">No designations yet</TableCell></TableRow>
                    : (designations as any[]).map((d: any) => (
                        <TableRow key={d.id} className={editDesig?.id === d.id ? "bg-muted/40" : ""}>
                          <TableCell className="text-sm font-medium">{d.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{d.description || "—"}</TableCell>
                          <TableCell className="pr-3">
                            <div className="flex justify-end">
                              <Button size="icon" variant="ghost" className="size-7 cursor-pointer" onClick={() => openEditDesig(d)}>
                                <PencilIcon className="size-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                  }
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={!!editStaff} onOpenChange={(v) => !v && setEditStaff(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Staff</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <Label>Designation</Label>
              <select value={form.designationId} onChange={(e) => set("designationId", e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">— None —</option>
                {(designations as any[]).map((d: any) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Employee Code</Label>
                <Input value={form.employeeCode} onChange={(e) => set("employeeCode", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Joining Date</Label>
                <Input type="date" value={form.joiningDate} onChange={(e) => set("joiningDate", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
              </select>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" type="button" className="cursor-pointer" onClick={() => setEditStaff(null)}>Cancel</Button>
              <Button type="submit" className="cursor-pointer" disabled={updateStaff.isPending}>
                {updateStaff.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </OrgPageShell>
  )
}
