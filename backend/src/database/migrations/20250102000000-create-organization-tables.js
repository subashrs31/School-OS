'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ── organizations ──────────────────────────────────────────────────────────
    await queryInterface.createTable('organizations', {
      id:           { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name:         { type: Sequelize.STRING, allowNull: false },
      slug:         { type: Sequelize.STRING, allowNull: false, unique: true },
      logo:         { type: Sequelize.STRING, allowNull: true },
      website:      { type: Sequelize.STRING, allowNull: true },
      email:        { type: Sequelize.STRING, allowNull: true },
      mobile:       { type: Sequelize.STRING, allowNull: true },
      schoolTiming: { type: Sequelize.STRING, allowNull: true },
      address:      { type: Sequelize.TEXT, allowNull: true },
      socialLinks:  { type: Sequelize.JSON, defaultValue: {} },
      isActive:     { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt:    { type: Sequelize.DATE, allowNull: false },
      updatedAt:    { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('organizations', ['slug'], { unique: true, name: 'organizations_slug_unique' });

    // ── branches ───────────────────────────────────────────────────────────────
    await queryInterface.createTable('branches', {
      id:             { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      organizationId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'organizations', key: 'id' }, onDelete: 'CASCADE' },
      name:           { type: Sequelize.STRING, allowNull: false },
      code:           { type: Sequelize.STRING, allowNull: true },
      address:        { type: Sequelize.TEXT, allowNull: true },
      email:          { type: Sequelize.STRING, allowNull: true },
      mobile:         { type: Sequelize.STRING, allowNull: true },
      timing:         { type: Sequelize.STRING, allowNull: true },
      isActive:       { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt:      { type: Sequelize.DATE, allowNull: false },
      updatedAt:      { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('branches', ['organizationId'], { name: 'branches_organization_id' });

    // ── user_organizations ─────────────────────────────────────────────────────
    await queryInterface.createTable('user_organizations', {
      id:             { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      userId:         { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      organizationId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'organizations', key: 'id' }, onDelete: 'CASCADE' },
      branchId:       { type: Sequelize.INTEGER, allowNull: true, references: { model: 'branches', key: 'id' }, onDelete: 'SET NULL' },
      isPrimary:      { type: Sequelize.BOOLEAN, defaultValue: false },
      isActive:       { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt:      { type: Sequelize.DATE, allowNull: false },
      updatedAt:      { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('user_organizations', ['userId', 'organizationId'], { name: 'user_organizations_user_org' });
    await queryInterface.addIndex('user_organizations', ['organizationId'], { name: 'user_organizations_org_id' });
    await queryInterface.addIndex('user_organizations', ['branchId'], { name: 'user_organizations_branch_id' });

    // ── designations ───────────────────────────────────────────────────────────
    await queryInterface.createTable('designations', {
      id:             { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      organizationId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'organizations', key: 'id' }, onDelete: 'CASCADE' },
      name:           { type: Sequelize.STRING, allowNull: false },
      description:    { type: Sequelize.STRING, defaultValue: '' },
      isActive:       { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt:      { type: Sequelize.DATE, allowNull: false },
      updatedAt:      { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('designations', ['organizationId'], { name: 'designations_organization_id' });

    // ── staff ──────────────────────────────────────────────────────────────────
    await queryInterface.createTable('staff', {
      id:             { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      userId:         { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      organizationId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'organizations', key: 'id' }, onDelete: 'CASCADE' },
      branchId:       { type: Sequelize.INTEGER, allowNull: true, references: { model: 'branches', key: 'id' }, onDelete: 'SET NULL' },
      designationId:  { type: Sequelize.INTEGER, allowNull: true, references: { model: 'designations', key: 'id' }, onDelete: 'SET NULL' },
      employeeCode:   { type: Sequelize.STRING, allowNull: true },
      joiningDate:    { type: Sequelize.DATEONLY, allowNull: true },
      status:         { type: Sequelize.ENUM('active', 'inactive', 'on_leave'), defaultValue: 'active' },
      createdAt:      { type: Sequelize.DATE, allowNull: false },
      updatedAt:      { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('staff', ['organizationId'], { name: 'staff_organization_id' });
    await queryInterface.addIndex('staff', ['branchId'],       { name: 'staff_branch_id' });
    await queryInterface.addIndex('staff', ['userId', 'organizationId'], { unique: true, name: 'staff_user_org_unique' });

    // ── students ───────────────────────────────────────────────────────────────
    await queryInterface.createTable('students', {
      id:            { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      organizationId:{ type: Sequelize.INTEGER, allowNull: false, references: { model: 'organizations', key: 'id' }, onDelete: 'CASCADE' },
      admissionNo:   { type: Sequelize.STRING, allowNull: false },
      name:          { type: Sequelize.STRING, allowNull: false },
      dateOfBirth:   { type: Sequelize.DATEONLY, allowNull: true },
      gender:        { type: Sequelize.ENUM('male', 'female', 'other'), allowNull: true },
      photo:         { type: Sequelize.STRING, allowNull: true },
      email:         { type: Sequelize.STRING, allowNull: true },
      mobile:        { type: Sequelize.STRING, allowNull: true },
      address:       { type: Sequelize.TEXT, allowNull: true },
      admissionDate: { type: Sequelize.DATEONLY, allowNull: true },
      status:        { type: Sequelize.ENUM('active', 'inactive', 'transferred', 'graduated'), defaultValue: 'active' },
      createdAt:     { type: Sequelize.DATE, allowNull: false },
      updatedAt:     { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('students', ['organizationId'], { name: 'students_organization_id' });
    await queryInterface.addIndex('students', ['organizationId', 'admissionNo'], { unique: true, name: 'students_org_admission_unique' });

    // ── academic_years ─────────────────────────────────────────────────────────
    await queryInterface.createTable('academic_years', {
      id:             { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      organizationId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'organizations', key: 'id' }, onDelete: 'CASCADE' },
      name:           { type: Sequelize.STRING, allowNull: false },
      startDate:      { type: Sequelize.DATEONLY, allowNull: false },
      endDate:        { type: Sequelize.DATEONLY, allowNull: false },
      isCurrent:      { type: Sequelize.BOOLEAN, defaultValue: false },
      isActive:       { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt:      { type: Sequelize.DATE, allowNull: false },
      updatedAt:      { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('academic_years', ['organizationId'], { name: 'academic_years_organization_id' });

    // ── classes ────────────────────────────────────────────────────────────────
    await queryInterface.createTable('classes', {
      id:             { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      organizationId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'organizations', key: 'id' }, onDelete: 'CASCADE' },
      branchId:       { type: Sequelize.INTEGER, allowNull: true, references: { model: 'branches', key: 'id' }, onDelete: 'SET NULL' },
      academicYearId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'academic_years', key: 'id' }, onDelete: 'SET NULL' },
      name:           { type: Sequelize.STRING, allowNull: false },
      displayOrder:   { type: Sequelize.INTEGER, defaultValue: 0 },
      isActive:       { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt:      { type: Sequelize.DATE, allowNull: false },
      updatedAt:      { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('classes', ['organizationId'], { name: 'classes_organization_id' });
    await queryInterface.addIndex('classes', ['branchId'],       { name: 'classes_branch_id' });

    // ── sections ───────────────────────────────────────────────────────────────
    await queryInterface.createTable('sections', {
      id:        { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      classId:   { type: Sequelize.INTEGER, allowNull: false, references: { model: 'classes', key: 'id' }, onDelete: 'CASCADE' },
      name:      { type: Sequelize.STRING, allowNull: false },
      capacity:  { type: Sequelize.INTEGER, allowNull: true },
      isActive:  { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('sections', ['classId'], { name: 'sections_class_id' });

    // ── subjects ───────────────────────────────────────────────────────────────
    await queryInterface.createTable('subjects', {
      id:             { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      organizationId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'organizations', key: 'id' }, onDelete: 'CASCADE' },
      code:           { type: Sequelize.STRING, allowNull: true },
      name:           { type: Sequelize.STRING, allowNull: false },
      type:           { type: Sequelize.ENUM('theory', 'practical', 'both'), defaultValue: 'theory' },
      isActive:       { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt:      { type: Sequelize.DATE, allowNull: false },
      updatedAt:      { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('subjects', ['organizationId'], { name: 'subjects_organization_id' });

    // ── class_subjects ─────────────────────────────────────────────────────────
    await queryInterface.createTable('class_subjects', {
      id:             { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      classId:        { type: Sequelize.INTEGER, allowNull: false, references: { model: 'classes', key: 'id' }, onDelete: 'CASCADE' },
      subjectId:      { type: Sequelize.INTEGER, allowNull: false, references: { model: 'subjects', key: 'id' }, onDelete: 'CASCADE' },
      academicYearId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'academic_years', key: 'id' }, onDelete: 'SET NULL' },
      createdAt:      { type: Sequelize.DATE, allowNull: false },
      updatedAt:      { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('class_subjects', ['classId', 'subjectId', 'academicYearId'], { unique: true, name: 'class_subjects_unique' });

    // ── student_academic_enrollments ───────────────────────────────────────────
    await queryInterface.createTable('student_academic_enrollments', {
      id:             { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      studentId:      { type: Sequelize.INTEGER, allowNull: false, references: { model: 'students', key: 'id' }, onDelete: 'CASCADE' },
      organizationId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'organizations', key: 'id' }, onDelete: 'CASCADE' },
      branchId:       { type: Sequelize.INTEGER, allowNull: true, references: { model: 'branches', key: 'id' }, onDelete: 'SET NULL' },
      academicYearId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'academic_years', key: 'id' }, onDelete: 'CASCADE' },
      classId:        { type: Sequelize.INTEGER, allowNull: false, references: { model: 'classes', key: 'id' }, onDelete: 'CASCADE' },
      sectionId:      { type: Sequelize.INTEGER, allowNull: true, references: { model: 'sections', key: 'id' }, onDelete: 'SET NULL' },
      status:         { type: Sequelize.ENUM('active', 'transferred', 'completed', 'dropped'), defaultValue: 'active' },
      createdAt:      { type: Sequelize.DATE, allowNull: false },
      updatedAt:      { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('student_academic_enrollments', ['organizationId'],  { name: 'sae_organization_id' });
    await queryInterface.addIndex('student_academic_enrollments', ['branchId'],        { name: 'sae_branch_id' });
    await queryInterface.addIndex('student_academic_enrollments', ['academicYearId'],  { name: 'sae_academic_year_id' });
    await queryInterface.addIndex('student_academic_enrollments', ['studentId', 'academicYearId'], { unique: true, name: 'sae_student_year_unique' });

    // ── class_teacher_assignments ──────────────────────────────────────────────
    await queryInterface.createTable('class_teacher_assignments', {
      id:             { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      organizationId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'organizations', key: 'id' }, onDelete: 'CASCADE' },
      branchId:       { type: Sequelize.INTEGER, allowNull: true, references: { model: 'branches', key: 'id' }, onDelete: 'SET NULL' },
      staffId:        { type: Sequelize.INTEGER, allowNull: false, references: { model: 'staff', key: 'id' }, onDelete: 'CASCADE' },
      classId:        { type: Sequelize.INTEGER, allowNull: false, references: { model: 'classes', key: 'id' }, onDelete: 'CASCADE' },
      sectionId:      { type: Sequelize.INTEGER, allowNull: true, references: { model: 'sections', key: 'id' }, onDelete: 'SET NULL' },
      academicYearId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'academic_years', key: 'id' }, onDelete: 'CASCADE' },
      startDate:      { type: Sequelize.DATEONLY, allowNull: true },
      endDate:        { type: Sequelize.DATEONLY, allowNull: true },
      isActive:       { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt:      { type: Sequelize.DATE, allowNull: false },
      updatedAt:      { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('class_teacher_assignments', ['organizationId'], { name: 'cta_organization_id' });
    await queryInterface.addIndex('class_teacher_assignments', ['classId', 'sectionId', 'academicYearId'], { unique: true, name: 'cta_class_section_year_unique' });

    // ── subject_teacher_assignments ────────────────────────────────────────────
    await queryInterface.createTable('subject_teacher_assignments', {
      id:             { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      organizationId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'organizations', key: 'id' }, onDelete: 'CASCADE' },
      branchId:       { type: Sequelize.INTEGER, allowNull: true, references: { model: 'branches', key: 'id' }, onDelete: 'SET NULL' },
      staffId:        { type: Sequelize.INTEGER, allowNull: false, references: { model: 'staff', key: 'id' }, onDelete: 'CASCADE' },
      classId:        { type: Sequelize.INTEGER, allowNull: false, references: { model: 'classes', key: 'id' }, onDelete: 'CASCADE' },
      sectionId:      { type: Sequelize.INTEGER, allowNull: true, references: { model: 'sections', key: 'id' }, onDelete: 'SET NULL' },
      subjectId:      { type: Sequelize.INTEGER, allowNull: false, references: { model: 'subjects', key: 'id' }, onDelete: 'CASCADE' },
      academicYearId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'academic_years', key: 'id' }, onDelete: 'CASCADE' },
      startDate:      { type: Sequelize.DATEONLY, allowNull: true },
      endDate:        { type: Sequelize.DATEONLY, allowNull: true },
      isActive:       { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt:      { type: Sequelize.DATE, allowNull: false },
      updatedAt:      { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('subject_teacher_assignments', ['organizationId'], { name: 'sta_organization_id' });

    // ── exams ──────────────────────────────────────────────────────────────────
    await queryInterface.createTable('exams', {
      id:             { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      organizationId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'organizations', key: 'id' }, onDelete: 'CASCADE' },
      branchId:       { type: Sequelize.INTEGER, allowNull: true, references: { model: 'branches', key: 'id' }, onDelete: 'SET NULL' },
      academicYearId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'academic_years', key: 'id' }, onDelete: 'CASCADE' },
      name:           { type: Sequelize.STRING, allowNull: false },
      examType:       { type: Sequelize.ENUM('unit_test', 'midterm', 'final', 'other'), defaultValue: 'other' },
      startDate:      { type: Sequelize.DATEONLY, allowNull: true },
      endDate:        { type: Sequelize.DATEONLY, allowNull: true },
      isActive:       { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt:      { type: Sequelize.DATE, allowNull: false },
      updatedAt:      { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('exams', ['organizationId'], { name: 'exams_organization_id' });

    // ── exam_subjects ──────────────────────────────────────────────────────────
    await queryInterface.createTable('exam_subjects', {
      id:        { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      examId:    { type: Sequelize.INTEGER, allowNull: false, references: { model: 'exams', key: 'id' }, onDelete: 'CASCADE' },
      classId:   { type: Sequelize.INTEGER, allowNull: false, references: { model: 'classes', key: 'id' }, onDelete: 'CASCADE' },
      subjectId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'subjects', key: 'id' }, onDelete: 'CASCADE' },
      maxMarks:  { type: Sequelize.DECIMAL(5, 2), allowNull: true },
      passMarks: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
      examDate:  { type: Sequelize.DATEONLY, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('exam_subjects', ['examId', 'classId', 'subjectId'], { unique: true, name: 'exam_subjects_unique' });

    // ── marks ──────────────────────────────────────────────────────────────────
    await queryInterface.createTable('marks', {
      id:             { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      organizationId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'organizations', key: 'id' }, onDelete: 'CASCADE' },
      branchId:       { type: Sequelize.INTEGER, allowNull: true, references: { model: 'branches', key: 'id' }, onDelete: 'SET NULL' },
      examId:         { type: Sequelize.INTEGER, allowNull: false, references: { model: 'exams', key: 'id' }, onDelete: 'CASCADE' },
      studentId:      { type: Sequelize.INTEGER, allowNull: false, references: { model: 'students', key: 'id' }, onDelete: 'CASCADE' },
      classId:        { type: Sequelize.INTEGER, allowNull: false, references: { model: 'classes', key: 'id' }, onDelete: 'CASCADE' },
      sectionId:      { type: Sequelize.INTEGER, allowNull: true, references: { model: 'sections', key: 'id' }, onDelete: 'SET NULL' },
      subjectId:      { type: Sequelize.INTEGER, allowNull: false, references: { model: 'subjects', key: 'id' }, onDelete: 'CASCADE' },
      marksObtained:  { type: Sequelize.DECIMAL(5, 2), allowNull: true },
      remarks:        { type: Sequelize.STRING, allowNull: true },
      enteredBy:      { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      enteredAt:      { type: Sequelize.DATE, allowNull: true },
      createdAt:      { type: Sequelize.DATE, allowNull: false },
      updatedAt:      { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('marks', ['organizationId'], { name: 'marks_organization_id' });
    await queryInterface.addIndex('marks', ['examId'],         { name: 'marks_exam_id' });
    await queryInterface.addIndex('marks', ['studentId'],      { name: 'marks_student_id' });
    await queryInterface.addIndex('marks', ['examId', 'studentId', 'subjectId'], { unique: true, name: 'marks_exam_student_subject_unique' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('marks');
    await queryInterface.dropTable('exam_subjects');
    await queryInterface.dropTable('exams');
    await queryInterface.dropTable('subject_teacher_assignments');
    await queryInterface.dropTable('class_teacher_assignments');
    await queryInterface.dropTable('student_academic_enrollments');
    await queryInterface.dropTable('class_subjects');
    await queryInterface.dropTable('subjects');
    await queryInterface.dropTable('sections');
    await queryInterface.dropTable('classes');
    await queryInterface.dropTable('academic_years');
    await queryInterface.dropTable('students');
    await queryInterface.dropTable('staff');
    await queryInterface.dropTable('designations');
    await queryInterface.dropTable('user_organizations');
    await queryInterface.dropTable('branches');
    await queryInterface.dropTable('organizations');
  },
};
