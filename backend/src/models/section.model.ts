import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface SectionAttributes {
  id: number;
  classId: number;
  name: string;
  capacity: number | null;
  isActive: boolean;
  [key: string]: unknown;
}

type SectionCreation = Optional<SectionAttributes, 'id' | 'capacity' | 'isActive'>;

class Section extends Model<SectionAttributes, SectionCreation> implements SectionAttributes {
  declare id: number;
  declare classId: number;
  declare name: string;
  declare capacity: number | null;
  declare isActive: boolean;
  [key: string]: unknown;
}

Section.init({
  id:       { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  classId:  { type: DataTypes.INTEGER, allowNull: false },
  name:     { type: DataTypes.STRING, allowNull: false },
  capacity: { type: DataTypes.INTEGER, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  sequelize,
  tableName: 'sections',
  timestamps: true,
});

export default Section;
