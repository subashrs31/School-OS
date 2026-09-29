import { apiPost, apiGet } from "./axios-instance";
import apiConstants from "./api-constants";

export interface LoginPayload  { username: string; password: string }
export interface LoginResponse { data: { accessToken?: string; user?: any }; message: string; success: boolean }

const authService = {
  login:   (payload: LoginPayload)  => apiPost(apiConstants.AUTH.LOGIN, payload),
  logout:  ()                       => apiPost(apiConstants.AUTH.LOGOUT, undefined, { silentError: true, skipAuthRedirect: true }),
  refresh: ()                       => apiPost(apiConstants.AUTH.REFRESH, undefined, { silentError: true, skipAuthRedirect: true }),
  me:      (silent = false)         => apiGet(apiConstants.AUTH.ME, { silentError: silent, skipAuthRedirect: silent }),
};

export default authService;
