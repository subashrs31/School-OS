import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export type RoleType = 'primary' | 'secondary' | 'normal';

// primary   → isSystem=true,  global scope, full bypass — no permission check (Super Admin)
// secondary → isSystem=true,  global scope, permission check still runs (Support Staff, Auditor)
// normal    → isSystem=false, organization scope, standard permission check (Principal, Teacher, etc.)

export interface RoleAttributes {
  id: number;
  name: string;
  slug: string;
  description: string;
  roleType: RoleType;
  isSystem: boolean;
  isActive: boolean;
  [key: string]: unknown;
}

type RoleCreationAttributes = Optional<RoleAttributes, 'id' | 'description' | 'roleType' | 'isSystem' | 'isActive'>;

class Role extends Model<RoleAttributes, RoleCreationAttributes> {
  declare id: number;
  declare name: string;
  declare slug: string;
  declare description: string;
  declare roleType: RoleType;
  declare isSystem: boolean;
  declare isActive: boolean;
  [key: string]: unknown;
}

Role.init({
  id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name:        { type: DataTypes.STRING, allowNull: false },
  slug:        { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, defaultValue: '' },
  roleType:    { type: DataTypes.ENUM('primary', 'secondary', 'normal'), defaultValue: 'normal', allowNull: false },
  isSystem:    { type: DataTypes.BOOLEAN, defaultValue: false },
  isActive:    { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  sequelize,
  tableName: 'roles',
  timestamps: true,
  indexes: [{ unique: true, fields: ['slug'] }],
});

export default Role;
