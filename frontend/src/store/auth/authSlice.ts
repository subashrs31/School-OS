import { createSlice } from "@reduxjs/toolkit";

export interface AuthRole {
  id:        number;
  name:      string;
  slug:      string;
  roleType:  "primary" | "secondary" | "normal";
  isSystem:  boolean;
  scopeType: string;
  scopeId:   number | null;
}

export interface AuthPermissions {
  all:   boolean;
  items: string[];
}

export interface AuthUser {
  id:         number;
  uuid:       string;
  name:       string | null;
  email:      string;
  isActive:   boolean;
  verifiedAt: string | null;
  lastLogin:  string | null;
}

export interface AuthOrganization {
  organizationId:   number;
  organizationName: string | null;
  branchId:         number | null;
  branchName:       string | null;
  isPrimary:        boolean;
}

interface AuthState {
  user:            AuthUser | null;
  roles:           AuthRole[];
  permissions:     AuthPermissions;
  organizations:   AuthOrganization[];
  isAuthenticated: boolean;
  isInitialized:   boolean;
}

const initialState: AuthState = {
  user:            null,
  roles:           [],
  permissions:     { all: false, items: [] },
  organizations:   [],
  isAuthenticated: false,
  isInitialized:   false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action: { payload: { user: AuthUser; roles: AuthRole[]; permissions: AuthPermissions; organizations?: AuthOrganization[] } }) => {
      state.user            = action.payload.user;
      state.roles           = action.payload.roles;
      state.permissions     = action.payload.permissions;
      state.organizations   = action.payload.organizations ?? [];
      state.isAuthenticated = true;
      state.isInitialized   = true;
    },
    setLoginUser: (state, action: { payload: AuthUser }) => {
      state.user            = action.payload;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.user            = null;
      state.roles           = [];
      state.permissions     = { all: false, items: [] };
      state.organizations   = [];
      state.isAuthenticated = false;
      state.isInitialized   = true;
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
  },
});

export const { setAuth, setLoginUser, clearAuth, setInitialized } = authSlice.actions;
export default authSlice.reducer;
