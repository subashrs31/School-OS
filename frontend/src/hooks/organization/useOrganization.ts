import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import organizationService from "@/services/organization-service";

export const ORG_KEYS = {
  all:             ["organizations"] as const,
  detail:          (id: number) => ["organizations", id] as const,
  branches:        (orgId: number) => ["organizations", orgId, "branches"] as const,
  staff:           (orgId: number) => ["organizations", orgId, "staff"] as const,
  designations:    (orgId: number) => ["organizations", orgId, "designations"] as const,
  students:        (orgId: number) => ["organizations", orgId, "students"] as const,
  years:           (orgId: number) => ["organizations", orgId, "years"] as const,
  classes:         (orgId: number) => ["organizations", orgId, "classes"] as const,
  subjects:        (orgId: number) => ["organizations", orgId, "subjects"] as const,
  classTeachers:   (orgId: number) => ["organizations", orgId, "class-teachers"] as const,
  subjectTeachers: (orgId: number) => ["organizations", orgId, "subject-teachers"] as const,
  exams:           (orgId: number) => ["organizations", orgId, "exams"] as const,
  marks:           (orgId: number) => ["organizations", orgId, "marks"] as const,
};

const extract    = (key: string) => (r: any) => r?.data?.[key] ?? r?.data ?? r ?? [];
const extractOne = (key: string) => (r: any) => r?.data?.[key] ?? r?.data ?? r;

// ── Organizations ─────────────────────────────────────────────────────────────
export function useOrganizations() {
  return useQuery({
    queryKey: ORG_KEYS.all,
    queryFn:  () => organizationService.list().then(extract("organizations")),
    staleTime: 2 * 60 * 1000,
  });
}

export function useOrganization(id: number) {
  return useQuery({
    queryKey: ORG_KEYS.detail(id),
    queryFn:  () => organizationService.get(id).then(extractOne("organization")),
    enabled:  !!id,
  });
}

export function useCreateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => organizationService.create(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ORG_KEYS.all }),
  });
}

export function useUpdateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      organizationService.update(id, data),
    onSuccess: (_r, { id }) => {
      qc.invalidateQueries({ queryKey: ORG_KEYS.all });
      qc.invalidateQueries({ queryKey: ORG_KEYS.detail(id) });
    },
  });
}

// ── Branches ──────────────────────────────────────────────────────────────────
export function useBranches(orgId: number) {
  return useQuery({
    queryKey: ORG_KEYS.branches(orgId),
    queryFn:  () => organizationService.getBranches(orgId).then(extract("branches")),
    enabled:  !!orgId,
  });
}

export function useCreateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, data }: { orgId: number; data: Record<string, unknown> }) =>
      organizationService.createBranch(orgId, data),
    onSuccess: (_r, { orgId }) => qc.invalidateQueries({ queryKey: ORG_KEYS.branches(orgId) }),
  });
}

export function useUpdateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, branchId, data }: { orgId: number; branchId: number; data: Record<string, unknown> }) =>
      organizationService.updateBranch(orgId, branchId, data),
    onSuccess: (_r, { orgId }) => qc.invalidateQueries({ queryKey: ORG_KEYS.branches(orgId) }),
  });
}

export function useDeleteBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, branchId }: { orgId: number; branchId: number }) =>
      organizationService.deleteBranch(orgId, branchId),
    onSuccess: (_r, { orgId }) => qc.invalidateQueries({ queryKey: ORG_KEYS.branches(orgId) }),
  });
}

// ── Staff ─────────────────────────────────────────────────────────────────────
export function useStaff(orgId: number, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [...ORG_KEYS.staff(orgId), params],
    queryFn:  () => organizationService.getStaff(orgId, params).then(extract("staff")),
    enabled:  !!orgId,
  });
}

export function useCreateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, data }: { orgId: number; data: Record<string, unknown> }) =>
      organizationService.createStaff(orgId, data),
    onSuccess: (_r, { orgId }) => qc.invalidateQueries({ queryKey: ORG_KEYS.staff(orgId) }),
  });
}

export function useUpdateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, staffId, data }: { orgId: number; staffId: number; data: Record<string, unknown> }) =>
      organizationService.updateStaff(orgId, staffId, data),
    onSuccess: (_r, { orgId }) => qc.invalidateQueries({ queryKey: ORG_KEYS.staff(orgId) }),
  });
}

export function useDesignations(orgId: number) {
  return useQuery({
    queryKey: ORG_KEYS.designations(orgId),
    queryFn:  () => organizationService.getDesignations(orgId).then(extract("designations")),
    enabled:  !!orgId,
  });
}

export function useCreateDesignation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, data }: { orgId: number; data: Record<string, unknown> }) =>
      organizationService.createDesignation(orgId, data),
    onSuccess: (_r, { orgId }) => qc.invalidateQueries({ queryKey: ORG_KEYS.designations(orgId) }),
  });
}

export function useUpdateDesignation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, dId, data }: { orgId: number; dId: number; data: Record<string, unknown> }) =>
      organizationService.updateDesignation(orgId, dId, data),
    onSuccess: (_r, { orgId }) => qc.invalidateQueries({ queryKey: ORG_KEYS.designations(orgId) }),
  });
}

