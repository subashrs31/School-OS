import { Navigate } from "react-router-dom"
import { checkSessionCookie } from "@/utils/auth-session"
import { PATHS } from "./paths"

export default function RootRedirect() {
  return checkSessionCookie()
    ? <Navigate to={PATHS.DASHBOARD}   replace />
    : <Navigate to={PATHS.AUTH.LOGIN}  replace />
}
