import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

interface UserHasPermissionAttributes {
  id: number;
  userId: number;
  permissionId: number;
  effect: 'allow' | 'deny';
  scopeType: 'global' | 'organization';
  scopeId: number | null;
  expiresAt: Date | null;
  assignedBy: number | null;
  remarks: string;
  isActive: boolean;
}
type UserHasPermissionCreation = Optional<UserHasPermissionAttributes, 'id' | 'scopeType' | 'scopeId' | 'expiresAt' | 'assignedBy' | 'remarks' | 'isActive'>;

class UserHasPermission extends Model<UserHasPermissionAttributes, UserHasPermissionCreation> implements UserHasPermissionAttributes {
  declare id: number;
  declare userId: number;
  declare permissionId: number;
  declare effect: 'allow' | 'deny';
  declare scopeType: 'global' | 'organization';
  declare scopeId: number | null;
  declare expiresAt: Date | null;
  declare assignedBy: number | null;
  declare remarks: string;
  declare isActive: boolean;
}

UserHasPermission.init({
  id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId:       { type: DataTypes.INTEGER, allowNull: false },
  permissionId: { type: DataTypes.INTEGER, allowNull: false },
  effect:       { type: DataTypes.ENUM('allow', 'deny'), allowNull: false },
  scopeType:    { type: DataTypes.ENUM('global', 'organization'), defaultValue: 'global' },
  scopeId:      { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
  expiresAt:    { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  assignedBy:   { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
  remarks:      { type: DataTypes.STRING, defaultValue: '' },
  isActive:     { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  sequelize,
  tableName: 'user_has_permissions',
  timestamps: true,
  indexes: [{ unique: true, fields: ['userId', 'permissionId', 'scopeType', 'scopeId'] }],
});

export default UserHasPermission;