// ── Students ──────────────────────────────────────────────────────────────────
export function useStudents(orgId: number, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [...ORG_KEYS.students(orgId), params],
    queryFn:  () => organizationService.getStudents(orgId, params).then(extract("students")),
    enabled:  !!orgId,
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, data }: { orgId: number; data: Record<string, unknown> }) =>
      organizationService.createStudent(orgId, data),
    onSuccess: (_r, { orgId }) => qc.invalidateQueries({ queryKey: ORG_KEYS.students(orgId) }),
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, studentId, data }: { orgId: number; studentId: number; data: Record<string, unknown> }) =>
      organizationService.updateStudent(orgId, studentId, data),
    onSuccess: (_r, { orgId }) => qc.invalidateQueries({ queryKey: ORG_KEYS.students(orgId) }),
  });
}

export function useEnrollStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, data }: { orgId: number; data: Record<string, unknown> }) =>
      organizationService.enrollStudent(orgId, data),
    onSuccess: (_r, { orgId }) => qc.invalidateQueries({ queryKey: ORG_KEYS.students(orgId) }),
  });
}

// ── Academic Years ────────────────────────────────────────────────────────────
export function useAcademicYears(orgId: number) {
  return useQuery({
    queryKey: ORG_KEYS.years(orgId),
    queryFn:  () => organizationService.getAcademicYears(orgId).then(extract("years")),
    enabled:  !!orgId,
  });
}

export function useCreateAcademicYear() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, data }: { orgId: number; data: Record<string, unknown> }) =>
      organizationService.createAcademicYear(orgId, data),
    onSuccess: (_r, { orgId }) => qc.invalidateQueries({ queryKey: ORG_KEYS.years(orgId) }),
  });
}

export function useUpdateAcademicYear() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, yearId, data }: { orgId: number; yearId: number; data: Record<string, unknown> }) =>
      organizationService.updateAcademicYear(orgId, yearId, data),
    onSuccess: (_r, { orgId }) => qc.invalidateQueries({ queryKey: ORG_KEYS.years(orgId) }),
  });
}

// ── Classes ───────────────────────────────────────────────────────────────────
export function useClasses(orgId: number, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [...ORG_KEYS.classes(orgId), params],
    queryFn:  () => organizationService.getClasses(orgId, params).then(extract("classes")),
    enabled:  !!orgId,
  });
}

export function useCreateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, data }: { orgId: number; data: Record<string, unknown> }) =>
      organizationService.createClass(orgId, data),
    onSuccess: (_r, { orgId }) => qc.invalidateQueries({ queryKey: ORG_KEYS.classes(orgId) }),
  });
}

export function useUpdateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, classId, data }: { orgId: number; classId: number; data: Record<string, unknown> }) =>
      organizationService.updateClass(orgId, classId, data),
    onSuccess: (_r, { orgId }) => qc.invalidateQueries({ queryKey: ORG_KEYS.classes(orgId) }),
  });
}

// ── Subjects ──────────────────────────────────────────────────────────────────
export function useSubjects(orgId: number) {
  return useQuery({
    queryKey: ORG_KEYS.subjects(orgId),
    queryFn:  () => organizationService.getSubjects(orgId).then(extract("subjects")),
    enabled:  !!orgId,
  });
}

export function useCreateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, data }: { orgId: number; data: Record<string, unknown> }) =>
      organizationService.createSubject(orgId, data),
    onSuccess: (_r, { orgId }) => qc.invalidateQueries({ queryKey: ORG_KEYS.subjects(orgId) }),
  });
}

export function useUpdateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, subjectId, data }: { orgId: number; subjectId: number; data: Record<string, unknown> }) =>
      organizationService.updateSubject(orgId, subjectId, data),
    onSuccess: (_r, { orgId }) => qc.invalidateQueries({ queryKey: ORG_KEYS.subjects(orgId) }),
  });
}

// ── Exams ─────────────────────────────────────────────────────────────────────
export function useExams(orgId: number, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [...ORG_KEYS.exams(orgId), params],
    queryFn:  () => organizationService.getExams(orgId, params).then(extract("exams")),
    enabled:  !!orgId,
  });
}

export function useCreateExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, data }: { orgId: number; data: Record<string, unknown> }) =>
      organizationService.createExam(orgId, data),
    onSuccess: (_r, { orgId }) => qc.invalidateQueries({ queryKey: ORG_KEYS.exams(orgId) }),
  });
}

// ── Marks ─────────────────────────────────────────────────────────────────────
export function useMarks(orgId: number, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [...ORG_KEYS.marks(orgId), params],
    queryFn:  () => organizationService.getMarks(orgId, params).then(extract("marks")),
    enabled:  !!orgId,
  });
}

export function useUpsertMark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, data }: { orgId: number; data: Record<string, unknown> }) =>
      organizationService.upsertMark(orgId, data),
    onSuccess: (_r, { orgId }) => qc.invalidateQueries({ queryKey: ORG_KEYS.marks(orgId) }),
  });
}
