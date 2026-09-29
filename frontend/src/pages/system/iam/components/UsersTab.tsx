import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table"
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useToggleUserStatus } from "@/hooks/iam/useUsers"
import { PATHS } from "@/routes/paths"
import { PlusIcon, Trash2Icon, PencilIcon, SearchIcon, ShieldCheckIcon } from "lucide-react"
import { ToggleSwitch, TableSkeleton, EmptyRow, ConfirmDialog } from "./shared"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const BLANK_CREATE = { name: "", email: "", password: "", defaultPassword: true, autoUuid: true, uuid: "" }
const BLANK_CREATE_ERR = { name: "", email: "", password: "", uuid: "" }
const BLANK_EDIT_ERR = { name: "", email: "", uuid: "", newPassword: "" }

export function UsersTab() {
  const [search, setSearch]         = React.useState("")
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editUser, setEditUser]     = React.useState<any>(null)
  const [deleteId, setDeleteId]     = React.useState<number | null>(null)
  const [createForm, setCreateForm] = React.useState(BLANK_CREATE)
  const [createErr, setCreateErr]   = React.useState(BLANK_CREATE_ERR)
  const [editForm, setEditForm]     = React.useState({ name: "", email: "", uuid: "", setPassword: false, newPassword: "" })
  const [editErr, setEditErr]       = React.useState(BLANK_EDIT_ERR)

  const { data: users = [], isLoading } = useUsers()
  const createUser   = useCreateUser()
  const updateUser   = useUpdateUser()
  const deleteUser   = useDeleteUser()
  const toggleStatus = useToggleUserStatus()
  const navigate     = useNavigate()

  const filtered = (users as any[]).filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  function validateCreate() {
    const e = { name: "", email: "", password: "", uuid: "" }
    if (!createForm.name.trim())                                            e.name = "Name is required"
    if (createForm.email && !EMAIL_RE.test(createForm.email))               e.email = "Enter a valid email"
    if (!createForm.defaultPassword && !createForm.password)                e.password = "Password is required"
    else if (!createForm.defaultPassword && createForm.password.length < 6) e.password = "Minimum 6 characters"
    if (!createForm.autoUuid && !createForm.uuid.trim())                    e.uuid = "User ID is required"
    setCreateErr(e)
    return !Object.values(e).some(Boolean)
  }

  function validateEdit() {
    const e = { name: "", email: "", uuid: "", newPassword: "" }
    if (!editForm.name.trim())                             e.name = "Name is required"
    if (editForm.email && !EMAIL_RE.test(editForm.email))  e.email = "Enter a valid email"
    if (editForm.setPassword) {
      if (!editForm.newPassword)                e.newPassword = "Password is required"
      else if (editForm.newPassword.length < 6) e.newPassword = "Minimum 6 characters"
    }
    setEditErr(e)
    return !Object.values(e).some(Boolean)
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!validateCreate()) return
    const { defaultPassword, password, autoUuid, uuid, ...rest } = createForm
    const payload: any = {
      ...rest,
      ...(defaultPassword ? {} : { password }),
      ...(autoUuid ? {} : { uuid }),
    }
    if (!payload.email) delete payload.email
    createUser.mutate(payload, {
      onSuccess: () => { setCreateOpen(false); setCreateForm(BLANK_CREATE); setCreateErr(BLANK_CREATE_ERR) },
    })
  }

  function openEdit(u: any) {
    setEditUser(u)
    setEditForm({ name: u.name ?? "", email: u.email ?? "", uuid: u.uuid ?? "", setPassword: false, newPassword: "" })
    setEditErr(BLANK_EDIT_ERR)
  }

  function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateEdit()) return
    const { setPassword, newPassword, ...base } = editForm
    const data: any = { name: base.name }
    if (base.uuid) data.uuid = base.uuid
    if (base.email) data.email = base.email
    if (setPassword && newPassword) data.password = newPassword
    updateUser.mutate({ id: editUser.id, data }, { onSuccess: () => setEditUser(null) })
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-64">
          <SearchIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input className="h-8 pl-8 text-sm" placeholder="Search users…" value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button size="sm" className="cursor-pointer" onClick={() => setCreateOpen(true)}>
          <PlusIcon className="size-3.5" /> Add User
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-10 text-center">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-28 text-right pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <TableSkeleton cols={6} /> :
             filtered.length === 0 ? <EmptyRow cols={6} message="No users found" /> :
             filtered.map((u: any, idx: number) => (
              <TableRow key={u.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="text-center text-xs text-muted-foreground">{idx + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                      {(u.name ?? u.email ?? "?")[0].toUpperCase()}
                    </div>
                    <span className="font-medium text-sm">{u.name ?? "—"}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(u.roles ?? []).length === 0
                      ? <span className="text-xs text-muted-foreground">No roles</span>
                      : (u.roles ?? []).map((r: any) => (
                          <Badge key={r.id ?? r.slug} variant="secondary" className="text-xs px-1.5 py-0">
                            {r.name}
                          </Badge>
                        ))
                    }
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <ToggleSwitch
                      checked={!!u.isActive}
                      disabled={toggleStatus.isPending}
                      onChange={() => toggleStatus.mutate(u.id)}
                    />
                    <span className={`text-xs font-medium ${u.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="pr-4">
                  <div className="flex items-center justify-end gap-0.5">
                    <Button size="icon" variant="ghost" className="size-7 cursor-pointer"
                      title="Assign roles & permissions"
                      onClick={() => navigate(PATHS.SYSTEM.USER_PERMISSIONS(u.id))}>
                      <ShieldCheckIcon className="size-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="size-7 cursor-pointer" title="Edit"
                      onClick={() => openEdit(u)}>
                      <PencilIcon className="size-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost"
                      className="size-7 cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
                      title="Delete" onClick={() => setDeleteId(u.id)}>
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
      <Dialog open={createOpen} onOpenChange={(v) => { setCreateOpen(v); if (!v) { setCreateForm(BLANK_CREATE); setCreateErr(BLANK_CREATE_ERR) } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add User</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input placeholder="Full name" value={createForm.name}
                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))} />
              {createErr.name && <p className="text-xs text-destructive">{createErr.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Email <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input type="email" placeholder="email@example.com" value={createForm.email}
                onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))} />
              {createErr.email && <p className="text-xs text-destructive">{createErr.email}</p>}
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <Checkbox checked={createForm.defaultPassword}
                onCheckedChange={(v) => setCreateForm((f) => ({ ...f, defaultPassword: !!v, password: "" }))} />
              <span className="text-sm">Use default password</span>
            </label>
            {!createForm.defaultPassword && (
              <div className="space-y-1.5">
                <Label>Password</Label>
                <Input type="password" placeholder="Min. 6 characters" value={createForm.password}
                  onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))} />
                {createErr.password && <p className="text-xs text-destructive">{createErr.password}</p>}
              </div>
            )}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <Checkbox checked={createForm.autoUuid}
                onCheckedChange={(v) => setCreateForm((f) => ({ ...f, autoUuid: !!v, uuid: "" }))} />
              <span className="text-sm">Auto-generate User ID</span>
            </label>
            {!createForm.autoUuid && (
              <div className="space-y-1.5">
                <Label>User ID</Label>
                <Input placeholder="e.g. USR00010" value={createForm.uuid}
                  onChange={(e) => setCreateForm((f) => ({ ...f, uuid: e.target.value }))} />
                {createErr.uuid && <p className="text-xs text-destructive">{createErr.uuid}</p>}
              </div>
            )}
            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" type="button" className="cursor-pointer"
                onClick={() => { setCreateOpen(false); setCreateForm(BLANK_CREATE); setCreateErr(BLANK_CREATE_ERR) }}>
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer" disabled={createUser.isPending}>
                {createUser.isPending ? "Saving…" : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editUser} onOpenChange={(v) => !v && setEditUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input placeholder="Full name" value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
              {editErr.name && <p className="text-xs text-destructive">{editErr.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Email <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input type="email" placeholder="email@example.com" value={editForm.email}
                onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
              {editErr.email && <p className="text-xs text-destructive">{editErr.email}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>User ID <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input placeholder="e.g. USR00010" value={editForm.uuid}
                onChange={(e) => setEditForm((f) => ({ ...f, uuid: e.target.value }))} />
              {editErr.uuid && <p className="text-xs text-destructive">{editErr.uuid}</p>}
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <Checkbox checked={editForm.setPassword}
                onCheckedChange={(v) => setEditForm((f) => ({ ...f, setPassword: !!v, newPassword: "" }))} />
              <span className="text-sm">Set new password</span>
            </label>
            {editForm.setPassword && (
              <div className="space-y-1.5">
                <Label>New Password</Label>
                <Input type="password" placeholder="Min. 6 characters" value={editForm.newPassword}
                  onChange={(e) => setEditForm((f) => ({ ...f, newPassword: e.target.value }))} />
                {editErr.newPassword && <p className="text-xs text-destructive">{editErr.newPassword}</p>}
              </div>
            )}
            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" type="button" className="cursor-pointer" onClick={() => setEditUser(null)}>Cancel</Button>
              <Button type="submit" className="cursor-pointer" disabled={updateUser.isPending}>
                {updateUser.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null} onOpenChange={(v) => !v && setDeleteId(null)}
        title="Delete User" description="This will permanently delete the user. This action cannot be undone."
        onConfirm={() => deleteUser.mutate(deleteId!, { onSuccess: () => setDeleteId(null) })}
        loading={deleteUser.isPending}
      />
    </div>
  )
}
