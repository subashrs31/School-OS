import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import authService from "@/services/auth-services";
import { setAuth, setLoginUser, clearAuth } from "@/store/auth/authSlice";
import { markLoggedIn, clearAuthSession } from "@/utils/auth-session";
import { PATHS } from "@/routes/paths";

export const AUTH_KEYS = {
  me: ["auth", "me"] as const,
};

// ── /auth/me ─────────────────────────────────────────────────────────────────
export function useMe(enabled = true) {
  const dispatch = useDispatch();
  return useQuery({
    queryKey: AUTH_KEYS.me,
    queryFn:  async () => {
      const res  = await authService.me(true);
      const data = res?.data ?? res;
      dispatch(setAuth({
        user:        data.user,
        roles:       data.roles       ?? [],
        permissions: data.permissions ?? { all: false, items: [] },
        organizations: data.organizations ?? [],
      }));
      return data;
    },
    enabled,
    retry:                false,
    staleTime:            5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ── Login ─────────────────────────────────────────────────────────────────────
export function useLogin() {
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (res: any) => {
      const user = res?.data?.user ?? res?.user ?? null;
      if (user) dispatch(setLoginUser(user));
      markLoggedIn();
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.me });
      navigate(PATHS.DASHBOARD, { replace: true });
    },
  });
}

// ── Logout ────────────────────────────────────────────────────────────────────
export function useLogout() {
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      clearAuthSession();
      dispatch(clearAuth());
      queryClient.clear();
      navigate(PATHS.AUTH.LOGIN, { replace: true });
    },
  });
}

// ── Refresh token ─────────────────────────────────────────────────────────────
export function useRefreshToken() {
  return useMutation({
    mutationFn: authService.refresh,
  });
}
