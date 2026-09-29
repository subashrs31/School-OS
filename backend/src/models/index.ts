import User from './user.model';
import Role from './role.model';
import Permission from './permission.model';
import UserHasRole from './userHasRole.model';
import UserHasPermission from './userHasPermission.model';
import RoleHasPermission from './roleHasPermission.model';
import UserOAuthAccount from './userOAuthAccount.model';
import Notification from './notification.model';
import Job from './job.model';
import FailedJob from './failedJob.model';

import Organization from './organization.model';
import Branch from './branch.model';
import UserOrganization from './userOrganization.model';
import Designation from './designation.model';
import Staff from './staff.model';
import Student from './student.model';
import AcademicYear from './academicYear.model';
import Class from './class.model';
import Section from './section.model';
import Subject from './subject.model';
import ClassSubject from './classSubject.model';
import StudentAcademicEnrollment from './studentAcademicEnrollment.model';
import ClassTeacherAssignment from './classTeacherAssignment.model';
import SubjectTeacherAssignment from './subjectTeacherAssignment.model';
import Exam from './exam.model';
import ExamSubject from './examSubject.model';
import Mark from './mark.model';

// ── Existing RBAC associations ─────────────────────────────────────────────────
User.hasMany(UserHasRole,       { foreignKey: 'userId', onDelete: 'CASCADE' });
UserHasRole.belongsTo(User,     { foreignKey: 'userId' });
UserHasRole.belongsTo(Role,     { foreignKey: 'roleId' });
Role.hasMany(UserHasRole,       { foreignKey: 'roleId', onDelete: 'CASCADE' });

User.hasMany(UserHasPermission,         { foreignKey: 'userId', onDelete: 'CASCADE' });
UserHasPermission.belongsTo(User,       { foreignKey: 'userId' });
UserHasPermission.belongsTo(Permission, { foreignKey: 'permissionId' });
Permission.hasMany(UserHasPermission,   { foreignKey: 'permissionId', onDelete: 'CASCADE' });

Role.hasMany(RoleHasPermission,         { foreignKey: 'roleId', onDelete: 'CASCADE' });
RoleHasPermission.belongsTo(Role,       { foreignKey: 'roleId' });
RoleHasPermission.belongsTo(Permission, { foreignKey: 'permissionId' });
Permission.hasMany(RoleHasPermission,   { foreignKey: 'permissionId', onDelete: 'CASCADE' });

