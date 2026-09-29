import { Navigate, Outlet } from "react-router-dom"
import { checkSessionCookie } from "@/utils/auth-session"
import { PATHS } from "./paths"

const PublicRouter = () => {
  if (checkSessionCookie()) {
    return <Navigate to={PATHS.DASHBOARD} replace />
  }
  return <Outlet />
}

export default PublicRouter
