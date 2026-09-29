import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

interface RoleHasPermissionAttributes {
  id: number;
  roleId: number;
  permissionId: number;
}
type RoleHasPermissionCreation = Optional<RoleHasPermissionAttributes, 'id'>;

class RoleHasPermission extends Model<RoleHasPermissionAttributes, RoleHasPermissionCreation> implements RoleHasPermissionAttributes {
  declare id: number;
  declare roleId: number;
  declare permissionId: number;
}

RoleHasPermission.init({
  id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  roleId:       { type: DataTypes.INTEGER, allowNull: false },
  permissionId: { type: DataTypes.INTEGER, allowNull: false },
}, {
  sequelize,
  tableName: 'role_has_permissions',
  timestamps: true,
  indexes: [{ unique: true, fields: ['roleId', 'permissionId'] }],
});

export default RoleHasPermission;
