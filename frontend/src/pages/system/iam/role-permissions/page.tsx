import { useParams, useNavigate } from "react-router-dom"
import { usePermissions, useRolePermissions, useSyncRolePermissions, useRoles } from "@/hooks/iam/useIam"
import { PATHS } from "@/routes/paths"
import { PermissionEditor } from "../components/PermissionEditor"

export default function RolePermissionsPage() {
  const { id } = useParams<{ id: string }>()
  const roleId  = Number(id)
  const navigate = useNavigate()

  const { data: allPerms = [],   isLoading: loadingPerms } = usePermissions()
  const { data: rolePerms = [],  isLoading: loadingAssigned } = useRolePermissions(roleId)
  const { data: roles = [] }     = useRoles()
  const syncPerms = useSyncRolePermissions()

  const role = (roles as any[]).find((r: any) => r.id === roleId)
  const assignedIds = (rolePerms as any[]).map((p: any) => p.id)

  return (
    <PermissionEditor
      subjectName={role?.name ?? `Role #${roleId}`}
      subjectType="Role"
      allPerms={allPerms as any[]}
      assignedIds={assignedIds}
      isLoading={loadingPerms || loadingAssigned}
      isSaving={syncPerms.isPending}
      onSave={(ids) =>
        syncPerms.mutate(
          { roleId, permissionIds: ids },
          { onSuccess: () => navigate(PATHS.SYSTEM.IAM) }
        )
      }
    />
  )
}
