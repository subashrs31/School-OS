import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table"
import { usePermissions, useCreatePermission, useUpdatePermission, useDeletePermission } from "@/hooks/iam/useIam"
import { PlusIcon, Trash2Icon, PencilIcon, KeyIcon } from "lucide-react"
import { TableSkeleton, EmptyRow, ConfirmDialog } from "./shared"

const ACTIONS = ['view', 'create', 'edit', 'delete', 'import', 'export', 'approve', 'reject']

const BLANK_FORM = { name: "", resource: "", action: "view", description: "", isSystem: false }
const BLANK_ERR  = { name: "", resource: "" }

export function PermissionsTab() {
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editPerm, setEditPerm]     = React.useState<any>(null)
  const [deleteId, setDeleteId]     = React.useState<number | null>(null)
  const [createForm, setCreateForm] = React.useState(BLANK_FORM)
  const [createErr, setCreateErr]   = React.useState(BLANK_ERR)
  const [editForm, setEditForm]     = React.useState(BLANK_FORM)
  const [editErr, setEditErr]       = React.useState(BLANK_ERR)

  const { data: permissions = [], isLoading } = usePermissions()
  const createPermission = useCreatePermission()
  const updatePermission = useUpdatePermission()
  const deletePermission = useDeletePermission()

  function validatePerm(form: { name: string; resource: string }, setErr: (e: typeof BLANK_ERR) => void) {
    const e = { name: "", resource: "" }
    if (!form.name.trim())     e.name = "Name is required"
    if (!form.resource.trim()) e.resource = "Resource is required"
    setErr(e)
    return !e.name && !e.resource
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!validatePerm(createForm, setCreateErr)) return
    createPermission.mutate(createForm, {
      onSuccess: () => { setCreateOpen(false); setCreateForm(BLANK_FORM); setCreateErr(BLANK_ERR) },
    })
  }

  function openEdit(p: any) {
    setEditPerm(p)
    setEditForm({ name: p.name ?? "", resource: p.resource ?? "", action: p.action ?? "view", description: p.description ?? "", isSystem: p.isSystem ?? false })
    setEditErr(BLANK_ERR)
  }

  function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!validatePerm(editForm, setEditErr)) return
    updatePermission.mutate({ id: editPerm.id, data: editForm }, { onSuccess: () => setEditPerm(null) })
  }

  function ActionSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm cursor-pointer">
        {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
      </select>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" className="cursor-pointer" onClick={() => setCreateOpen(true)}>
          <PlusIcon className="size-3.5" /> Add Permission
        </Button>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-10 text-center">#</TableHead>
              <TableHead>Permission</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-24 text-right pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <TableSkeleton cols={6} /> :
             (permissions as any[]).length === 0 ? <EmptyRow cols={6} message="No permissions found" /> :
             (permissions as any[]).map((p: any, idx: number) => (
              <TableRow key={p.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="text-center text-xs text-muted-foreground">{idx + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <KeyIcon className="size-3.5 text-primary" />
                    </div>
                    <code className="text-xs rounded bg-muted px-1.5 py-0.5">{p.slug ?? p.name}</code>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground capitalize">{p.resource}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs capitalize">{p.action}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{p.description || "—"}</TableCell>
                <TableCell className="pr-4">
                  <div className="flex items-center justify-end gap-0.5">
                    <Button size="icon" variant="ghost" className="size-7 cursor-pointer" title="Edit"
                      onClick={() => openEdit(p)}>
                      <PencilIcon className="size-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost"
                      className="size-7 cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
                      title="Delete" onClick={() => setDeleteId(p.id)}>
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
      <Dialog open={createOpen} onOpenChange={(v) => { setCreateOpen(v); if (!v) { setCreateForm(BLANK_FORM); setCreateErr(BLANK_ERR) } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Permission</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input placeholder="e.g. Create User" value={createForm.name}
                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))} />
              {createErr.name && <p className="text-xs text-destructive">{createErr.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Resource</Label>
              <Input placeholder="e.g. user" value={createForm.resource}
                onChange={(e) => setCreateForm((f) => ({ ...f, resource: e.target.value }))} />
              {createErr.resource && <p className="text-xs text-destructive">{createErr.resource}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Action</Label>
              <ActionSelect value={createForm.action} onChange={(v) => setCreateForm((f) => ({ ...f, action: v }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Slug preview</Label>
              <p className="text-xs font-mono rounded bg-muted px-2 py-1.5 text-muted-foreground">
                {createForm.resource && createForm.action ? `${createForm.resource}:${createForm.action}` : "—"}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Description <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input placeholder="What this permission allows" value={createForm.description}
                onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <Checkbox checked={createForm.isSystem}
                onCheckedChange={(v) => setCreateForm((f) => ({ ...f, isSystem: !!v }))} />
              <span className="text-sm">System permission</span>
            </label>
            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" type="button" className="cursor-pointer" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" className="cursor-pointer" disabled={createPermission.isPending}>
                {createPermission.isPending ? "Saving…" : "Create Permission"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editPerm} onOpenChange={(v) => !v && setEditPerm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Permission</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input placeholder="e.g. Create User" value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
              {editErr.name && <p className="text-xs text-destructive">{editErr.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Resource</Label>
              <Input placeholder="e.g. user" value={editForm.resource}
                onChange={(e) => setEditForm((f) => ({ ...f, resource: e.target.value }))} />
              {editErr.resource && <p className="text-xs text-destructive">{editErr.resource}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Action</Label>
              <ActionSelect value={editForm.action} onChange={(v) => setEditForm((f) => ({ ...f, action: v }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Slug preview</Label>
              <p className="text-xs font-mono rounded bg-muted px-2 py-1.5 text-muted-foreground">
                {editForm.resource && editForm.action ? `${editForm.resource}:${editForm.action}` : "—"}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input placeholder="Description" value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <Checkbox checked={editForm.isSystem} disabled={editPerm?.isSystem}
                onCheckedChange={(v) => setEditForm((f) => ({ ...f, isSystem: !!v }))} />
              <span className="text-sm">System permission</span>
            </label>
            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" type="button" className="cursor-pointer" onClick={() => setEditPerm(null)}>Cancel</Button>
              <Button type="submit" className="cursor-pointer" disabled={updatePermission.isPending}>
                {updatePermission.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null} onOpenChange={(v) => !v && setDeleteId(null)}
        title="Delete Permission" description="This will permanently delete the permission and revoke it from all roles and users."
        onConfirm={() => deletePermission.mutate(deleteId!, { onSuccess: () => setDeleteId(null) })}
        loading={deletePermission.isPending}
      />
    </div>
  )
}
