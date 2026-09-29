import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface MarkAttributes {
  id: number;
  organizationId: number;
  branchId: number | null;
  examId: number;
  studentId: number;
  classId: number;
  sectionId: number | null;
  subjectId: number;
  marksObtained: number | null;
  remarks: string | null;
  enteredBy: number | null;
  enteredAt: Date | null;
  [key: string]: unknown;
}

type MarkCreation = Optional<MarkAttributes, 'id' | 'branchId' | 'sectionId' | 'marksObtained' | 'remarks' | 'enteredBy' | 'enteredAt'>;

class Mark extends Model<MarkAttributes, MarkCreation> implements MarkAttributes {
  declare id: number;
  declare organizationId: number;
  declare branchId: number | null;
  declare examId: number;
  declare studentId: number;
  declare classId: number;
  declare sectionId: number | null;
  declare subjectId: number;
  declare marksObtained: number | null;
  declare remarks: string | null;
  declare enteredBy: number | null;
  declare enteredAt: Date | null;
  [key: string]: unknown;
}

Mark.init({
  id:             { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  organizationId: { type: DataTypes.INTEGER, allowNull: false },
  branchId:       { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
  examId:         { type: DataTypes.INTEGER, allowNull: false },
  studentId:      { type: DataTypes.INTEGER, allowNull: false },
  classId:        { type: DataTypes.INTEGER, allowNull: false },
  sectionId:      { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
  subjectId:      { type: DataTypes.INTEGER, allowNull: false },
  marksObtained:  { type: DataTypes.DECIMAL(5, 2), allowNull: true },
  remarks:        { type: DataTypes.STRING, allowNull: true },
  enteredBy:      { type: DataTypes.INTEGER, allowNull: true },
  enteredAt:      { type: DataTypes.DATE, allowNull: true },
}, {
  sequelize,
  tableName: 'marks',
  timestamps: true,
  indexes: [{ unique: true, fields: ['examId', 'studentId', 'subjectId'] }],
});

export default Mark;
