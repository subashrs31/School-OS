import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';
import crypt from '../helpers/crypt';
import env from '../config/appConfig';

export interface UserAttributes {
  id: number;
  uuid: string;
  name: string | null;
  email: string;
  password: string;
  pwdResetStatus: boolean;
  lastLogin: Date | null;
  createdById: number | null;
  verificationTokenHash: string | null;
  verificationTokenExpiry: Date | null;
  resetTokenHash: string | null;
  resetTokenExpiry: Date | null;
  verifiedAt: Date | null;
  isActive: boolean;
  deletedAt: Date | null;
  [key: string]: unknown;
}

type UserCreationAttributes = Optional<UserAttributes, 'id' | 'uuid' | 'name' | 'password' | 'pwdResetStatus' | 'lastLogin' | 'createdById' | 'verificationTokenHash' | 'verificationTokenExpiry' | 'resetTokenHash' | 'resetTokenExpiry' | 'verifiedAt' | 'isActive' | 'deletedAt'>;

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: number;
  declare uuid: string;
  declare name: string | null;
  declare email: string;
  declare password: string;
  declare pwdResetStatus: boolean;
  declare lastLogin: Date | null;
  declare createdById: number | null;
  declare verificationTokenHash: string | null;
  declare verificationTokenExpiry: Date | null;
  declare resetTokenHash: string | null;
  declare resetTokenExpiry: Date | null;
  declare verifiedAt: Date | null;
  declare isActive: boolean;
  declare deletedAt: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  [key: string]: unknown;
}

User.init({
  id:                      { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  uuid:                    { type: DataTypes.STRING, allowNull: false, unique: true },
  name:                    { type: DataTypes.STRING, allowNull: true },
  email:                   { type: DataTypes.STRING, allowNull: true, unique: true },
  password:                { type: DataTypes.STRING, defaultValue: '12345678' },
  pwdResetStatus:          { type: DataTypes.BOOLEAN, defaultValue: false },
  lastLogin:               { type: DataTypes.DATE, allowNull: true },
  createdById:             { type: DataTypes.INTEGER, allowNull: true },
  verificationTokenHash:   { type: DataTypes.STRING, allowNull: true },
  verificationTokenExpiry: { type: DataTypes.DATE, allowNull: true },
  resetTokenHash:          { type: DataTypes.STRING, allowNull: true },
  resetTokenExpiry:        { type: DataTypes.DATE, allowNull: true },
  verifiedAt:              { type: DataTypes.DATE, allowNull: true },
  isActive:                { type: DataTypes.BOOLEAN, defaultValue: true },
  deletedAt:               { type: DataTypes.DATE, allowNull: true },
}, {
  sequelize,
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user: User) => {
      if (user.password) user.password = await crypt.hashPassword(user.password as string, env.SALT_ROUNDS);
    },
    beforeUpdate: async (user: User) => {
      if (user.changed('password')) user.password = await crypt.hashPassword(user.password as string, env.SALT_ROUNDS);
    },
  },
});

export default User;
