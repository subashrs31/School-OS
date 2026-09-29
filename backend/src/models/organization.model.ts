import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface OrganizationAttributes {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  website: string | null;
  email: string | null;
  mobile: string | null;
  schoolTiming: string | null;
  address: string | null;
  socialLinks: Record<string, string>;
  isActive: boolean;
  [key: string]: unknown;
}

type OrganizationCreation = Optional<OrganizationAttributes, 'id' | 'logo' | 'website' | 'email' | 'mobile' | 'schoolTiming' | 'address' | 'socialLinks' | 'isActive'>;

class Organization extends Model<OrganizationAttributes, OrganizationCreation> implements OrganizationAttributes {
  declare id: number;
  declare name: string;
  declare slug: string;
  declare logo: string | null;
  declare website: string | null;
  declare email: string | null;
  declare mobile: string | null;
  declare schoolTiming: string | null;
  declare address: string | null;
  declare socialLinks: Record<string, string>;
  declare isActive: boolean;
  [key: string]: unknown;
}

Organization.init({
  id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name:         { type: DataTypes.STRING, allowNull: false },
  slug:         { type: DataTypes.STRING, allowNull: false, unique: true },
  logo:         { type: DataTypes.STRING, allowNull: true },
  website:      { type: DataTypes.STRING, allowNull: true },
  email:        { type: DataTypes.STRING, allowNull: true },
  mobile:       { type: DataTypes.STRING, allowNull: true },
  schoolTiming: { type: DataTypes.STRING, allowNull: true },
  address:      { type: DataTypes.TEXT, allowNull: true },
  socialLinks:  { type: DataTypes.JSON, defaultValue: {} },
  isActive:     { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  sequelize,
  tableName: 'organizations',
  timestamps: true,
  indexes: [{ unique: true, fields: ['slug'] }],
});

export default Organization;