User.hasMany(UserOAuthAccount,   { foreignKey: 'userId', onDelete: 'CASCADE' });
UserOAuthAccount.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Notification,   { foreignKey: 'userId', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// ── Organization associations ──────────────────────────────────────────────────
Organization.hasMany(Branch,           { foreignKey: 'organizationId', onDelete: 'CASCADE' });
Branch.belongsTo(Organization,         { foreignKey: 'organizationId' });

Organization.hasMany(UserOrganization, { foreignKey: 'organizationId', onDelete: 'CASCADE' });
UserOrganization.belongsTo(Organization, { foreignKey: 'organizationId' });
UserOrganization.belongsTo(User,         { foreignKey: 'userId' });
UserOrganization.belongsTo(Branch,       { foreignKey: 'branchId' });
User.hasMany(UserOrganization,           { foreignKey: 'userId', onDelete: 'CASCADE' });

Organization.hasMany(Designation, { foreignKey: 'organizationId', onDelete: 'CASCADE' });
Designation.belongsTo(Organization, { foreignKey: 'organizationId' });

Organization.hasMany(Staff, { foreignKey: 'organizationId', onDelete: 'CASCADE' });
Staff.belongsTo(Organization,  { foreignKey: 'organizationId' });
Staff.belongsTo(Branch,        { foreignKey: 'branchId' });
Staff.belongsTo(User,          { foreignKey: 'userId' });
Staff.belongsTo(Designation,   { foreignKey: 'designationId' });
User.hasMany(Staff,            { foreignKey: 'userId', onDelete: 'CASCADE' });

Organization.hasMany(Student, { foreignKey: 'organizationId', onDelete: 'CASCADE' });
Student.belongsTo(Organization, { foreignKey: 'organizationId' });

Organization.hasMany(AcademicYear, { foreignKey: 'organizationId', onDelete: 'CASCADE' });
AcademicYear.belongsTo(Organization, { foreignKey: 'organizationId' });

Organization.hasMany(Class, { foreignKey: 'organizationId', onDelete: 'CASCADE' });
Class.belongsTo(Organization,  { foreignKey: 'organizationId' });
Class.belongsTo(Branch,        { foreignKey: 'branchId' });
Class.belongsTo(AcademicYear,  { foreignKey: 'academicYearId' });
Class.hasMany(Section,         { foreignKey: 'classId', onDelete: 'CASCADE' });
Section.belongsTo(Class,       { foreignKey: 'classId' });

Organization.hasMany(Subject, { foreignKey: 'organizationId', onDelete: 'CASCADE' });
Subject.belongsTo(Organization, { foreignKey: 'organizationId' });

Class.hasMany(ClassSubject,    { foreignKey: 'classId', onDelete: 'CASCADE' });
ClassSubject.belongsTo(Class,  { foreignKey: 'classId' });
ClassSubject.belongsTo(Subject, { foreignKey: 'subjectId' });
ClassSubject.belongsTo(AcademicYear, { foreignKey: 'academicYearId' });

Student.hasMany(StudentAcademicEnrollment, { foreignKey: 'studentId', onDelete: 'CASCADE' });
StudentAcademicEnrollment.belongsTo(Student,      { foreignKey: 'studentId' });
StudentAcademicEnrollment.belongsTo(Organization, { foreignKey: 'organizationId' });
StudentAcademicEnrollment.belongsTo(Branch,       { foreignKey: 'branchId' });
StudentAcademicEnrollment.belongsTo(AcademicYear, { foreignKey: 'academicYearId' });
StudentAcademicEnrollment.belongsTo(Class,        { foreignKey: 'classId' });
StudentAcademicEnrollment.belongsTo(Section,      { foreignKey: 'sectionId' });

ClassTeacherAssignment.belongsTo(Organization, { foreignKey: 'organizationId' });
ClassTeacherAssignment.belongsTo(Branch,       { foreignKey: 'branchId' });
ClassTeacherAssignment.belongsTo(Staff,        { foreignKey: 'staffId' });
ClassTeacherAssignment.belongsTo(Class,        { foreignKey: 'classId' });
ClassTeacherAssignment.belongsTo(Section,      { foreignKey: 'sectionId' });
ClassTeacherAssignment.belongsTo(AcademicYear, { foreignKey: 'academicYearId' });

SubjectTeacherAssignment.belongsTo(Organization, { foreignKey: 'organizationId' });
SubjectTeacherAssignment.belongsTo(Branch,       { foreignKey: 'branchId' });
SubjectTeacherAssignment.belongsTo(Staff,        { foreignKey: 'staffId' });
SubjectTeacherAssignment.belongsTo(Class,        { foreignKey: 'classId' });
SubjectTeacherAssignment.belongsTo(Section,      { foreignKey: 'sectionId' });
SubjectTeacherAssignment.belongsTo(Subject,      { foreignKey: 'subjectId' });
SubjectTeacherAssignment.belongsTo(AcademicYear, { foreignKey: 'academicYearId' });

Organization.hasMany(Exam, { foreignKey: 'organizationId', onDelete: 'CASCADE' });
Exam.belongsTo(Organization,  { foreignKey: 'organizationId' });
Exam.belongsTo(Branch,        { foreignKey: 'branchId' });
Exam.belongsTo(AcademicYear,  { foreignKey: 'academicYearId' });
Exam.hasMany(ExamSubject,     { foreignKey: 'examId', onDelete: 'CASCADE' });
ExamSubject.belongsTo(Exam,   { foreignKey: 'examId' });
ExamSubject.belongsTo(Class,  { foreignKey: 'classId' });
ExamSubject.belongsTo(Subject, { foreignKey: 'subjectId' });

Organization.hasMany(Mark, { foreignKey: 'organizationId', onDelete: 'CASCADE' });
Mark.belongsTo(Organization, { foreignKey: 'organizationId' });
Mark.belongsTo(Branch,       { foreignKey: 'branchId' });
Mark.belongsTo(Exam,         { foreignKey: 'examId' });
Mark.belongsTo(Student,      { foreignKey: 'studentId' });
Mark.belongsTo(Class,        { foreignKey: 'classId' });
Mark.belongsTo(Section,      { foreignKey: 'sectionId' });
Mark.belongsTo(Subject,      { foreignKey: 'subjectId' });
Mark.belongsTo(User,         { foreignKey: 'enteredBy', as: 'enteredByUser' });

export {
  User, Role, Permission, UserHasRole, UserHasPermission, RoleHasPermission,
  UserOAuthAccount, Notification, Job, FailedJob,
  Organization, Branch, UserOrganization, Designation, Staff, Student,
  AcademicYear, Class, Section, Subject, ClassSubject, StudentAcademicEnrollment,
  ClassTeacherAssignment, SubjectTeacherAssignment, Exam, ExamSubject, Mark,
};
