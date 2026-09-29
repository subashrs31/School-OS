import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface UserHasRoleAttributes {
  id: number;
  userId: number;
  roleId: number;
  scopeType: 'global' | 'organization';
  scopeId: number | null;
  isActive: boolean;
  expiresAt: Date | null;
  assignedBy: number | null;
  [key: string]: unknown;
}

type UserHasRoleCreation = Optional<UserHasRoleAttributes, 'id' | 'scopeType' | 'scopeId' | 'isActive' | 'expiresAt' | 'assignedBy'>;

class UserHasRole extends Model<UserHasRoleAttributes, UserHasRoleCreation> {
  declare id: number;
  declare userId: number;
  declare roleId: number;
  declare scopeType: 'global' | 'organization';
  declare scopeId: number | null;
  declare isActive: boolean;
  declare expiresAt: Date | null;
  declare assignedBy: number | null;
  [key: string]: unknown;
}

UserHasRole.init({
  id:         { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId:     { type: DataTypes.INTEGER, allowNull: false },
  roleId:     { type: DataTypes.INTEGER, allowNull: false },
  scopeType:  { type: DataTypes.ENUM('global', 'organization'), defaultValue: 'global', allowNull: false },
  scopeId:    { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
  isActive:   { type: DataTypes.BOOLEAN, defaultValue: true },
  expiresAt:  { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  assignedBy: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
}, {
  sequelize,
  tableName: 'user_has_roles',
  timestamps: true,
  indexes: [{ unique: true, fields: ['userId', 'roleId', 'scopeType', 'scopeId'] }],
});

export default UserHasRole;
