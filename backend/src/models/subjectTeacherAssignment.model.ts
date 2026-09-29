import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface SubjectTeacherAssignmentAttributes {
  id: number;
  organizationId: number;
  branchId: number | null;
  staffId: number;
  classId: number;
  sectionId: number | null;
  subjectId: number;
  academicYearId: number;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  [key: string]: unknown;
}

type SubjectTeacherAssignmentCreation = Optional<SubjectTeacherAssignmentAttributes, 'id' | 'branchId' | 'sectionId' | 'startDate' | 'endDate' | 'isActive'>;

class SubjectTeacherAssignment extends Model<SubjectTeacherAssignmentAttributes, SubjectTeacherAssignmentCreation> implements SubjectTeacherAssignmentAttributes {
  declare id: number;
  declare organizationId: number;
  declare branchId: number | null;
  declare staffId: number;
  declare classId: number;
  declare sectionId: number | null;
  declare subjectId: number;
  declare academicYearId: number;
  declare startDate: string | null;
  declare endDate: string | null;
  declare isActive: boolean;
  [key: string]: unknown;
}

SubjectTeacherAssignment.init({
  id:             { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  organizationId: { type: DataTypes.INTEGER, allowNull: false },
  branchId:       { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
  staffId:        { type: DataTypes.INTEGER, allowNull: false },
  classId:        { type: DataTypes.INTEGER, allowNull: false },
  sectionId:      { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
  subjectId:      { type: DataTypes.INTEGER, allowNull: false },
  academicYearId: { type: DataTypes.INTEGER, allowNull: false },
  startDate:      { type: DataTypes.DATEONLY, allowNull: true },
  endDate:        { type: DataTypes.DATEONLY, allowNull: true },
  isActive:       { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  sequelize,
  tableName: 'subject_teacher_assignments',
  timestamps: true,
});

export default SubjectTeacherAssignment;
