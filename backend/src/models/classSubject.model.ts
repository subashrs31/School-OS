import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface ClassSubjectAttributes {
  id: number;
  classId: number;
  subjectId: number;
  academicYearId: number | null;
  [key: string]: unknown;
}
type ClassSubjectCreation = Optional<ClassSubjectAttributes, 'id' | 'academicYearId'>;

class ClassSubject extends Model<ClassSubjectAttributes, ClassSubjectCreation> implements ClassSubjectAttributes {
  declare id: number;
  declare classId: number;
  declare subjectId: number;
  declare academicYearId: number | null;
  [key: string]: unknown;
}

ClassSubject.init({
  id:             { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  classId:        { type: DataTypes.INTEGER, allowNull: false },
  subjectId:      { type: DataTypes.INTEGER, allowNull: false },
  academicYearId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
}, {
  sequelize,
  tableName: 'class_subjects',
  timestamps: true,
  indexes: [{ unique: true, fields: ['classId', 'subjectId', 'academicYearId'] }],
});

export default ClassSubject;
