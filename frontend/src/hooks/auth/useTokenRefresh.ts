import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import authService from "@/services/auth-services";
import { AUTH_KEYS } from "./useAuth";

const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // refresh every 10 min

/**
 * In cookie mode the access token is HttpOnly — we cannot read it from JS.
 * Instead, proactively call POST /auth/refresh on an interval so the
 * access_token cookie is renewed before it expires.
 */
export function useTokenRefresh() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        await authService.refresh();
        queryClient.invalidateQueries({ queryKey: AUTH_KEYS.me });
      } catch {
        // 401 from refresh → axios interceptor handles redirect
      }
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(id);
  }, [queryClient]);
}
