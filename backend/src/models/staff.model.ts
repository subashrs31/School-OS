import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface StaffAttributes {
  id: number;
  userId: number;
  organizationId: number;
  branchId: number | null;
  designationId: number | null;
  employeeCode: string | null;
  joiningDate: string | null;
  status: 'active' | 'inactive' | 'on_leave';
  [key: string]: unknown;
}

type StaffCreation = Optional<StaffAttributes, 'id' | 'branchId' | 'designationId' | 'employeeCode' | 'joiningDate' | 'status'>;

class Staff extends Model<StaffAttributes, StaffCreation> implements StaffAttributes {
  declare id: number;
  declare userId: number;
  declare organizationId: number;
  declare branchId: number | null;
  declare designationId: number | null;
  declare employeeCode: string | null;
  declare joiningDate: string | null;
  declare status: 'active' | 'inactive' | 'on_leave';
  [key: string]: unknown;
}

Staff.init({
  id:             { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId:         { type: DataTypes.INTEGER, allowNull: false },
  organizationId: { type: DataTypes.INTEGER, allowNull: false },
  branchId:       { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
  designationId:  { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
  employeeCode:   { type: DataTypes.STRING, allowNull: true },
  joiningDate:    { type: DataTypes.DATEONLY, allowNull: true },
  status:         { type: DataTypes.ENUM('active', 'inactive', 'on_leave'), defaultValue: 'active' },
}, {
  sequelize,
  tableName: 'staff',
  timestamps: true,
  indexes: [{ unique: true, fields: ['userId', 'organizationId'] }],
});

export default Staff;
