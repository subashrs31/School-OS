import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface ExamAttributes {
  id: number;
  organizationId: number;
  branchId: number | null;
  academicYearId: number;
  name: string;
  examType: 'unit_test' | 'midterm' | 'final' | 'other';
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  [key: string]: unknown;
}

type ExamCreation = Optional<ExamAttributes, 'id' | 'branchId' | 'examType' | 'startDate' | 'endDate' | 'isActive'>;

class Exam extends Model<ExamAttributes, ExamCreation> implements ExamAttributes {
  declare id: number;
  declare organizationId: number;
  declare branchId: number | null;
  declare academicYearId: number;
  declare name: string;
  declare examType: 'unit_test' | 'midterm' | 'final' | 'other';
  declare startDate: string | null;
  declare endDate: string | null;
  declare isActive: boolean;
  [key: string]: unknown;
}

Exam.init({
  id:             { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  organizationId: { type: DataTypes.INTEGER, allowNull: false },
  branchId:       { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
  academicYearId: { type: DataTypes.INTEGER, allowNull: false },
  name:           { type: DataTypes.STRING, allowNull: false },
  examType:       { type: DataTypes.ENUM('unit_test', 'midterm', 'final', 'other'), defaultValue: 'other' },
  startDate:      { type: DataTypes.DATEONLY, allowNull: true },
  endDate:        { type: DataTypes.DATEONLY, allowNull: true },
  isActive:       { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  sequelize,
  tableName: 'exams',
  timestamps: true,
});

export default Exam;
