const API_BASE_URL = import.meta.env.VITE_REACT_CLIENT_URL as string;

const apiConstants = {
  API_BASE_URL,

  AUTH: {
    LOGIN:               "auth/login",
    LOGOUT:              "auth/logout",
    REFRESH:             "auth/refresh",
    ME:                  "auth/me",
    REGISTER:            "auth/register",
    FORGOT_PASSWORD:     "auth/forgot-password",
    RESET_PASSWORD:      (token: string) => `auth/reset-password/${token}`,
    VERIFY_RESET_TOKEN:  (token: string) => `auth/verify-reset-token/${token}`,
  },

  USER: {
    LIST:            "users",
    CREATE:          "users",
    GET:             (id: number) => `users/${id}`,
    UPDATE:          (id: number) => `users/${id}`,
    DELETE:          (id: number) => `users/${id}`,
    STATUS_CHANGE:   (id: number) => `users/status-change/${id}`,
    UPDATE_PROFILE:  "users/profile",
    CHANGE_PASSWORD: "users/change-password",
    VALIDATE_IMPORT: "users/validate-import",
    IMPORT:          "users/import",
  },

  SYSTEM: {
    IAM: {
      // Roles
      ROLES:              "iam/roles",
      ROLE_CREATE:        "iam/roles",
      ROLE_GET:           (id: number) => `iam/roles/${id}`,
      ROLE_UPDATE:        (id: number) => `iam/roles/${id}`,
      ROLE_DELETE:        (id: number) => `iam/roles/${id}`,
      ROLES_ASSIGNABLE:   "iam/roles/assignable",

      // Permissions
      PERMISSIONS:        "iam/permissions",
      PERMISSIONS_ACTIONS: "iam/permissions/actions",
      PERMISSION_CREATE:  "iam/permissions",
      PERMISSION_GET:     (id: number) => `iam/permissions/${id}`,
      PERMISSION_UPDATE:  (id: number) => `iam/permissions/${id}`,
      PERMISSION_DELETE:  (id: number) => `iam/permissions/${id}`,

      // Role ↔ Permissions
      ROLE_PERMISSIONS:       (roleId: number) => `iam/roles/${roleId}/permissions`,
      ROLE_PERMISSIONS_SYNC:  (roleId: number) => `iam/roles/${roleId}/permissions/sync`,
      ROLE_PERMISSION_REVOKE: (roleId: number, permId: number) => `iam/roles/${roleId}/permissions/${permId}`,

      // User ↔ Roles
      USER_ROLES:       (userId: number) => `iam/users/${userId}/roles`,
      USER_ROLES_SYNC:  (userId: number) => `iam/users/${userId}/roles/sync`,
      USER_ROLE_REVOKE: (userId: number, roleId: number) => `iam/users/${userId}/roles/${roleId}`,

      // User ↔ Permissions
      USER_PERMISSIONS:       (userId: number) => `iam/users/${userId}/permissions`,
      USER_PERMISSIONS_SYNC:  (userId: number) => `iam/users/${userId}/permissions/sync`,
      USER_PERMISSION_REVOKE: (userId: number, permId: number) => `iam/users/${userId}/permissions/${permId}`,
    },
  },

  ORGANIZATION: {
    LIST:   "organizations",
    CREATE: "organizations",
    GET:    (id: number) => `organizations/${id}`,
    UPDATE: (id: number) => `organizations/${id}`,

    BRANCHES:       (orgId: number) => `organizations/${orgId}/branches`,
    BRANCH_GET:     (orgId: number, branchId: number) => `organizations/${orgId}/branches/${branchId}`,
    BRANCH_UPDATE:  (orgId: number, branchId: number) => `organizations/${orgId}/branches/${branchId}`,
    BRANCH_DELETE:  (orgId: number, branchId: number) => `organizations/${orgId}/branches/${branchId}`,

    STAFF:          (orgId: number) => `organizations/${orgId}/staff`,
    STAFF_GET:      (orgId: number, staffId: number) => `organizations/${orgId}/staff/${staffId}`,
    STAFF_UPDATE:   (orgId: number, staffId: number) => `organizations/${orgId}/staff/${staffId}`,
    DESIGNATIONS:        (orgId: number) => `organizations/${orgId}/staff/designations`,
    DESIGNATION_UPDATE:  (orgId: number, dId: number) => `organizations/${orgId}/staff/designations/${dId}`,

    STUDENTS:       (orgId: number) => `organizations/${orgId}/students`,
    STUDENT_GET:    (orgId: number, studentId: number) => `organizations/${orgId}/students/${studentId}`,
    STUDENT_UPDATE: (orgId: number, studentId: number) => `organizations/${orgId}/students/${studentId}`,
    STUDENT_ENROLL: (orgId: number) => `organizations/${orgId}/students/enroll`,

    ACADEMIC_YEARS:       (orgId: number) => `organizations/${orgId}/academics/years`,
    ACADEMIC_YEAR_UPDATE: (orgId: number, yearId: number) => `organizations/${orgId}/academics/years/${yearId}`,
    CLASSES:              (orgId: number) => `organizations/${orgId}/academics/classes`,
    CLASS_UPDATE:         (orgId: number, classId: number) => `organizations/${orgId}/academics/classes/${classId}`,
    SECTIONS:             (orgId: number, classId: number) => `organizations/${orgId}/academics/classes/${classId}/sections`,
    SECTION_UPDATE:       (orgId: number, classId: number, sectionId: number) => `organizations/${orgId}/academics/classes/${classId}/sections/${sectionId}`,
    SUBJECTS:             (orgId: number) => `organizations/${orgId}/academics/subjects`,
    SUBJECT_UPDATE:       (orgId: number, subjectId: number) => `organizations/${orgId}/academics/subjects/${subjectId}`,
    CLASS_TEACHERS:       (orgId: number) => `organizations/${orgId}/academics/assignments/class-teachers`,
    SUBJECT_TEACHERS:     (orgId: number) => `organizations/${orgId}/academics/assignments/subject-teachers`,
    EXAMS:                (orgId: number) => `organizations/${orgId}/academics/exams`,
    EXAM_UPDATE:          (orgId: number, examId: number) => `organizations/${orgId}/academics/exams/${examId}`,
    MARKS:                (orgId: number) => `organizations/${orgId}/academics/marks`,
  },
} as const;

export default apiConstants;
