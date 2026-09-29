import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table"
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from "@/hooks/iam/useIam"
import { PATHS } from "@/routes/paths"
import { PlusIcon, Trash2Icon, PencilIcon, ShieldIcon, KeyRoundIcon } from "lucide-react"
import { TableSkeleton, EmptyRow, ConfirmDialog } from "./shared"

export function RolesTab() {
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editRole, setEditRole]     = React.useState<any>(null)
  const [deleteId, setDeleteId]     = React.useState<number | null>(null)
  const [createForm, setCreateForm] = React.useState({ name: "", description: "", roleType: "normal" })
  const [createErr, setCreateErr]   = React.useState({ name: "" })
  const [editForm, setEditForm]     = React.useState({ name: "", description: "", roleType: "normal" })
  const [editErr, setEditErr]       = React.useState({ name: "" })

  const { data: roles = [], isLoading } = useRoles()
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const deleteRole = useDeleteRole()
  const navigate   = useNavigate()

  function validateRole(name: string, setErr: (e: { name: string }) => void) {
    const e = { name: "" }
    if (!name.trim()) e.name = "Name is required"
    setErr(e)
    return !e.name
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!validateRole(createForm.name, setCreateErr)) return
    createRole.mutate(createForm, {
      onSuccess: () => {
        setCreateOpen(false)
        setCreateForm({ name: "", description: "", roleType: "normal" })
        setCreateErr({ name: "" })
      },
    })
  }

  function openEdit(r: any) {
    setEditRole(r)
    setEditForm({ name: r.name ?? "", description: r.description ?? "", roleType: r.roleType ?? "normal" })
    setEditErr({ name: "" })
  }

  function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateRole(editForm.name, setEditErr)) return
    updateRole.mutate({ id: editRole.id, data: editForm }, { onSuccess: () => setEditRole(null) })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" className="cursor-pointer" onClick={() => setCreateOpen(true)}>
          <PlusIcon className="size-3.5" /> Add Role
        </Button>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-10 text-center">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-28 text-right pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <TableSkeleton cols={4} /> :
             (roles as any[]).length === 0 ? <EmptyRow cols={4} message="No roles found" /> :
             (roles as any[]).map((r: any, idx: number) => (
              <TableRow key={r.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="text-center text-xs text-muted-foreground">{idx + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <ShieldIcon className="size-3.5 text-primary" />
                    </div>
                    <span className="font-medium text-sm">{r.name}</span>
                    {r.roleType && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0 capitalize">{r.roleType}</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.description ?? "—"}</TableCell>
                <TableCell className="pr-4">
                  <div className="flex items-center justify-end gap-0.5">
                    <Button size="icon" variant="ghost" className="size-7 cursor-pointer" title="Manage permissions"
                      onClick={() => navigate(PATHS.SYSTEM.ROLE_PERMISSIONS(r.id))}>
                      <KeyRoundIcon className="size-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="size-7 cursor-pointer" title="Edit"
                      onClick={() => openEdit(r)}>
                      <PencilIcon className="size-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost"
                      className="size-7 cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
                      title="Delete" onClick={() => setDeleteId(r.id)}>
                      <Trash2Icon className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create Modal */}
      <Dialog open={createOpen} onOpenChange={(v) => { setCreateOpen(v); if (!v) { setCreateForm({ name: "", description: "", roleType: "normal" }); setCreateErr({ name: "" }) } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Role</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input placeholder="e.g. Editor" value={createForm.name}
                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))} />
              {createErr.name && <p className="text-xs text-destructive">{createErr.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Role Type</Label>
              <select value={createForm.roleType} onChange={(e) => setCreateForm((f) => ({ ...f, roleType: e.target.value }))}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm cursor-pointer">
                <option value="normal">Normal</option>
                <option value="secondary">Secondary</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Description <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input placeholder="Role description" value={createForm.description}
                onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" type="button" className="cursor-pointer" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" className="cursor-pointer" disabled={createRole.isPending}>
                {createRole.isPending ? "Saving…" : "Create Role"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editRole} onOpenChange={(v) => !v && setEditRole(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Role</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input placeholder="Role name" value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
              {editErr.name && <p className="text-xs text-destructive">{editErr.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Role Type</Label>
              <select value={editForm.roleType} onChange={(e) => setEditForm((f) => ({ ...f, roleType: e.target.value }))}
                disabled={editRole?.roleType === "primary"}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                <option value="normal">Normal</option>
                <option value="secondary">Secondary</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input placeholder="Role description" value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" type="button" className="cursor-pointer" onClick={() => setEditRole(null)}>Cancel</Button>
              <Button type="submit" className="cursor-pointer" disabled={updateRole.isPending}>
                {updateRole.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null} onOpenChange={(v) => !v && setDeleteId(null)}
        title="Delete Role" description="This will permanently delete the role and remove it from all users."
        onConfirm={() => deleteRole.mutate(deleteId!, { onSuccess: () => setDeleteId(null) })}
        loading={deleteRole.isPending}
      />
    </div>
  )
}
