import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import userService, { type CreateUserPayload, type UpdateUserPayload } from "@/services/user-service";

export const USER_KEYS = {
  all:    ["users"] as const,
  detail: (id: number) => ["users", id] as const,
};

const extractUsers = (r: any) => r?.data?.users ?? r?.data ?? r ?? [];

export function useUsers() {
  return useQuery({
    queryKey: USER_KEYS.all,
    queryFn:  () => userService.list().then(extractUsers),
    staleTime: 2 * 60 * 1000,
  });
}

export function useUser(id: number) {
  return useQuery({
    queryKey: USER_KEYS.detail(id),
    queryFn:  () => userService.get(id).then((r: any) => r?.data?.user ?? r?.data ?? r),
    enabled:  !!id,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserPayload) => userService.create(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: USER_KEYS.all }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserPayload }) => userService.update(id, data),
    onSuccess:  (_r, { id }) => {
      qc.invalidateQueries({ queryKey: USER_KEYS.all });
      qc.invalidateQueries({ queryKey: USER_KEYS.detail(id) });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userService.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: USER_KEYS.all }),
  });
}

export function useToggleUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userService.statusChange(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: USER_KEYS.all }),
  });
}
