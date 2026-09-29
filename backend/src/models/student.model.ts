import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface StudentAttributes {
  id: number;
  organizationId: number;
  admissionNo: string;
  name: string;
  dateOfBirth: string | null;
  gender: 'male' | 'female' | 'other' | null;
  photo: string | null;
  email: string | null;
  mobile: string | null;
  address: string | null;
  admissionDate: string | null;
  status: 'active' | 'inactive' | 'transferred' | 'graduated';
  [key: string]: unknown;
}

type StudentCreation = Optional<StudentAttributes, 'id' | 'dateOfBirth' | 'gender' | 'photo' | 'email' | 'mobile' | 'address' | 'admissionDate' | 'status'>;

class Student extends Model<StudentAttributes, StudentCreation> implements StudentAttributes {
  declare id: number;
  declare organizationId: number;
  declare admissionNo: string;
  declare name: string;
  declare dateOfBirth: string | null;
  declare gender: 'male' | 'female' | 'other' | null;
  declare photo: string | null;
  declare email: string | null;
  declare mobile: string | null;
  declare address: string | null;
  declare admissionDate: string | null;
  declare status: 'active' | 'inactive' | 'transferred' | 'graduated';
  [key: string]: unknown;
}

Student.init({
  id:             { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  organizationId: { type: DataTypes.INTEGER, allowNull: false },
  admissionNo:    { type: DataTypes.STRING, allowNull: false },
  name:           { type: DataTypes.STRING, allowNull: false },
  dateOfBirth:    { type: DataTypes.DATEONLY, allowNull: true },
  gender:         { type: DataTypes.ENUM('male', 'female', 'other'), allowNull: true },
  photo:          { type: DataTypes.STRING, allowNull: true },
  email:          { type: DataTypes.STRING, allowNull: true },
  mobile:         { type: DataTypes.STRING, allowNull: true },
  address:        { type: DataTypes.TEXT, allowNull: true },
  admissionDate:  { type: DataTypes.DATEONLY, allowNull: true },
  status:         { type: DataTypes.ENUM('active', 'inactive', 'transferred', 'graduated'), defaultValue: 'active' },
}, {
  sequelize,
  tableName: 'students',
  timestamps: true,
  indexes: [{ unique: true, fields: ['organizationId', 'admissionNo'] }],
});

export default Student;
