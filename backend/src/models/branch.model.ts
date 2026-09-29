import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface BranchAttributes {
  id: number;
  organizationId: number;
  name: string;
  code: string | null;
  address: string | null;
  email: string | null;
  mobile: string | null;
  timing: string | null;
  isActive: boolean;
  [key: string]: unknown;
}

type BranchCreation = Optional<BranchAttributes, 'id' | 'code' | 'address' | 'email' | 'mobile' | 'timing' | 'isActive'>;

class Branch extends Model<BranchAttributes, BranchCreation> implements BranchAttributes {
  declare id: number;
  declare organizationId: number;
  declare name: string;
  declare code: string | null;
  declare address: string | null;
  declare email: string | null;
  declare mobile: string | null;
  declare timing: string | null;
  declare isActive: boolean;
  [key: string]: unknown;
}

Branch.init({
  id:             { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  organizationId: { type: DataTypes.INTEGER, allowNull: false },
  name:           { type: DataTypes.STRING, allowNull: false },
  code:           { type: DataTypes.STRING, allowNull: true },
  address:        { type: DataTypes.TEXT, allowNull: true },
  email:          { type: DataTypes.STRING, allowNull: true },
  mobile:         { type: DataTypes.STRING, allowNull: true },
  timing:         { type: DataTypes.STRING, allowNull: true },
  isActive:       { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  sequelize,
  tableName: 'branches',
  timestamps: true,
});

export default Branch;
