import { apiGet, apiPost, apiUpdate, apiDelete } from "@/services/axios-instance";
import apiConstants from "@/services/api-constants";

const C = apiConstants.ORGANIZATION;

const organizationService = {
  // ── Organizations ─────────────────────────────────────────────────────────────
  list:   ()                                    => apiGet(C.LIST),
  get:    (id: number)                          => apiGet(C.GET(id)),
  create: (data: Record<string, unknown>)       => apiPost(C.CREATE, data),
  update: (id: number, data: Record<string, unknown>) => apiUpdate(C.UPDATE(id), data),

  // ── Branches ──────────────────────────────────────────────────────────────────
  getBranches:    (orgId: number)                                    => apiGet(C.BRANCHES(orgId)),
  getBranch:      (orgId: number, branchId: number)                  => apiGet(C.BRANCH_GET(orgId, branchId)),
  createBranch:   (orgId: number, data: Record<string, unknown>)     => apiPost(C.BRANCHES(orgId), data),
  updateBranch:   (orgId: number, branchId: number, data: Record<string, unknown>) => apiUpdate(C.BRANCH_UPDATE(orgId, branchId), data),
  deleteBranch:   (orgId: number, branchId: number)                  => apiDelete(C.BRANCH_DELETE(orgId, branchId)),

  // ── Staff ─────────────────────────────────────────────────────────────────────
  getStaff:           (orgId: number, params?: Record<string, unknown>)  => apiGet(C.STAFF(orgId), { params }),
  getStaffMember:     (orgId: number, staffId: number)                   => apiGet(C.STAFF_GET(orgId, staffId)),
  createStaff:        (orgId: number, data: Record<string, unknown>)     => apiPost(C.STAFF(orgId), data),
  updateStaff:        (orgId: number, staffId: number, data: Record<string, unknown>) => apiUpdate(C.STAFF_UPDATE(orgId, staffId), data),
  getDesignations:    (orgId: number)                                    => apiGet(C.DESIGNATIONS(orgId)),
  createDesignation:  (orgId: number, data: Record<string, unknown>)     => apiPost(C.DESIGNATIONS(orgId), data),
  updateDesignation:  (orgId: number, dId: number, data: Record<string, unknown>) => apiUpdate(C.DESIGNATION_UPDATE(orgId, dId), data),

  // ── Students ──────────────────────────────────────────────────────────────────
  getStudents:    (orgId: number, params?: Record<string, unknown>)  => apiGet(C.STUDENTS(orgId), { params }),
  getStudent:     (orgId: number, studentId: number)                 => apiGet(C.STUDENT_GET(orgId, studentId)),
  createStudent:  (orgId: number, data: Record<string, unknown>)     => apiPost(C.STUDENTS(orgId), data),
  updateStudent:  (orgId: number, studentId: number, data: Record<string, unknown>) => apiUpdate(C.STUDENT_UPDATE(orgId, studentId), data),
  enrollStudent:  (orgId: number, data: Record<string, unknown>)     => apiPost(C.STUDENT_ENROLL(orgId), data),

  // ── Academics ─────────────────────────────────────────────────────────────────
  getAcademicYears:   (orgId: number)                                    => apiGet(C.ACADEMIC_YEARS(orgId)),
  createAcademicYear: (orgId: number, data: Record<string, unknown>)     => apiPost(C.ACADEMIC_YEARS(orgId), data),
  updateAcademicYear: (orgId: number, yearId: number, data: Record<string, unknown>) => apiUpdate(C.ACADEMIC_YEAR_UPDATE(orgId, yearId), data),

  getClasses:    (orgId: number, params?: Record<string, unknown>)   => apiGet(C.CLASSES(orgId), { params }),
  createClass:   (orgId: number, data: Record<string, unknown>)      => apiPost(C.CLASSES(orgId), data),
  updateClass:   (orgId: number, classId: number, data: Record<string, unknown>) => apiUpdate(C.CLASS_UPDATE(orgId, classId), data),

  createSection: (orgId: number, classId: number, data: Record<string, unknown>) => apiPost(C.SECTIONS(orgId, classId), data),
  updateSection: (orgId: number, classId: number, sectionId: number, data: Record<string, unknown>) => apiUpdate(C.SECTION_UPDATE(orgId, classId, sectionId), data),

  getSubjects:   (orgId: number)                                     => apiGet(C.SUBJECTS(orgId)),
  createSubject: (orgId: number, data: Record<string, unknown>)      => apiPost(C.SUBJECTS(orgId), data),
  updateSubject: (orgId: number, subjectId: number, data: Record<string, unknown>) => apiUpdate(C.SUBJECT_UPDATE(orgId, subjectId), data),

  getClassTeachers:      (orgId: number, params?: Record<string, unknown>) => apiGet(C.CLASS_TEACHERS(orgId), { params }),
  assignClassTeacher:    (orgId: number, data: Record<string, unknown>)    => apiPost(C.CLASS_TEACHERS(orgId), data),
  getSubjectTeachers:    (orgId: number, params?: Record<string, unknown>) => apiGet(C.SUBJECT_TEACHERS(orgId), { params }),
  assignSubjectTeacher:  (orgId: number, data: Record<string, unknown>)    => apiPost(C.SUBJECT_TEACHERS(orgId), data),

  getExams:    (orgId: number, params?: Record<string, unknown>)     => apiGet(C.EXAMS(orgId), { params }),
  createExam:  (orgId: number, data: Record<string, unknown>)        => apiPost(C.EXAMS(orgId), data),
  updateExam:  (orgId: number, examId: number, data: Record<string, unknown>) => apiUpdate(C.EXAM_UPDATE(orgId, examId), data),

  getMarks:    (orgId: number, params?: Record<string, unknown>)     => apiGet(C.MARKS(orgId), { params }),
  upsertMark:  (orgId: number, data: Record<string, unknown>)        => apiPost(C.MARKS(orgId), data),
};

export default organizationService;
