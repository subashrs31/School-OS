import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface DesignationAttributes {
  id: number;
  organizationId: number;
  name: string;
  description: string;
  isActive: boolean;
  [key: string]: unknown;
}

type DesignationCreation = Optional<DesignationAttributes, 'id' | 'description' | 'isActive'>;

class Designation extends Model<DesignationAttributes, DesignationCreation> implements DesignationAttributes {
  declare id: number;
  declare organizationId: number;
  declare name: string;
  declare description: string;
  declare isActive: boolean;
  [key: string]: unknown;
}

Designation.init({
  id:             { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  organizationId: { type: DataTypes.INTEGER, allowNull: false },
  name:           { type: DataTypes.STRING, allowNull: false },
  description:    { type: DataTypes.STRING, defaultValue: '' },
  isActive:       { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  sequelize,
  tableName: 'designations',
  timestamps: true,
});

export default Designation;
