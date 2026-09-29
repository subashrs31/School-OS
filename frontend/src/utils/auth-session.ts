/**
 * Cookie-mode auth session utilities.
 * Access and refresh tokens live in HttpOnly cookies — never in JS memory,
 * sessionStorage, or localStorage.
 * The readable `isLoggedIn` cookie is used only as a route-guard signal.
 */

const LOGGED_IN_COOKIE = "isLoggedIn";

let unauthorizedHandler: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  unauthorizedHandler = handler;
};

export const triggerUnauthorized = () => {
  clearAuthSession();
  unauthorizedHandler?.();
};

export const checkSessionCookie = (): boolean => {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) => c.trim().startsWith(`${LOGGED_IN_COOKIE}=true`));
};

export const hasLoggedInCookie = checkSessionCookie;

export const markLoggedIn = () => {
  document.cookie = `${LOGGED_IN_COOKIE}=true; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`;
};

export const clearAuthSession = () => {
  if (typeof document !== "undefined") {
    document.cookie = `${LOGGED_IN_COOKIE}=; Path=/; Max-Age=-99999999; SameSite=Lax`;
  }
};
