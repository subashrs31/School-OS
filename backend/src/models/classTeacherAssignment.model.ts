import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface ClassTeacherAssignmentAttributes {
  id: number;
  organizationId: number;
  branchId: number | null;
  staffId: number;
  classId: number;
  sectionId: number | null;
  academicYearId: number;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  [key: string]: unknown;
}

type ClassTeacherAssignmentCreation = Optional<ClassTeacherAssignmentAttributes, 'id' | 'branchId' | 'sectionId' | 'startDate' | 'endDate' | 'isActive'>;

class ClassTeacherAssignment extends Model<ClassTeacherAssignmentAttributes, ClassTeacherAssignmentCreation> implements ClassTeacherAssignmentAttributes {
  declare id: number;
  declare organizationId: number;
  declare branchId: number | null;
  declare staffId: number;
  declare classId: number;
  declare sectionId: number | null;
  declare academicYearId: number;
  declare startDate: string | null;
  declare endDate: string | null;
  declare isActive: boolean;
  [key: string]: unknown;
}

ClassTeacherAssignment.init({
  id:             { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  organizationId: { type: DataTypes.INTEGER, allowNull: false },
  branchId:       { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
  staffId:        { type: DataTypes.INTEGER, allowNull: false },
  classId:        { type: DataTypes.INTEGER, allowNull: false },
  sectionId:      { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
  academicYearId: { type: DataTypes.INTEGER, allowNull: false },
  startDate:      { type: DataTypes.DATEONLY, allowNull: true },
  endDate:        { type: DataTypes.DATEONLY, allowNull: true },
  isActive:       { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  sequelize,
  tableName: 'class_teacher_assignments',
  timestamps: true,
  indexes: [{ unique: true, fields: ['classId', 'sectionId', 'academicYearId'] }],
});

export default ClassTeacherAssignment;
