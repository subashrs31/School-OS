import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface AcademicYearAttributes {
  id: number;
  organizationId: number;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  isActive: boolean;
  [key: string]: unknown;
}

type AcademicYearCreation = Optional<AcademicYearAttributes, 'id' | 'isCurrent' | 'isActive'>;

class AcademicYear extends Model<AcademicYearAttributes, AcademicYearCreation> implements AcademicYearAttributes {
  declare id: number;
  declare organizationId: number;
  declare name: string;
  declare startDate: string;
  declare endDate: string;
  declare isCurrent: boolean;
  declare isActive: boolean;
  [key: string]: unknown;
}

AcademicYear.init({
  id:             { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  organizationId: { type: DataTypes.INTEGER, allowNull: false },
  name:           { type: DataTypes.STRING, allowNull: false },
  startDate:      { type: DataTypes.DATEONLY, allowNull: false },
  endDate:        { type: DataTypes.DATEONLY, allowNull: false },
  isCurrent:      { type: DataTypes.BOOLEAN, defaultValue: false },
  isActive:       { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  sequelize,
  tableName: 'academic_years',
  timestamps: true,
});

export default AcademicYear;
