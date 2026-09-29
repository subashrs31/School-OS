import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface SubjectAttributes {
  id: number;
  organizationId: number;
  code: string | null;
  name: string;
  type: 'theory' | 'practical' | 'both';
  isActive: boolean;
  [key: string]: unknown;
}

type SubjectCreation = Optional<SubjectAttributes, 'id' | 'code' | 'type' | 'isActive'>;

class Subject extends Model<SubjectAttributes, SubjectCreation> implements SubjectAttributes {
  declare id: number;
  declare organizationId: number;
  declare code: string | null;
  declare name: string;
  declare type: 'theory' | 'practical' | 'both';
  declare isActive: boolean;
  [key: string]: unknown;
}

Subject.init({
  id:             { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  organizationId: { type: DataTypes.INTEGER, allowNull: false },
  code:           { type: DataTypes.STRING, allowNull: true },
  name:           { type: DataTypes.STRING, allowNull: false },
  type:           { type: DataTypes.ENUM('theory', 'practical', 'both'), defaultValue: 'theory' },
  isActive:       { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  sequelize,
  tableName: 'subjects',
  timestamps: true,
});

export default Subject;
