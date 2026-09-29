import { createHashRouter, createBrowserRouter, Navigate } from "react-router-dom"
import PublicRouter from "./PublicRouter"
import PrivateRouter from "./PrivateRouter"
import RootRedirect from "./RootRedirect"
import { routerType } from "./routeConfig"
import { PATHS } from "./paths"
import ErrorPage from "@/pages/error/page"

const routes = [
  {
    path: PATHS.ROOT,
    element: <RootRedirect />,
  },
  // Public — /auth/*
  {
    path: PATHS.AUTH.ROOT,
    element: <PublicRouter />,
    children: [
      {
        path: PATHS.AUTH.LOGIN,
        lazy: async () => {
          const m = await import("@/pages/auth/login/page")
          return { Component: m.default }
        },
      },
      {
        path: PATHS.AUTH.REGISTER,
        lazy: async () => {
          const m = await import("@/pages/auth/login/page") // swap when register page exists
          return { Component: m.default }
        },
      },
    ],
  },
  // Private
  {
    element: <PrivateRouter />,
    children: [
      {
        path: PATHS.DASHBOARD,
        lazy: async () => {
          const m = await import("@/pages/dashboard/page")
          return { Component: m.default }
        },
      },
      {
        path: PATHS.SYSTEM.IAM,
        lazy: async () => {
          const m = await import("@/pages/system/iam/page")
          return { Component: m.default }
        },
      },
      {
        path: "/iam/roles/:id/permissions",
        lazy: async () => {
          const m = await import("@/pages/system/iam/role-permissions/page")
          return { Component: m.default }
        },
      },
      {
        path: "/iam/users/:id/permissions",
        lazy: async () => {
          const m = await import("@/pages/system/iam/user-permissions/page")
          return { Component: m.default }
        },
      },
      // ── Organization routes ──────────────────────────────────────────────────
      {
        path: PATHS.ORGANIZATION.ROOT,
        lazy: async () => {
          const m = await import("@/pages/organization/organization-list/organization-list-page")
          return { Component: m.default }
        },
      },
      {
        path: PATHS.ORGANIZATION.CREATE,
        lazy: async () => {
          const m = await import("@/pages/organization/organization-create/organization-create-page")
          return { Component: m.default }
        },
      },
      {
        path: "/organization/:organizationId",
        lazy: async () => {
          const m = await import("@/pages/organization/organization-details/organization-details-page")
          return { Component: m.default }
        },
      },
      {
        path: "/organization/:organizationId/edit",
        lazy: async () => {
          const m = await import("@/pages/organization/organization-edit/organization-edit-page")
          return { Component: m.default }
        },
      },
      {
        path: "/organization/:organizationId/branches",
        lazy: async () => {
          const m = await import("@/pages/organization/branch/branch-list-page")
          return { Component: m.default }
        },
      },
      {
        path: "/organization/:organizationId/staff",
        lazy: async () => {
          const m = await import("@/pages/organization/staff/staff-list-page")
          return { Component: m.default }
        },
      },
      {
        path: "/organization/:organizationId/students",
        lazy: async () => {
          const m = await import("@/pages/organization/students/student-list-page")
          return { Component: m.default }
        },
      },
      {
        path: "/organization/:organizationId/academics",
        lazy: async () => {
          const m = await import("@/pages/organization/academics/academics-page")
          return { Component: m.default }
        },
      },
    ],
  },
  // Error pages — single component, different type prop
  { path: PATHS.ERROR.NOT_FOUND,    element: <ErrorPage type="not-found" /> },
  { path: PATHS.ERROR.UNAUTHORIZED, element: <ErrorPage type="unauthorized" /> },
  { path: PATHS.ERROR.SERVER_ERROR, element: <ErrorPage type="server-error" /> },
  // Catch-all — unknown routes → 404
  { path: "*", element: <Navigate to={PATHS.ERROR.NOT_FOUND} replace /> },
]

export const router =
  routerType === "hash"
    ? createHashRouter(routes)
    : createBrowserRouter(routes, { basename: import.meta.env.BASE_URL ?? "/" })
