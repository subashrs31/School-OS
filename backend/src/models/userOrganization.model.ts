import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface UserOrganizationAttributes {
  id: number;
  userId: number;
  organizationId: number;
  branchId: number | null;
  isPrimary: boolean;
  isActive: boolean;
  [key: string]: unknown;
}

type UserOrganizationCreation = Optional<UserOrganizationAttributes, 'id' | 'branchId' | 'isPrimary' | 'isActive'>;

class UserOrganization extends Model<UserOrganizationAttributes, UserOrganizationCreation> implements UserOrganizationAttributes {
  declare id: number;
  declare userId: number;
  declare organizationId: number;
  declare branchId: number | null;
  declare isPrimary: boolean;
  declare isActive: boolean;
  [key: string]: unknown;
}

UserOrganization.init({
  id:             { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId:         { type: DataTypes.INTEGER, allowNull: false },
  organizationId: { type: DataTypes.INTEGER, allowNull: false },
  branchId:       { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
  isPrimary:      { type: DataTypes.BOOLEAN, defaultValue: false },
  isActive:       { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  sequelize,
  tableName: 'user_organizations',
  timestamps: true,
});

export default UserOrganization;
