import { Navigate, Outlet } from "react-router-dom"
import { useDispatch } from "react-redux"
import { useQuery } from "@tanstack/react-query"
import { checkSessionCookie } from "@/utils/auth-session"
import { setAuth, clearAuth } from "@/store/auth/authSlice"
import { useAppSelector } from "@/store/store"
import authService from "@/services/auth-services"
import { AUTH_KEYS } from "@/hooks/auth/useAuth"
import { useTokenRefresh } from "@/hooks/auth/useTokenRefresh"
import Spinner from "@/layouts/shared/spinner/Spinner"
import { PATHS } from "./paths"

export default function PrivateRouter() {
  useTokenRefresh()
  const dispatch        = useDispatch()
  const isInitialized   = useAppSelector((s) => s.auth.isInitialized)
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated)
  const hasCookie       = checkSessionCookie()

  useQuery({
    queryKey: AUTH_KEYS.me,
    queryFn:  async () => {
      try {
        const res  = await authService.me(true)
        const data = res?.data ?? res
        dispatch(setAuth({
          user:        data.user,
          roles:       data.roles       ?? [],
          permissions: data.permissions ?? { all: false, items: [] },
          organizations: data.organizations ?? [],
        }))
        return data
      } catch {
        dispatch(clearAuth())
        return null
      }
    },
    enabled:              hasCookie && !isInitialized,
    retry:                false,
    staleTime:            5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  // No session cookie → go to login immediately (no need to wait)
  if (!hasCookie) return <Navigate to={PATHS.AUTH.LOGIN} replace />
  // Cookie exists but /auth/me hasn't resolved yet → show spinner
  if (!isInitialized) return <Spinner />
  // /auth/me failed (token invalid/expired) → go to login
  if (!isAuthenticated) return <Navigate to={PATHS.AUTH.LOGIN} replace />

  return <Outlet />
}
