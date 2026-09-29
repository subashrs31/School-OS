/** Token helpers — do not persist tokens in session/local storage. */

export const authTokenStorage = {
  setAccessToken: (_token: string) => {
    /* no-op — backend HttpOnly cookies only */
  },
  getAccessToken: () => null as string | null,
  removeAccessToken: () => {
    /* no-op */
  },
  setRefreshToken: (_token: string) => {
    /* no-op */
  },
  getRefreshToken: () => null as string | null,
  removeRefreshToken: () => {
    /* no-op */
  },
  getIsAuth: () => false,
  clearAll: () => {
    try {
      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("refresh_token");
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      sessionStorage.removeItem("users");
    } catch {
      /* ignore */
    }
  },
};

export const secureStorage = {
  setItem: (key: string, value: any) => {
    sessionStorage.setItem(key, JSON.stringify(value));
  },
  getItem: (key: string) => {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  removeItem: (key: string) => sessionStorage.removeItem(key),
};
