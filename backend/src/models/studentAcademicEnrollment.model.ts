import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface StudentAcademicEnrollmentAttributes {
  id: number;
  studentId: number;
  organizationId: number;
  branchId: number | null;
  academicYearId: number;
  classId: number;
  sectionId: number | null;
  status: 'active' | 'transferred' | 'completed' | 'dropped';
  [key: string]: unknown;
}

type StudentAcademicEnrollmentCreation = Optional<StudentAcademicEnrollmentAttributes, 'id' | 'branchId' | 'sectionId' | 'status'>;

class StudentAcademicEnrollment extends Model<StudentAcademicEnrollmentAttributes, StudentAcademicEnrollmentCreation> implements StudentAcademicEnrollmentAttributes {
  declare id: number;
  declare studentId: number;
  declare organizationId: number;
  declare branchId: number | null;
  declare academicYearId: number;
  declare classId: number;
  declare sectionId: number | null;
  declare status: 'active' | 'transferred' | 'completed' | 'dropped';
  [key: string]: unknown;
}

StudentAcademicEnrollment.init({
  id:             { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  studentId:      { type: DataTypes.INTEGER, allowNull: false },
  organizationId: { type: DataTypes.INTEGER, allowNull: false },
  branchId:       { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
  academicYearId: { type: DataTypes.INTEGER, allowNull: false },
  classId:        { type: DataTypes.INTEGER, allowNull: false },
  sectionId:      { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
  status:         { type: DataTypes.ENUM('active', 'transferred', 'completed', 'dropped'), defaultValue: 'active' },
}, {
  sequelize,
  tableName: 'student_academic_enrollments',
  timestamps: true,
  indexes: [{ unique: true, fields: ['studentId', 'academicYearId'] }],
});

export default StudentAcademicEnrollment;
