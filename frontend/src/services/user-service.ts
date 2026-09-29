import { apiGet, apiPost, apiUpdate, apiDelete } from "./axios-instance";
import apiConstants from "./api-constants";

export interface CreateUserPayload {
  name: string;
  email?: string;
  password?: string;
  uuid?: string;
}
export interface UpdateUserPayload {
  name?: string;
  uuid?: string;
  password?: string;
}

const userService = {
  list:           ()                              => apiGet(apiConstants.USER.LIST),
  get:            (id: number)                    => apiGet(apiConstants.USER.GET(id)),
  create:         (data: CreateUserPayload)       => apiPost(apiConstants.USER.CREATE, data),
  update:         (id: number, data: UpdateUserPayload) => apiUpdate(apiConstants.USER.UPDATE(id), data),
  delete:         (id: number)                    => apiDelete(apiConstants.USER.DELETE(id)),
  statusChange:   (id: number)                    => apiPost(apiConstants.USER.STATUS_CHANGE(id)),
  updateProfile:  (data: Partial<UpdateUserPayload>) => apiUpdate(apiConstants.USER.UPDATE_PROFILE, data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiPost(apiConstants.USER.CHANGE_PASSWORD, data),
};

export default userService;
