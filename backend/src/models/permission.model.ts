import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface PermissionAttributes {
  id: number;
  name: string;
  slug: string;
  resource: string;
  action: string;
  description: string;
  isSystem: boolean;
  isActive: boolean;
  [key: string]: unknown;
}

type PermissionCreationAttributes = Optional<PermissionAttributes, 'id' | 'description' | 'isSystem' | 'isActive'>;

class Permission extends Model<PermissionAttributes, PermissionCreationAttributes> {
  declare id: number;
  declare name: string;
  declare slug: string;
  declare resource: string;
  declare action: string;
  declare description: string;
  declare isSystem: boolean;
  declare isActive: boolean;
  [key: string]: unknown;
}

Permission.init({
  id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name:        { type: DataTypes.STRING, allowNull: false },
  slug:        { type: DataTypes.STRING, allowNull: false },
  resource:    { type: DataTypes.STRING, allowNull: false },
  action:      { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, defaultValue: '' },
  isSystem:    { type: DataTypes.BOOLEAN, defaultValue: false },
  isActive:    { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  sequelize,
  tableName: 'permissions',
  timestamps: true,
  indexes: [{ unique: true, fields: ['resource', 'action'] }],
});

export default Permission;
