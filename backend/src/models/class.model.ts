import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface ClassAttributes {
  id: number;
  organizationId: number;
  branchId: number | null;
  academicYearId: number | null;
  name: string;
  displayOrder: number;
  isActive: boolean;
  [key: string]: unknown;
}

type ClassCreation = Optional<ClassAttributes, 'id' | 'branchId' | 'academicYearId' | 'displayOrder' | 'isActive'>;

class Class extends Model<ClassAttributes, ClassCreation> implements ClassAttributes {
  declare id: number;
  declare organizationId: number;
  declare branchId: number | null;
  declare academicYearId: number | null;
  declare name: string;
  declare displayOrder: number;
  declare isActive: boolean;
  [key: string]: unknown;
}

Class.init({
  id:             { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  organizationId: { type: DataTypes.INTEGER, allowNull: false },
  branchId:       { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
  academicYearId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
  name:           { type: DataTypes.STRING, allowNull: false },
  displayOrder:   { type: DataTypes.INTEGER, defaultValue: 0 },
  isActive:       { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  sequelize,
  tableName: 'classes',
  timestamps: true,
});

export default Class;
