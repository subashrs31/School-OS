import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface ExamSubjectAttributes {
  id: number;
  examId: number;
  classId: number;
  subjectId: number;
  maxMarks: number | null;
  passMarks: number | null;
  examDate: string | null;
  [key: string]: unknown;
}

type ExamSubjectCreation = Optional<ExamSubjectAttributes, 'id' | 'maxMarks' | 'passMarks' | 'examDate'>;

class ExamSubject extends Model<ExamSubjectAttributes, ExamSubjectCreation> implements ExamSubjectAttributes {
  declare id: number;
  declare examId: number;
  declare classId: number;
  declare subjectId: number;
  declare maxMarks: number | null;
  declare passMarks: number | null;
  declare examDate: string | null;
  [key: string]: unknown;
}

ExamSubject.init({
  id:        { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  examId:    { type: DataTypes.INTEGER, allowNull: false },
  classId:   { type: DataTypes.INTEGER, allowNull: false },
  subjectId: { type: DataTypes.INTEGER, allowNull: false },
  maxMarks:  { type: DataTypes.DECIMAL(5, 2), allowNull: true },
  passMarks: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
  examDate:  { type: DataTypes.DATEONLY, allowNull: true },
}, {
  sequelize,
  tableName: 'exam_subjects',
  timestamps: true,
  indexes: [{ unique: true, fields: ['examId', 'classId', 'subjectId'] }],
});

export default ExamSubject;
